require('dotenv').config();
const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());
const PORT = process.env.SERVER_PORT || 3000

// Rotas CRUD para atendimentos
app.post('/atendimentos', async (req, res) => {
  const { funcionarioId, clienteId, status, origem } = req.body;
  try {
    const atendimento = await prisma.atendimento.create({
      data: { funcionarioId, clienteId, status, origem }
    });
    res.json(atendimento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar atendimento' });
  }
});

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

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));