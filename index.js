const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

// Importar banco de dados
const db = require('./database/db.js');

// Importar rotas
const tasksRoutes = require('./routes/tasksRoutes.js');
const personRoutes = require('./routes/personRoutes.js');
const profileRoutes = require('./routes/profileRoutes.js');
const projectRoutes = require('./routes/projectRoutes.js');
const authRoutes = require('./routes/authRoutes.js');

// Inicializar aplicação
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Rotas da API REST
app.use('/api', authRoutes);
app.use('/api', tasksRoutes);
app.use('/api', personRoutes);
app.use('/api', profileRoutes);
app.use('/api', projectRoutes);

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Erro interno do servidor',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Iniciar servidor
const port = process.env.PORT || 3000;

// Usar o método moderno para iniciar o servidor
const server = app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});

// Adicionar tratamento de erros para o servidor
server.on('error', (error) => {
  console.error('Erro ao iniciar o servidor:', error);
  process.exit(1);
});

// Adicionar tratamento para encerramento gracioso
process.on('SIGTERM', () => {
  console.log('SIGTERM recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT recebido. Encerrando servidor...');
  server.close(() => {
    console.log('Servidor encerrado');
    process.exit(0);
  });
});
