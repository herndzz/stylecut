import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import pkg from 'pg';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function setupDatabase() {
  // Conexão direta para setup
  const pool = new Pool({
    host: 'localhost',
    port: 5433, 
    database: 'stylecut_db',
    user: 'postgres',
    password: 'stylecut123',
    ssl: false
  });

  try {
    console.log('🚀 Configurando banco de dados...');
    
    // Testa conexão primeiro
    console.log('🔄 Testando conexão...');
    await pool.query('SELECT NOW()');
    console.log('✅ Conexão estabelecida!');
    
    // Lê o arquivo SQL
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf8');
    
    // Executa o schema
    console.log('📊 Criando tabelas...');
    await pool.query(schema);
    
    console.log('✅ Banco de dados configurado com sucesso!');
    console.log('📊 Tabelas criadas: clientes, colaboradores, servicos, agendamentos');
    
    // Testa uma consulta
    const result = await pool.query('SELECT COUNT(*) as total FROM clientes');
    console.log(`📈 Total de clientes: ${result.rows[0].total}`);
    
  } catch (error) {
    console.error('❌ Erro ao configurar banco:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('🐳 Verifique se o Docker está rodando:');
      console.log('   docker ps');
      console.log('   docker start stylecut-db');
    }
    
  } finally {
    await pool.end();
    process.exit();
  }
}

setupDatabase();