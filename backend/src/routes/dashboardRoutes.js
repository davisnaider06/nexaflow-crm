const express = require('express');
const { PrismaClient, StatusAtendimento } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /dashboard - Rota para obter dados do dashboard (PROTEGIDA)
router.get('/', authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
  // O userId vem do token JWT, seja do OWNER ou do EMPLOYEE
  const userId = req.user.userId || req.user.id; // Se for OWNER, req.user.id; se for EMPLOYEE, req.user.userId

  // Parâmetros de filtro (opcionais)
  const { time, funcionarioId } = req.query;

  try {
    // 1. Total de Vendas Fechadas (Status: 'vendido')
    const totalVendas = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.vendido,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 2. Total de Atendimentos Aguardando Atendimento (Status: 'aguardando_atendimento')
    const totalAtendimento = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.aguardando_atendimento,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 3. Total de Atendimentos Aguardando Reunião (Status: 'aguardando_reuniao_time_tecnico')
    const totalReuniao = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.aguardando_reuniao_time_tecnico,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 4. Total de Atendimentos Aguardando Alinhamento (Status: 'aguardando_alinhamento_campanha')
    const totalAlinhamento = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.aguardando_alinhamento_campanha,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 5. Total de Atendimentos Aguardando Divulgação (Status: 'aguardando_divulgacao')
    const totalDivulgacao = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.aguardando_divulgacao,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 6. Total de Atendimentos Aguardando Resultados (Status: 'aguardando_resultados')
    const totalAguardandoResultados = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.aguardando_resultados,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 7. Total de Atendimentos Aguardando Pagamento (Status: 'aguardando_pagamento')
    const totalAguardandoPagamento = await prisma.atendimento.count({
      where: {
        userId: userId,
        status: StatusAtendimento.aguardando_pagamento,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });

    // 8. Cálculo da Taxa de Conversão (Vendas Fechadas / Total de Atendimentos)
    const totalAtendimentosGerais = await prisma.atendimento.count({
      where: {
        userId: userId,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
    });
    const conversao = totalAtendimentosGerais > 0 ? ((totalVendas / totalAtendimentosGerais) * 100).toFixed(2) : '0.00';


    // 9. Atendimentos Recentes (últimos 5)
    const recentes = await prisma.atendimento.findMany({
      where: {
        userId: userId,
        ...(funcionarioId && { funcionarioId: parseInt(funcionarioId) }),
      },
      orderBy: {
        data: 'desc',
      },
      take: 5, // Limita aos 5 mais recentes
      include: {
        cliente: {
          select: { nome: true }
        },
        funcionario: {
          select: { nomeCompleto: true }
        }
      },
    });

    res.json({
      totalVendas,
      totalAtendimento,
      totalReuniao,
      totalAlinhamento,
      totalDivulgacao,
      totalAguardandoResultados,
      totalAguardandoPagamento,
      conversao: parseFloat(conversao), // Converte para número
      recentes,
    });

  } catch (error) {
    console.error('Erro ao buscar dados do dashboard:', error);
    res.status(500).json({ error: 'Erro ao carregar dados do dashboard.' });
  }
});

module.exports = router;
