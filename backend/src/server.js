require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
const PORT = process.env.SERVER_PORT || 3000

// Rota para criar atendimentos
app.post('/atendimentos', async (req, res) => {
  const { funcionarioId, clienteId, status, origem } = req.body;
  try {
    const atendimento = await prisma.atendimento.create({
      data: { funcionarioId, clienteId, status, origem }
    });
    res.json(atendimento);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

//rota pra listar atendimentos
app.get('/atendimentos', async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany();
    res.json(atendimentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

// Rota DELETE para excluir atendimento por ID
app.delete('/atendimentos/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // verificar se o atendimento existe
    const atendimentoExistente = await prisma.atendimento.findUnique({
      where: { id: parseInt(id) },
    });

    if (!atendimentoExistente) {
      return res.status(404).json({ error: 'Atendimento não encontrado' });
    }

    // excluir o atendimento
    const atendimentoExcluido = await prisma.atendimento.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      message: 'Atendimento excluído com sucesso',
      atendimento: atendimentoExcluido
    });

  } catch (error) {
    console.error('Erro ao excluir atendimento:', error);
    res.status(500).json({ error: 'Erro ao excluir atendimento' });
  }
});

 //rota pra listar atendimento por time
app.get('/atendimentos/:time', async (req, res) => {
  const { time } = req.params;
  try {
    const atendimentos = await prisma.atendimento.findMany({
      where: { funcionario: { time } },
      include: { cliente: true, funcionario: true }
    });
    res.json(atendimentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar atendimentos' });
  }
});

// Criar novo funcionário
app.post('/funcionarios', async (req, res) => {
  const { id, nome, time } = req.body;

  try {
    const novoFuncionario = await prisma.funcionario.create({
      data: { id, nome, time }
    });

    res.status(201).json(novoFuncionario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar funcionário' });
  }
});

//Listar funcionarios
app.get('/funcionarios', async (req, res) => {
  try {
    const funcionarios = await prisma.funcionario.findMany();
    res.json(funcionarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar funcionários' });
  }
});


// rota pra criar cliente
app.post('/clientes', async (req, res) => {
  const { id, nome, contato, origem  } = req.body;
  if (!nome) return res.status(400).json({ error: 'Nome é obrigatório' });

  try {
    const cliente = await prisma.cliente.create({
      data: {id, nome, contato, origem }
    });
    res.json(cliente);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// rota pra listar todos os clientes
app.get('/clientes', async (req, res) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.json(clientes);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

//rota pra excluir cliente
app.delete('/clientes/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // verificar se o cliente existe
    const clienteExistente = await prisma.cliente.findUnique({
      where: { id: parseInt(id) },
    });

    if (!clienteExistente) {
      return res.status(404).json({ error: 'cliente não encontrado' });
    }

    // excluir o cliente
    const clienteExcluido = await prisma.cliente.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      message: 'cliente excluído com sucesso',
      cliente: clienteExcluido
    });

  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({ error: 'Erro ao cliente' });
  }
});

// rota pra historico de atendimentos por funcionario
app.get('/funcionarios/:id/historico', async (req, res) => {
  const { id } = req.params;
  try {
    const funcionario = await prisma.funcionario.findUnique({ // Note o singular
      where: { id: parseInt(id) },
      include: {
        atendimentos: {
          include: { cliente: true },
          orderBy: { data: 'desc' } // Alterado para o campo correto
        }
      }
    });

    if (!funcionario) {
      return res.status(404).json({ error: 'Funcionário não encontrado' });
    }

    res.json(funcionario); // Corrigido o nome da variável
  } catch (error) {
    console.error('Erro detalhado:', error); // Log mais informativo
    res.status(500).json({ 
      error: 'Erro ao buscar histórico do funcionário',
      detalhes: error.message // Retorna a mensagem de erro específica
    });
  }
});


app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));