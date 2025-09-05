import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5433,
  database: 'stylecut_db',
  user: 'postgres',
  password: 'stylecut123',
  ssl: false
});

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.'));

// Testar conexão
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Erro de conexão PostgreSQL:', err.message);
  } else {
    console.log('✅ PostgreSQL conectado!', res.rows[0].now);
  }
});

// =================== ROTAS API ===================

// CLIENTES
app.get('/api/clientes', async (req, res) => {
  try {
    console.log('🔍 Buscando clientes...');
    const result = await pool.query('SELECT * FROM clientes ORDER BY nome');
    console.log(`✅ ${result.rows.length} clientes encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar clientes:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    console.log('📝 Criando cliente:', req.body);
    
    const { nome, telefone, email, endereco } = req.body;
    
    if (!nome || !telefone) {
      console.log('❌ Dados obrigatórios faltando');
      return res.status(400).json({ 
        error: 'Nome e telefone são obrigatórios' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO clientes (nome, telefone, email, endereco) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, telefone, email || null, endereco || null]
    );
    
    console.log('✅ Cliente criado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao criar cliente:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, endereco } = req.body;
    
    console.log(`📝 Atualizando cliente ${id}:`, req.body);
    
    const result = await pool.query(
      'UPDATE clientes SET nome = $1, telefone = $2, email = $3, endereco = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [nome, telefone, email || null, endereco || null, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ Cliente ${id} não encontrado`);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    console.log('✅ Cliente atualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar cliente:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.delete('/api/clientes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Removendo cliente ${id}`);
    
    const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      console.log(`❌ Cliente ${id} não encontrado`);
      return res.status(404).json({ error: 'Cliente não encontrado' });
    }
    
    console.log('✅ Cliente removido');
    res.json({ message: 'Cliente removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao remover cliente:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// SERVIÇOS
app.get('/api/servicos', async (req, res) => {
  try {
    console.log('🔍 Buscando serviços...');
    const result = await pool.query('SELECT * FROM servicos ORDER BY nome');
    console.log(`✅ ${result.rows.length} serviços encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar serviços:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.post('/api/servicos', async (req, res) => {
  try {
    console.log('📝 Criando serviço:', req.body);
    
    const { nome, valor, duracao, categoria, descricao } = req.body;
    
    if (!nome || !valor) {
      console.log('❌ Dados obrigatórios faltando');
      return res.status(400).json({ 
        error: 'Nome e valor são obrigatórios' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO servicos (nome, valor, duracao, categoria, descricao) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nome, parseFloat(valor), duracao || 60, categoria || 'Geral', descricao || null]
    );
    
    console.log('✅ Serviço criado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao criar serviço:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.put('/api/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, valor, duracao, categoria, descricao } = req.body;
    
    console.log(`📝 Atualizando serviço ${id}:`, req.body);
    
    const result = await pool.query(
      'UPDATE servicos SET nome = $1, valor = $2, duracao = $3, categoria = $4, descricao = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [nome, parseFloat(valor), duracao || 60, categoria || 'Geral', descricao || null, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ Serviço ${id} não encontrado`);
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    console.log('✅ Serviço atualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar serviço:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.delete('/api/servicos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Removendo serviço ${id}`);
    
    const result = await pool.query('DELETE FROM servicos WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      console.log(`❌ Serviço ${id} não encontrado`);
      return res.status(404).json({ error: 'Serviço não encontrado' });
    }
    
    console.log('✅ Serviço removido');
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao remover serviço:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// COLABORADORES
app.get('/api/colaboradores', async (req, res) => {
  try {
    console.log('🔍 Buscando colaboradores...');
    const result = await pool.query('SELECT * FROM colaboradores ORDER BY nome');
    console.log(`✅ ${result.rows.length} colaboradores encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar colaboradores:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.post('/api/colaboradores', async (req, res) => {
  try {
    console.log('📝 Criando colaborador:', req.body);
    
    const { nome, especialidade, telefone, email } = req.body;
    
    if (!nome || !especialidade) {
      console.log('❌ Dados obrigatórios faltando');
      return res.status(400).json({ 
        error: 'Nome e especialidade são obrigatórios' 
      });
    }
    
    const result = await pool.query(
      'INSERT INTO colaboradores (nome, especialidade, telefone, email) VALUES ($1, $2, $3, $4) RETURNING *',
      [nome, especialidade, telefone || null, email || null]
    );
    
    console.log('✅ Colaborador criado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao criar colaborador:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.put('/api/colaboradores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, especialidade, telefone, email } = req.body;
    
    console.log(`📝 Atualizando colaborador ${id}:`, req.body);
    
    const result = await pool.query(
      'UPDATE colaboradores SET nome = $1, especialidade = $2, telefone = $3, email = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [nome, especialidade, telefone || null, email || null, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ Colaborador ${id} não encontrado`);
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    
    console.log('✅ Colaborador atualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar colaborador:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.delete('/api/colaboradores/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Removendo colaborador ${id}`);
    
    const result = await pool.query('DELETE FROM colaboradores WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      console.log(`❌ Colaborador ${id} não encontrado`);
      return res.status(404).json({ error: 'Colaborador não encontrado' });
    }
    
    console.log('✅ Colaborador removido');
    res.json({ message: 'Colaborador removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao remover colaborador:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// AGENDAMENTOS
app.get('/api/agendamentos', async (req, res) => {
  try {
    console.log('🔍 Buscando agendamentos...');
    const result = await pool.query(`
      SELECT a.*, c.nome as cliente_nome, col.nome as colaborador_nome, s.nome as servico_nome
      FROM agendamentos a
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN colaboradores col ON a.colaborador_id = col.id
      LEFT JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data_agendamento DESC, a.hora_inicio
    `);
    console.log(`✅ ${result.rows.length} agendamentos encontrados`);
    res.json(result.rows);
  } catch (error) {
    console.error('❌ Erro ao buscar agendamentos:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.post('/api/agendamentos', async (req, res) => {
  try {
    console.log('📝 Criando agendamento:', req.body);
    
    const { clienteId, colaboradorId, servicoId, data, hora, observacoes } = req.body;
    
    if (!clienteId || !servicoId || !data || !hora) {
      console.log('❌ Dados obrigatórios faltando');
      return res.status(400).json({ 
        error: 'Cliente, serviço, data e hora são obrigatórios' 
      });
    }
    
    // Calcular hora fim (assumindo 1 hora de duração)
    const horaInicio = hora;
    const horaFim = new Date(`2000-01-01T${hora}`);
    horaFim.setHours(horaFim.getHours() + 1);
    const horaFimStr = horaFim.toTimeString().slice(0, 5);
    
    const result = await pool.query(
      `INSERT INTO agendamentos (cliente_id, colaborador_id, servico_id, data_agendamento, hora_inicio, hora_fim, observacoes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [clienteId, colaboradorId || null, servicoId, data, horaInicio, horaFimStr, observacoes || null]
    );
    
    console.log('✅ Agendamento criado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao criar agendamento:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.put('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { clienteId, colaboradorId, servicoId, data, hora, observacoes } = req.body;
    
    console.log(`📝 Atualizando agendamento ${id}:`, req.body);
    
    const horaInicio = hora;
    const horaFim = new Date(`2000-01-01T${hora}`);
    horaFim.setHours(horaFim.getHours() + 1);
    const horaFimStr = horaFim.toTimeString().slice(0, 5);
    
    const result = await pool.query(
      `UPDATE agendamentos 
       SET cliente_id = $1, colaborador_id = $2, servico_id = $3, data_agendamento = $4, 
           hora_inicio = $5, hora_fim = $6, observacoes = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [clienteId, colaboradorId || null, servicoId, data, horaInicio, horaFimStr, observacoes || null, id]
    );
    
    if (result.rows.length === 0) {
      console.log(`❌ Agendamento ${id} não encontrado`);
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    console.log('✅ Agendamento atualizado:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('❌ Erro ao atualizar agendamento:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Removendo agendamento ${id}`);
    
    const result = await pool.query('DELETE FROM agendamentos WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      console.log(`❌ Agendamento ${id} não encontrado`);
      return res.status(404).json({ error: 'Agendamento não encontrado' });
    }
    
    console.log('✅ Agendamento removido');
    res.json({ message: 'Agendamento removido com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao remover agendamento:', error.message);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Servir arquivos estáticos
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota para verificar status da API
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'online', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
  console.log(`📊 PostgreSQL na porta 5433`);
  console.log(`🌐 Acesse: http://localhost:${PORT}`);
});