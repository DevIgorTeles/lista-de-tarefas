// Servidor simples usando apenas módulos nativos do Node.js
const http = require('http');
const fs = require('fs');
const path = require('path');

// Porta do servidor
const PORT = process.env.PORT || 3000;

// Criar servidor HTTP
const server = http.createServer((req, res) => {
  // Definir cabeçalhos para CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Lidar com requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Rota principal
  if (req.url === '/' || req.url === '/api') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: 'API de Lista de Tarefas',
      version: '1.0.0',
      nodeVersion: process.version,
      endpoints: {
        rest: '/api/...',
        graphql: '/graphql'
      },
      status: 'Servidor funcionando com Node.js nativo'
    }));
    return;
  }
  
  // Rota para servir o README.md
  if (req.url === '/readme') {
    try {
      const readmePath = path.join(__dirname, 'README.md');
      if (fs.existsSync(readmePath)) {
        const readme = fs.readFileSync(readmePath, 'utf8');
        res.setHeader('Content-Type', 'text/plain');
        res.statusCode = 200;
        res.end(readme);
      } else {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: 'README.md não encontrado' }));
      }
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Erro ao ler README.md' }));
    }
    return;
  }
  
  // Rota para listar arquivos do projeto
  if (req.url === '/files') {
    try {
      const files = [];
      
      // Função para listar arquivos recursivamente
      function listFiles(dir, baseDir = '') {
        const items = fs.readdirSync(dir);
        
        for (const item of items) {
          const itemPath = path.join(dir, item);
          const relativePath = path.join(baseDir, item);
          
          if (item === 'node_modules' || item.startsWith('.')) {
            continue; // Ignorar node_modules e arquivos/pastas ocultos
          }
          
          const stats = fs.statSync(itemPath);
          
          if (stats.isDirectory()) {
            files.push({ type: 'directory', path: relativePath });
            listFiles(itemPath, relativePath);
          } else {
            files.push({ 
              type: 'file', 
              path: relativePath,
              size: stats.size,
              modified: stats.mtime
            });
          }
        }
      }
      
      listFiles(__dirname);
      
      res.setHeader('Content-Type', 'application/json');
      res.statusCode = 200;
      res.end(JSON.stringify({ files }));
    } catch (error) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Erro ao listar arquivos' }));
    }
    return;
  }
  
  // Rota para verificar o status do MongoDB
  if (req.url === '/db-status') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify({
      message: 'Verificação de banco de dados',
      status: 'Não foi possível conectar ao MongoDB',
      reason: 'Módulo mongoose não está disponível'
    }));
    return;
  }
  
  // Rota 404 para todas as outras requisições
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 404;
  res.end(JSON.stringify({
    error: 'Rota não encontrada',
    availableRoutes: ['/', '/readme', '/files', '/db-status']
  }));
});

// Iniciar o servidor
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Node.js versão ${process.version}`);
  console.log('Rotas disponíveis:');
  console.log('- / ou /api: Informações da API');
  console.log('- /readme: Conteúdo do README.md');
  console.log('- /files: Lista de arquivos do projeto');
  console.log('- /db-status: Status do banco de dados');
});

// Tratamento de erros do servidor
server.on('error', (error) => {
  console.error('Erro no servidor:', error);
  process.exit(1);
});

// Tratamento para encerramento gracioso
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