const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// POST /clientes - Rota para cadastrar um novo cliente (PROTEGIDA)
router.post('/', authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
  const { nome, contato, origem } = req.body;
  const userId = req.user.userId || req.user.id; // Pega o userId do dono da conta
  let criadoPorId = null;

  // Verifica se o usuário logado é um funcionário e adiciona o ID dele
  if (req.user.userRole === 'EMPLOYEE') {
    criadoPorId = req.user.id;
  }

  if (!nome) {
    return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
  }

  try {
    const novoCliente = await prisma.cliente.create({
      data: {
        nome,
        contato: contato || null,
        origem: origem || null,
        userId: userId,
        criadoPorId: criadoPorId, // NOVO: Salva o ID do criador, se for um funcionário
      },
    });
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!', cliente: novoCliente });
  } catch (error) {
    console.error('Erro ao cadastrar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar cliente.' });
  }
});

// GET /clientes - Rota para listar todos os clientes da conta do usuário logado (PROTEGIDA)
router.get('/', authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
  const userId = req.user.userId || req.user.id; // Pega o userId do dono da conta
  const { search } = req.query;

  try {
    const clientes = await prisma.cliente.findMany({
      where: {
        userId: userId,
        ...(search && {
          OR: [
            { nome: { contains: search, mode: 'insensitive' } },
            { contato: { contains: search, mode: 'insensitive' } },
            { origem: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      orderBy: { nome: 'asc' },
      // NOVO: Inclui a relação para obter o nome do funcionário que criou o cliente
      include: {
        criadoPor: {
          select: {
            nomeCompleto: true,
            id: true
          }
        },
      },
    });
    res.json(clientes);
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({ error: 'Erro ao buscar clientes.' });
  }
});

// GET /clientes/:id - Rota para obter um cliente específico (PROTEGIDA)
router.get('/:id', authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId || req.user.id;

  try {
    const cliente = await prisma.cliente.findUnique({
      where: {
        id: parseInt(id),
        userId: userId,
      },
      include: {
        criadoPor: { // NOVO: Inclui o criador
            select: { nomeCompleto: true, id: true }
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence à sua conta.' });
    }
    res.json(cliente);
  } catch (error) {
    console.error('Erro ao buscar cliente por ID:', error);
    res.status(500).json({ error: 'Erro ao buscar cliente.' });
  }
});

// PUT /clientes/:id - Rota para atualizar um cliente (PROTEGIDA)
router.put('/:id', authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
  const { id } = req.params;
  const { nome, contato, origem } = req.body;
  const userId = req.user.userId || req.user.id;

  if (!nome) {
    return res.status(400).json({ error: 'O nome do cliente é obrigatório.' });
  }

  try {
    const updatedCliente = await prisma.cliente.updateMany({
      where: {
        id: parseInt(id),
        userId: userId,
      },
      data: {
        nome,
        contato: contato || null,
        origem: origem || null,
      },
    });

    if (updatedCliente.count === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence à sua conta.' });
    }

    const cliente = await prisma.cliente.findUnique({ 
        where: { id: parseInt(id) },
        include: { criador: { select: { nomeCompleto: true } } }
    });
    res.json({ message: 'Cliente atualizado com sucesso!', cliente: cliente });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao atualizar cliente.' });
  }
});

// DELETE /clientes/:id - Rota para excluir um cliente (PROTEGIDA)
router.delete('/:id', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
  const { id } = req.params;
  const userId = req.user.userId || req.user.id;

  try {
    const clienteToDelete = await prisma.cliente.findUnique({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });

    if (!clienteToDelete) {
      return res.status(404).json({ error: 'Cliente não encontrado ou não pertence à sua conta.' });
    }

    await prisma.atendimento.deleteMany({
      where: {
        clienteId: parseInt(id),
        userId: userId,
      },
    });

    await prisma.cliente.delete({
      where: {
        id: parseInt(id),
        userId: userId,
      },
    });
    res.status(200).json({ message: 'Cliente excluído com sucesso!' });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao excluir cliente.' });
  }
});

module.exports = router;
