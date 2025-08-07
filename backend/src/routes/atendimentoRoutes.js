const express = require('express');
const { PrismaClient } = require('@prisma/client');
// const authenticateToken = require('../middleware/authMiddleware'); // Importe se for proteger estas rotas

const router = express.Router(); // Cria um novo roteador Express
const prisma = new PrismaClient(); // Instancia o Prisma Client

// Rota para criar atendimentos
// Esta rota foi corrigida para incluir o userId e remover o campo 'origem'.
router.post("/", async (req, res) => {
  const statusPermitidos = [
    "aguardando_atendimento",
    "aguardando_reuniao_time_tecnico",
    "aguardando_alinhamento_campanha",
    "aguardando_divulgacao",
    "aguardando_resultados",
    "aguardando_pagamento",
    "vendido"
  ];

  // A rota agora espera 'descricao' e não mais 'origem'
  // userId deve vir do token de autenticação, não do corpo da requisição.
  const { funcionarioId, clienteId, status, descricao } = req.body;

  // IMPORTANTE: Adicione um placeholder para o userId.
  // Em uma aplicação real, você obteria isso do token de autenticação.
  // Exemplo: const userId = req.user.id;
  const userId = 1; // Substitua por um ID de usuário válido para testar.

  // Verificação de validação de dados
  if (!funcionarioId || !clienteId || !status || !userId) {
    return res.status(400).json({ error: "Dados incompletos para criar um atendimento." });
  }

  if (!statusPermitidos.includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  try {
    const atendimento = await prisma.atendimento.create({
      data: { 
        funcionarioId, 
        clienteId, 
        status, 
        descricao, // 'descricao' agora é aceito
        userId, // O 'userId' agora é incluído na criação
      },
    });

    res.status(201).json(atendimento);
  } catch (error) {
    console.error("Erro ao criar atendimento:", error);
    res.status(500).json({ error: "Erro ao criar atendimento" });
  }
});

// Rota para listar atendimentos
router.get("/", async (req, res) => {
  try {
    const atendimentos = await prisma.atendimento.findMany();
    res.json(atendimentos);
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    res.status(500).json({ error: "Erro ao buscar atendimentos" });
  }
});

// Rota DELETE para excluir atendimento por ID
router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const atendimentoExistente = await prisma.atendimento.findUnique({
      where: { id: parseInt(id) },
    });

    if (!atendimentoExistente) {
      return res.status(404).json({ error: "Atendimento não encontrado" });
    }

    const atendimentoExcluido = await prisma.atendimento.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      message: "Atendimento excluído com sucesso",
      atendimento: atendimentoExcluido,
    });
  } catch (error) {
    console.error("Erro ao excluir atendimento:", error);
    res.status(500).json({ error: "Erro ao excluir atendimento" });
  }
});

// Rota para listar atendimento por time
router.get("/:time", async (req, res) => {
  const { time } = req.params;
  try {
    const atendimentos = await prisma.atendimento.findMany({
      where: { funcionario: { time } },
      include: { cliente: true, funcionario: true },
    });
    res.json(atendimentos);
  } catch (error) {
    console.error("Erro ao buscar atendimentos:", error);
    res.status(500).json({ error: "Erro ao buscar atendimentos" });
  }
});

module.exports = router; // Exporta o roteador
