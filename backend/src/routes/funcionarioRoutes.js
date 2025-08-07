const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();
const prisma = new PrismaClient();

// GET /funcionarios - Rota para listar todos os funcionários (PROTEGIDA)
router.get("/", authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
    try {
        const userIdFromToken = req.user.id || req.user.userId;

        if (!userIdFromToken) {
            return res.status(403).json({ error: "Acesso negado: ID de usuário não encontrado no token." });
        }

        const funcionarios = await prisma.funcionario.findMany({
            where: {
                userId: userIdFromToken
            },
            select: { // Removemos a seleção do campo 'time'
                id: true,
                nomeCompleto: true,
                email: true,
                userId: true,
            }
        });
        res.json(funcionarios);
    } catch (error) {
        console.error("Erro ao buscar funcionários:", error);
        res.status(500).json({ error: "Erro ao buscar funcionários" });
    }
});

// GET /funcionarios/:id/historico - Rota para histórico de atendimentos por funcionário (PROTEGIDA)
router.get("/:id/historico", authenticateToken, authorizeRoles('OWNER', 'EMPLOYEE'), async (req, res) => {
    const { id } = req.params;
    const userIdFromToken = req.user.id || req.user.userId;

    try {
        const funcionario = await prisma.funcionario.findUnique({
            where: {
                id: parseInt(id),
                userId: userIdFromToken
            },
            include: {
                atendimentos: {
                    include: { cliente: true },
                    orderBy: { data: "desc" },
                },
            },
        });

        if (!funcionario) {
            return res.status(404).json({ error: "Funcionário não encontrado ou não pertence à sua conta." });
        }

        const { senha, ...funcionarioSemSenha } = funcionario;
        res.json(funcionarioSemSenha);
    } catch (error) {
        console.error("Erro detalhado:", error);
        res.status(500).json({
            error: "Erro ao buscar histórico do funcionário",
            detalhes: error.message,
        });
    }
});

module.exports = router;
