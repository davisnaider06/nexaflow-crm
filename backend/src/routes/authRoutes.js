const express = require('express');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();
const prisma = new PrismaClient();

// --- Rota para o Dono/Administrador se Cadastrar (Primeiro Usuário do CRM) ---
// POST /register-owner
router.post('/register-owner', async (req, res) => {
  // Alterado nomeEmpresa para nome para coincidir com o schema.prisma
  const { email, senha, nome } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios para o cadastro do dono da conta.' });
  }

  try {
    const existingUser = await prisma.users.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'Este email de dono de conta já está cadastrado.' });
    }

    const hashedPassword = await bcrypt.hash(senha, 10);

    const newUser = await prisma.users.create({
      data: {
        email,
        senha: hashedPassword,
        nome: nome || null, // CORREÇÃO: Utiliza o campo 'nome' que existe no modelo 'Users'
      },
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não está definido nas variáveis de ambiente!');
      return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    const token = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
        userRole: 'OWNER', // Alterado de 'role' para 'userRole' para consistência
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(201).json({
      message: 'Dono da conta cadastrado com sucesso!',
      token: token,
      user: {
        id: newUser.id,
        email: newUser.email,
        nome: newUser.nome, // CORREÇÃO: Usa 'nome' em vez de 'nomeEmpresa'
        userRole: 'OWNER', // Alterado de 'role' para 'userRole'
      },
    });

  } catch (error) {
    console.error('Erro ao cadastrar dono da conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao cadastrar dono da conta.' });
  }
});

// --- Rota para o Dono/Administrador fazer Login ---
// POST /login-owner
router.post('/login-owner', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios para o login do dono da conta.' });
  }

  try {
    const user = await prisma.users.findUnique({
      where: { email: email },
    });

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas para o dono da conta.' });
    }

    const isPasswordValid = await bcrypt.compare(senha, user.senha);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas para o dono da conta.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não está definido nas variáveis de ambiente!');
      return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        userRole: 'OWNER', // Alterado de 'role' para 'userRole' para consistência
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login do dono da conta realizado com sucesso!',
      token: token,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome, // CORREÇÃO: Usa 'nome' em vez de 'nomeEmpresa'
        userRole: 'OWNER', // Alterado de 'role' para 'userRole'
      },
    });

  } catch (error) {
    console.error('Erro ao fazer login do dono da conta:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao tentar fazer login do dono da conta.' });
  }
});

// --- Rota para Colaboradores/Funcionários fazerem Login ---
// POST /login-employee
router.post('/login-employee', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios para o login do funcionário.' });
  }

  try {
    const funcionario = await prisma.funcionario.findUnique({
      where: { email: email },
    });

    if (!funcionario) {
      return res.status(401).json({ error: 'Credenciais inválidas para o funcionário.' });
    }

    const isPasswordValid = await bcrypt.compare(senha, funcionario.senha);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Credenciais inválidas para o funcionário.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('JWT_SECRET não está definido nas variáveis de ambiente!');
      return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    const token = jwt.sign(
      {
        id: funcionario.id,
        email: funcionario.email,
        // time: funcionario.time, // Removido, pois não existe no schema atual
        userId: funcionario.userId,
        userRole: 'EMPLOYEE', // Alterado de 'role' para 'userRole'
      },
      jwtSecret,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login do funcionário realizado com sucesso!',
      token: token,
      funcionario: {
        id: funcionario.id,
        nomeCompleto: funcionario.nomeCompleto,
        email: funcionario.email,
        // time: funcionario.time, // Removido
        userId: funcionario.userId,
        userRole: 'EMPLOYEE', // Alterado de 'role' para 'userRole'
      },
    });

  } catch (error) {
    console.error('Erro ao fazer login do funcionário:', error);
    res.status(500).json({ error: 'Erro interno do servidor ao tentar fazer login do funcionário.' });
  }
});

module.exports = router;
