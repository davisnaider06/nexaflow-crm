const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware'); // Importa ambos

const router = express.Router();
const prisma = new PrismaClient();

// --- Rota para o Dono/Administrador cadastrar um novo Funcionário ---
// POST /admin/funcionarios
router.post('/funcionarios', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
  const { nomeCompleto, email, senha, time } = req.body;
  const userId = req.user.id; // O ID do dono da conta vem do token JWT

  if (!nomeCompleto || !email || !senha || !time) {
    return res.status(400).json({ error: 'Todos os campos (nomeCompleto, email, senha, time) são obrigatórios.' });
  }

  try {
    const existingFuncionario = await prisma.funcionario.findUnique({
      where: { email: email },
    });

    if (existingFuncionario) {
      return res.status(409).json({ error: 'Este email já está cadastrado como funcionário.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const novoFuncionario = await prisma.funcionario.create({
      data: {
        nomeCompleto,
        email,
        senha: hashedPassword,
        time,
        userId: userId, // Vincula o funcionário ao dono da conta logado
      },
    });

    res.status(201).json({
      message: 'Funcionário cadastrado com sucesso!',
      funcionario: {
        id: novoFuncionario.id,
        nomeCompleto: novoFuncionario.nomeCompleto,
        email: novoFuncionario.email,
        time: novoFuncionario.time,
        userId: novoFuncionario.userId,
      },
    });

  } catch (error) {
    console.error('Erro ao cadastrar funcionário pelo administrador:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar funcionário.' });
  }
});

// --- Rota para o Dono/Administrador listar todos os Funcionários da sua conta ---
// GET /admin/funcionarios
router.get('/funcionarios', authenticateToken, authorizeRoles('OWNER'), async (req, res) => {
  const userId = req.user.id; // O ID do dono da conta vem do token JWT

  try {
    const funcionarios = await prisma.funcionario.findMany({
      where: { userId: userId }, // Filtra funcionários pela conta do dono logado
      select: { // Seleciona apenas os campos que queremos retornar (sem a senha)
        id: true,
        nomeCompleto: true,
        email: true,
        time: true,
        userId: true,
      }
    });
    res.json(funcionarios);
  } catch (error) {
    console.error('Erro ao listar funcionários para o administrador:', error);
    res.status(500).json({ error: 'Erro ao buscar funcionários.' });
  }
});


module.exports = router;
