const jwt = require('jsonwebtoken');
const User = require('../model/user');
require('dotenv').config();

// Middleware para verificar token JWT
exports.authenticate = async (req, res, next) => {
  try {
    // Verificar se o token está presente no header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'Acesso não autorizado. Token não fornecido.' 
      });
    }

    // Extrair o token do header
    const token = authHeader.split(' ')[1];
    
    // Verificar e decodificar o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar o usuário pelo ID
    const user = await User.findById(decoded.id);
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Usuário não encontrado ou token inválido.' 
      });
    }
    
    // Adicionar o usuário ao objeto de requisição
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expirado. Faça login novamente.' 
      });
    }
    
    return res.status(500).json({ 
      success: false, 
      message: 'Erro interno do servidor.', 
      error: error.message 
    });
  }
};

// Middleware para verificar permissões de admin
exports.isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ 
      success: false, 
      message: 'Acesso negado. Permissão de administrador necessária.' 
    });
  }
}; 