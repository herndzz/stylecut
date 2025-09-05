import { HybridStorage } from './hybrid-storage.js';
import { db } from './connection.js';

class ServicoHybridStorage extends HybridStorage {
  constructor() {
    super('servicos', 'servicos');
    this.loadSyncQueue();
  }

  async saveToDatabase(servico) {
    const query = `
      INSERT INTO servicos (nome, valor, duracao, categoria, descricao)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      servico.nome,
      parseFloat(servico.valor),
      parseInt(servico.duracao) || 60,
      servico.categoria || null,
      servico.descricao || null
    ];

    const result = await db.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      nome: row.nome,
      valor: row.valor,
      duracao: row.duracao,
      categoria: row.categoria,
      descricao: row.descricao
    };
  }

  async getAllFromDatabase() {
    const query = 'SELECT * FROM servicos ORDER BY categoria, nome';
    const result = await db.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      valor: parseFloat(row.valor),
      duracao: row.duracao,
      categoria: row.categoria,
      descricao: row.descricao
    }));
  }

  async updateInDatabase(id, servico) {
    const query = `
      UPDATE servicos 
      SET nome = $1, valor = $2, duracao = $3, categoria = $4, 
          descricao = $5, updated_at = CURRENT_TIMESTAMP
      WHERE id = $6
      RETURNING *
    `;
    
    const values = [
      servico.nome,
      parseFloat(servico.valor),
      parseInt(servico.duracao) || 60,
      servico.categoria || null,
      servico.descricao || null,
      id
    ];

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Serviço com ID ${id} não encontrado`);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      nome: row.nome,
      valor: parseFloat(row.valor),
      duracao: row.duracao,
      categoria: row.categoria,
      descricao: row.descricao
    };
  }

  async deleteFromDatabase(id) {
    const query = 'DELETE FROM servicos WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error(`Serviço com ID ${id} não encontrado`);
    }
  }

  async buscarPorCategoria(categoria) {
    try {
      const query = 'SELECT * FROM servicos WHERE categoria = $1 ORDER BY nome';
      const result = await db.query(query, [categoria]);
      
      return result.rows.map(row => ({
        id: row.id,
        nome: row.nome,
        valor: parseFloat(row.valor),
        duracao: row.duracao,
        categoria: row.categoria,
        descricao: row.descricao
      }));
    } catch (error) {
      // Fallback para localStorage
      const servicos = this.localStorage.obterTodos();
      return servicos.filter(s => s.categoria === categoria);
    }
  }
}

export { ServicoHybridStorage };