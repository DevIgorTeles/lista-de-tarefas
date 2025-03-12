const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const authController = require('../controller/authController');
const { authenticate } = require('../middleware/auth');

// Validação para registro
const registerValidation = [
  check('username', 'Nome de usuário é obrigatório').not().isEmpty(),
  check('username', 'Nome de usuário deve ter pelo menos 3 caracteres').isLength({ min: 3 }),
  check('email', 'Por favor, inclua um email válido').isEmail(),
  check('password', 'Por favor, digite uma senha com 6 ou mais caracteres').isLength({ min: 6 })
];

// Validação para login
const loginValidation = [
  check('email', 'Por favor, inclua um email válido').isEmail(),
  check('password', 'Senha é obrigatória').exists()
];

// Rota para registro de usuário
router.post('/register', registerValidation, authController.register);

// Rota para login de usuário
router.post('/login', loginValidation, authController.login);

// Rota para obter perfil do usuário (protegida)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router; 