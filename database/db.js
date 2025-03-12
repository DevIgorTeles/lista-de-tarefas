const mongoose = require('mongoose');
require('dotenv').config();

class Database {
  constructor() {
    this._connect();
  }
  
  async _connect() {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        // Opções modernas para o Mongoose com Node.js 23
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });
      console.log('Conexão com o banco de dados estabelecida com sucesso');
    } catch (err) {
      console.error('Erro na conexão com o banco de dados:', err);
      // Tentar reconectar após um tempo
      setTimeout(() => this._connect(), 5000);
    }
  }
}

module.exports = new Database();


