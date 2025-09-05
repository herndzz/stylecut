import { HybridStorage } from './hybrid-storage.js';
import { db } from './connection.js';

class ClienteHybridStorage extends HybridStorage {
  constructor() {
    super('clientes', 'clientes');
    this.loadSyncQueue();
  }

  async saveToDatabase(cliente) {
    const query = `
      INSERT INTO clientes (nome, telefone, email, endereco, data_nascimento, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    
    const values = [
      cliente.nome,
      cliente.telefone || null,
      cliente.email || null,
      cliente.endereco || null,
      cliente.dataNascimento || null,
      cliente.observacoes || null
    ];

    const result = await db.query(query, values);
    return result.rows[0];
  }

  async getAllFromDatabase() {
    const query = 'SELECT * FROM clientes ORDER BY nome';
    const result = await db.query(query);
    
    // Converte para formato do localStorage
    return result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      endereco: row.endereco,
      dataNascimento: row.data_nascimento,
      observacoes: row.observacoes
    }));
  }

  async updateInDatabase(id, cliente) {
    const query = `
      UPDATE clientes 
      SET nome = $1, telefone = $2, email = $3, endereco = $4, 
          data_nascimento = $5, observacoes = $6, updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    
    const values = [
      cliente.nome,
      cliente.telefone || null,
      cliente.email || null,
      cliente.endereco || null,
      cliente.dataNascimento || null,
      cliente.observacoes || null,
      id
    ];

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Cliente com ID ${id} não encontrado`);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      endereco: row.endereco,
      dataNascimento: row.data_nascimento,
      observacoes: row.observacoes
    };
  }

  async deleteFromDatabase(id) {
    const query = 'DELETE FROM clientes WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error(`Cliente com ID ${id} não encontrado`);
    }
  }

  async buscarPorTelefone(telefone) {
    try {
      const query = 'SELECT * FROM clientes WHERE telefone = $1';
      const result = await db.query(query, [telefone]);
      
      if (result.rows.length > 0) {
        const row = result.rows[0];
        return {
          id: row.id,
          nome: row.nome,
          telefone: row.telefone,
          email: row.email,
          endereco: row.endereco,
          dataNascimento: row.data_nascimento,
          observacoes: row.observacoes
        };
      }
      return null;
    } catch (error) {
      // Fallback para localStorage
      const clientes = this.localStorage.obterTodos();
      return clientes.find(c => c.telefone === telefone) || null;
    }
  }
}

export { ClienteHybridStorage };