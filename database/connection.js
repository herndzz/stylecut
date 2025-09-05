import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

class DatabaseConnection {
  constructor() {
    this.pool = new Pool({
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5433, 
      database: process.env.DB_NAME || 'stylecut_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'stylecut123',
      ssl: false,
      connectionTimeoutMillis: 3000,
      idleTimeoutMillis: 30000,
      max: 10
    });
    
    this.isConnected = false;
    this.testConnection();
  }

  async testConnection() {
    try {
      console.log('🔄 Testando conexão com PostgreSQL...');
      const client = await this.pool.connect();
      await client.query('SELECT NOW()');
      client.release();
      
      this.isConnected = true;
      console.log('✅ PostgreSQL conectado com sucesso!');
      
      // Testar se o banco existe
      const dbTest = await this.query('SELECT current_database()');
      console.log(`📊 Conectado ao banco: ${dbTest.rows[0].current_database}`);
      
    } catch (error) {
      this.isConnected = false;
      console.error('❌ Erro de conexão PostgreSQL:', error.message);
      console.warn('⚠️ Sistema funcionará em modo localStorage');
      
      // Tentar reconectar em 10 segundos
      setTimeout(() => {
        console.log('🔄 Tentando reconectar...');
        this.testConnection();
      }, 10000);
    }
  }

  async query(text, params) {
    if (!this.isConnected) {
      throw new Error('Database offline');
    }
    
    try {
      return await this.pool.query(text, params);
    } catch (error) {
      console.error('❌ Erro na query:', error.message);
      this.isConnected = false;
      throw error;
    }
  }

  async close() {
    await this.pool.end();
  }
}

export const db = new DatabaseConnection();