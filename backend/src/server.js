require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

// Importa os middlewares
const { authenticateToken, authorizeRoles } = require('./middleware/authMiddleware');

// Importa as rotas modularizadas
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const funcionarioRoutes = require('./routes/funcionarioRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const atendimentoRoutes = require('./routes/atendimentoRoutes');


const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
const PORT = process.env.SERVER_PORT || 3000;

// --- Uso das Rotas ---
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/dashboard', dashboardRoutes); 
app.use('/api/clientes', clienteRoutes); 
app.use('/api/atendimentos', atendimentoRoutes);
// Inicia o servidor
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
