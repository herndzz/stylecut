import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { Database } from './database.js';
import clientsRouter from './routes/clients.js';
import servicesRouter from './routes/services.js';
import professionalsRouter from './routes/professionals.js';
import appointmentsRouter from './routes/appointments.js';

// Carregar variáveis de ambiente
config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Log das configurações de desenvolvimento
if (process.env.NODE_ENV === 'development') {
  console.log('🔧 Configurações do banco:');
  console.log(`   Host: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  console.log(`   Database: ${process.env.DB_NAME}`);
  console.log(`   User: ${process.env.DB_USER}`);
  console.log(`   SSL: ${process.env.DB_SSL}`);
}

// Inicializar banco de dados
const database = new Database();
await database.init();

// Middleware para disponibilizar instância do banco
app.use((req, res, next) => {
  req.db = database;
  next();
});

// Rotas
app.use('/api/clients', clientsRouter);
app.use('/api/services', servicesRouter);
app.use('/api/professionals', professionalsRouter);
app.use('/api/appointments', appointmentsRouter);

// Health check com informações detalhadas do banco
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    database: database.currentDatabase,
    postgresConnected: database.isPostgresConnected,
    connectionAttempts: database.connectionAttempts,
    environment: process.env.NODE_ENV,
    server: {
      port: PORT,
      host: process.env.DB_HOST,
      dbPort: process.env.DB_PORT
    }
  });
});

// Endpoint para forçar reconexão com PostgreSQL
app.post('/api/reconnect', async (req, res) => {
  try {
    await database.reconnectPostgreSQL();
    res.json({ 
      success: true, 
      message: 'Tentativa de reconexão concluída',
      connected: database.isPostgresConnected 
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Erro na tentativa de reconexão', 
      details: error.message 
    });
  }
});

// Endpoint para verificar status da conexão
app.get('/api/status', (req, res) => {
  res.json({
    database: database.currentDatabase,
    postgresConnected: database.isPostgresConnected,
    connectionAttempts: database.connectionAttempts,
    maxAttempts: database.maxAttempts,
    canReconnect: !database.isPostgresConnected
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Algo deu errado!', 
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Rota não encontrada',
    path: req.originalUrl,
    timestamp: new Date().toISOString()
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n🔄 Recebido sinal ${signal}. Encerrando servidor graciosamente...`);
  await database.close();
  console.log('👋 Servidor encerrado com sucesso');
  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

app.listen(PORT, () => {
  console.log(`🚀 Servidor StyleCut rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`💾 Banco de dados: ${database.currentDatabase}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV}`);
  if (database.isPostgresConnected) {
    console.log(`🐘 PostgreSQL conectado em ${process.env.DB_HOST}:${process.env.DB_PORT}`);
  }
});

export default app;
