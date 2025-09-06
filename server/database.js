import pg from 'pg';
import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

// Carregar variáveis de ambiente
config();

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Database {
  constructor() {
    this.pgPool = null;
    this.sqliteDb = null;
    this.isPostgresConnected = false;
    this.usePostgres = true;
    this.connectionAttempts = 0;
    this.maxAttempts = parseInt(process.env.DB_MAX_ATTEMPTS) || 5;
  }

  async init() {
    console.log('🔄 Inicializando conexões com banco de dados...');
    
    // Tentar conectar ao PostgreSQL primeiro
    await this.initPostgreSQL();
    
    // Sempre inicializar SQLite como fallback
    await this.initSQLite();
    
    console.log(`✅ Banco de dados inicializado. Usando: ${this.isPostgresConnected ? 'PostgreSQL' : 'SQLite (offline)'}`);
  }

  async initPostgreSQL() {
    const connectionConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5433,
      database: process.env.DB_NAME || 'stylecut_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'stylecut123',
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
      max: parseInt(process.env.DB_POOL_SIZE) || 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: parseInt(process.env.DB_TIMEOUT) || 3000,
    };

    while (this.connectionAttempts < this.maxAttempts && !this.isPostgresConnected) {
      try {
        this.connectionAttempts++;
        console.log(`🔄 Tentativa ${this.connectionAttempts}/${this.maxAttempts} de conexão com PostgreSQL...`);
        
        this.pgPool = new Pool(connectionConfig);
        
        // Testar conexão
        const client = await this.pgPool.connect();
        await client.query('SELECT NOW()');
        client.release();
        
        this.isPostgresConnected = true;
        console.log('✅ Conectado ao PostgreSQL com sucesso!');
        console.log(`📊 Configuração: ${connectionConfig.user}@${connectionConfig.host}:${connectionConfig.port}/${connectionConfig.database}`);
        
        // Criar tabelas no PostgreSQL
        await this.createPostgreSQLTables();
        break;
        
      } catch (error) {
        console.warn(`⚠️  Tentativa ${this.connectionAttempts} falhou:`, error.message);
        
        if (this.pgPool) {
          await this.pgPool.end().catch(() => {});
          this.pgPool = null;
        }
        
        if (this.connectionAttempts < this.maxAttempts) {
          console.log('🔄 Aguardando 2 segundos antes da próxima tentativa...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } else {
          console.error('❌ Todas as tentativas de conexão com PostgreSQL falharam');
          console.log('🔄 Continuando com SQLite como fallback...');
          this.isPostgresConnected = false;
          this.usePostgres = false;
        }
      }
    }
  }

  async initSQLite() {
    const dbPath = path.join(__dirname, 'stylecut_offline.db');
    
    this.sqliteDb = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Erro ao conectar com SQLite:', err.message);
        throw err;
      }
      if (!this.isPostgresConnected) {
        console.log('✅ Conectado ao SQLite (modo offline)');
      }
    });

    // Promisificar métodos do SQLite
    this.sqliteRun = promisify(this.sqliteDb.run.bind(this.sqliteDb));
    this.sqliteGet = promisify(this.sqliteDb.get.bind(this.sqliteDb));
    this.sqliteAll = promisify(this.sqliteDb.all.bind(this.sqliteDb));

    // Criar tabelas no SQLite
    await this.createSQLiteTables();
  }

  async createPostgreSQLTables() {
    const client = await this.pgPool.connect();
    
    try {
      console.log('🔄 Criando/verificando tabelas no PostgreSQL...');
      
      // Habilitar extensão para UUIDs
      await client.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
      
      // Tabela de clientes
      await client.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de serviços
      await client.query(`
        CREATE TABLE IF NOT EXISTS services (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          price DECIMAL(10,2) NOT NULL,
          duration INTEGER NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de profissionais
      await client.query(`
        CREATE TABLE IF NOT EXISTS professionals (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          phone VARCHAR(20) NOT NULL UNIQUE,
          email VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Tabela de relacionamento profissional-serviço
      await client.query(`
        CREATE TABLE IF NOT EXISTS professional_services (
          professional_id UUID REFERENCES professionals(id) ON DELETE CASCADE,
          service_id UUID REFERENCES services(id) ON DELETE CASCADE,
          PRIMARY KEY (professional_id, service_id)
        )
      `);

      // Tabela de agendamentos
      await client.query(`
        CREATE TABLE IF NOT EXISTS appointments (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          client_id UUID NOT NULL REFERENCES clients(id),
          professional_id UUID NOT NULL REFERENCES professionals(id),
          service_id UUID NOT NULL REFERENCES services(id),
          date DATE NOT NULL,
          time TIME NOT NULL,
          status VARCHAR(20) DEFAULT 'scheduled',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT valid_status CHECK (status IN ('scheduled', 'completed', 'cancelled'))
        )
      `);

      // Índices para performance
      await client.query('CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_professionals_phone ON professionals(phone)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(date)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_professional_date ON appointments(professional_id, date)');
      await client.query('CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(date, time)');

      // Função para atualizar updated_at
      await client.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
          NEW.updated_at = CURRENT_TIMESTAMP;
          RETURN NEW;
        END;
        $$ language 'plpgsql'
      `);

      // Aplicar triggers
      const tables = ['clients', 'services', 'professionals', 'appointments'];
      for (const table of tables) {
        await client.query(`
          DROP TRIGGER IF EXISTS update_${table}_updated_at ON ${table};
          CREATE TRIGGER update_${table}_updated_at 
            BEFORE UPDATE ON ${table} 
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column()
        `);
      }

      // Inserir dados de exemplo se não existirem
      const serviceCount = await client.query('SELECT COUNT(*) FROM services');
      if (parseInt(serviceCount.rows[0].count) === 0) {
        console.log('📝 Inserindo dados de exemplo...');
        await client.query(`
          INSERT INTO services (name, price, duration) VALUES 
          ('Corte Masculino', 25.00, 30),
          ('Corte Feminino', 45.00, 60),
          ('Barba', 15.00, 20),
          ('Manicure', 20.00, 45),
          ('Pedicure', 25.00, 60),
          ('Escova', 30.00, 45),
          ('Hidratação', 35.00, 60)
        `);
      }

      console.log('✅ Tabelas PostgreSQL criadas/verificadas com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao criar tabelas PostgreSQL:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async createSQLiteTables() {
    try {
      await this.sqliteRun(`
        CREATE TABLE IF NOT EXISTS clients (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL UNIQUE,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.sqliteRun(`
        CREATE TABLE IF NOT EXISTS services (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          price REAL NOT NULL,
          duration INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.sqliteRun(`
        CREATE TABLE IF NOT EXISTS professionals (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          phone TEXT NOT NULL UNIQUE,
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      await this.sqliteRun(`
        CREATE TABLE IF NOT EXISTS professional_services (
          professional_id TEXT,
          service_id TEXT,
          PRIMARY KEY (professional_id, service_id),
          FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
        )
      `);

      await this.sqliteRun(`
        CREATE TABLE IF NOT EXISTS appointments (
          id TEXT PRIMARY KEY,
          client_id TEXT NOT NULL,
          professional_id TEXT NOT NULL,
          service_id TEXT NOT NULL,
          date TEXT NOT NULL,
          time TEXT NOT NULL,
          status TEXT DEFAULT 'scheduled',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (professional_id) REFERENCES professionals(id),
          FOREIGN KEY (service_id) REFERENCES services(id)
        )
      `);

      // Inserir dados de exemplo no SQLite se não existirem
      const serviceCount = await this.sqliteGet('SELECT COUNT(*) as count FROM services');
      if (serviceCount.count === 0) {
        console.log('📝 Inserindo dados de exemplo no SQLite...');
        const services = [
          { id: '1', name: 'Corte Masculino', price: 25.00, duration: 30 },
          { id: '2', name: 'Corte Feminino', price: 45.00, duration: 60 },
          { id: '3', name: 'Barba', price: 15.00, duration: 20 },
          { id: '4', name: 'Manicure', price: 20.00, duration: 45 },
          { id: '5', name: 'Pedicure', price: 25.00, duration: 60 },
          { id: '6', name: 'Escova', price: 30.00, duration: 45 },
          { id: '7', name: 'Hidratação', price: 35.00, duration: 60 }
        ];
        
        for (const service of services) {
          await this.sqliteRun(
            'INSERT INTO services (id, name, price, duration) VALUES (?, ?, ?, ?)',
            [service.id, service.name, service.price, service.duration]
          );
        }
      }

      if (!this.isPostgresConnected) {
        console.log('✅ Tabelas SQLite criadas/verificadas com sucesso');
      }
    } catch (error) {
      console.error('❌ Erro ao criar tabelas SQLite:', error);
      throw error;
    }
  }

  // Método helper para converter SQL do SQLite para PostgreSQL
  convertSqlForPostgres(sql, params = []) {
    if (!this.isPostgresConnected) {
      return { sql, params };
    }
    
    // Converter ? para $1, $2, etc.
    let paramIndex = 1;
    const pgSql = sql.replace(/\?/g, () => `$${paramIndex++}`);
    
    return { sql: pgSql, params };
  }

  // Métodos universais que escolhem automaticamente o banco correto
  async query(sql, params = []) {
    if (this.isPostgresConnected && this.usePostgres) {
      const { sql: pgSql, params: pgParams } = this.convertSqlForPostgres(sql, params);
      return await this.pgQuery(pgSql, pgParams);
    } else {
      return await this.sqliteQuery(sql, params);
    }
  }

  async get(sql, params = []) {
    if (this.isPostgresConnected && this.usePostgres) {
      const { sql: pgSql, params: pgParams } = this.convertSqlForPostgres(sql, params);
      const result = await this.pgQuery(pgSql, pgParams);
      return result.rows[0] || null;
    } else {
      return await this.sqliteGet(sql, params);
    }
  }

  async all(sql, params = []) {
    if (this.isPostgresConnected && this.usePostgres) {
      const { sql: pgSql, params: pgParams } = this.convertSqlForPostgres(sql, params);
      const result = await this.pgQuery(pgSql, pgParams);
      return result.rows;
    } else {
      return await this.sqliteAll(sql, params);
    }
  }

  async run(sql, params = []) {
    if (this.isPostgresConnected && this.usePostgres) {
      const { sql: pgSql, params: pgParams } = this.convertSqlForPostgres(sql, params);
      const result = await this.pgQuery(pgSql, pgParams);
      return result;
    } else {
      return await this.sqliteRun(sql, params);
    }
  }

  // Métodos específicos do PostgreSQL
  async pgQuery(sql, params = []) {
    const client = await this.pgPool.connect();
    try {
      const result = await client.query(sql, params);
      return result;
    } finally {
      client.release();
    }
  }

  // Métodos específicos do SQLite (já existem)
  async sqliteQuery(sql, params = []) {
    return await this.sqliteAll(sql, params);
  }

  // Método para sincronização de dados offline -> online
  async syncOfflineData() {
    if (!this.isPostgresConnected) {
      console.log('PostgreSQL não disponível para sincronização');
      return;
    }

    console.log('🔄 Iniciando sincronização de dados offline...');
    
    try {
      // Aqui você implementaria a lógica de sincronização
      // Por exemplo, buscar dados do SQLite que têm flag de "não sincronizado"
      // e inserir/atualizar no PostgreSQL
      
      console.log('✅ Sincronização concluída');
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
    }
  }

  async close() {
    if (this.pgPool) {
      await this.pgPool.end();
      console.log('📴 Conexão PostgreSQL fechada');
    }
    
    if (this.sqliteDb) {
      await promisify(this.sqliteDb.close.bind(this.sqliteDb))();
      console.log('📴 Conexão SQLite fechada');
    }
  }

  // Getter para verificar qual banco está sendo usado
  get currentDatabase() {
    return this.isPostgresConnected && this.usePostgres ? 'PostgreSQL' : 'SQLite';
  }

  // Método para reconectar ao PostgreSQL se necessário
  async reconnectPostgreSQL() {
    if (!this.isPostgresConnected) {
      console.log('🔄 Tentando reconectar ao PostgreSQL...');
      this.connectionAttempts = 0;
      await this.initPostgreSQL();
    }
  }
}