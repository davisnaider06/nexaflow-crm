const jwt = require('jsonwebtoken');

// Middleware para autenticar o token JWT
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        // Se não há token, é um pedido não autenticado (401)
        return res.status(401).json({ error: 'Token de autenticação não fornecido.' });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        console.error('JWT_SECRET não está definido nas variáveis de ambiente!');
        return res.status(500).json({ error: 'Erro de configuração do servidor.' });
    }

    jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
            // Se o token expirou, devolve 401 para redirecionar para o login
            if (err.name === 'TokenExpiredError') {
                console.error('Erro na verificação do token:', err);
                return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
            }
            // Para outros erros (token inválido, etc.), devolve 403
            console.error('Erro na verificação do token:', err);
            return res.status(403).json({ error: 'Token de autenticação inválido.' });
        }
        
        // Se o token é válido, anexa as informações do usuário à requisição
        req.user = user; 
        next();
    });
}

// Middleware para autorizar acesso baseado em papéis
function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
        if (!req.user || !req.user.userRole) { // Ajuste: usar req.user.userRole
            return res.status(403).json({ error: 'Acesso negado: Papel do usuário não definido.' });
        }
        
        if (allowedRoles.includes(req.user.userRole)) { // Ajuste: usar req.user.userRole
            next();
        } else {
            res.status(403).json({ error: 'Acesso negado: Você não tem permissão para realizar esta ação.' });
        }
    };
}

module.exports = { authenticateToken, authorizeRoles };
