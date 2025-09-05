import { HybridStorage } from './hybrid-storage.js';
import { db } from './connection.js';

class ColaboradorHybridStorage extends HybridStorage {
  constructor() {
    super('colaboradores', 'colaboradores');
    this.loadSyncQueue();
  }

  async saveToDatabase(colaborador) {
    const query = `
      INSERT INTO colaboradores (nome, telefone, email, especialidade, comissao)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    
    const values = [
      colaborador.nome,
      colaborador.telefone || null,
      colaborador.email || null,
      colaborador.especialidade || null,
      parseFloat(colaborador.comissao) || 0.00
    ];

    const result = await db.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      especialidade: row.especialidade,
      comissao: parseFloat(row.comissao),
      servicos: colaborador.servicos || []
    };
  }

  async getAllFromDatabase() {
    const query = `
      SELECT c.*, 
             COALESCE(
               json_agg(
                 json_build_object('id', s.id, 'nome', s.nome) 
                 ORDER BY s.nome
               ) FILTER (WHERE s.id IS NOT NULL), 
               '[]'
             ) as servicos
      FROM colaboradores c
      LEFT JOIN colaborador_servicos cs ON c.id = cs.colaborador_id
      LEFT JOIN servicos s ON cs.servico_id = s.id
      GROUP BY c.id
      ORDER BY c.nome
    `;
    
    const result = await db.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      email: row.email,
      especialidade: row.especialidade,
      comissao: parseFloat(row.comissao),
      servicos: row.servicos
    }));
  }

  async updateInDatabase(id, colaborador) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');

      // Atualizar dados do colaborador
      const updateQuery = `
        UPDATE colaboradores 
        SET nome = $1, telefone = $2, email = $3, especialidade = $4, 
            comissao = $5, updated_at = CURRENT_TIMESTAMP
        WHERE id = $6
        RETURNING *
      `;
      
      const values = [
        colaborador.nome,
        colaborador.telefone || null,
        colaborador.email || null,
        colaborador.especialidade || null,
        parseFloat(colaborador.comissao) || 0.00,
        id
      ];

      const result = await client.query(updateQuery, values);
      
      if (result.rows.length === 0) {
        throw new Error(`Colaborador com ID ${id} não encontrado`);
      }

      // Atualizar serviços associados
      if (colaborador.servicos) {
        // Remove associações antigas
        await client.query('DELETE FROM colaborador_servicos WHERE colaborador_id = $1', [id]);
        
        // Adiciona novas associações
        for (const servicoId of colaborador.servicos) {
          await client.query(
            'INSERT INTO colaborador_servicos (colaborador_id, servico_id) VALUES ($1, $2)',
            [id, servicoId]
          );
        }
      }

      await client.query('COMMIT');

      const row = result.rows[0];
      return {
        id: row.id,
        nome: row.nome,
        telefone: row.telefone,
        email: row.email,
        especialidade: row.especialidade,
        comissao: parseFloat(row.comissao),
        servicos: colaborador.servicos || []
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async deleteFromDatabase(id) {
    const query = 'DELETE FROM colaboradores WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error(`Colaborador com ID ${id} não encontrado`);
    }
  }

  async associarServicos(colaboradorId, servicosIds) {
    const client = await db.pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Remove associações antigas
      await client.query('DELETE FROM colaborador_servicos WHERE colaborador_id = $1', [colaboradorId]);
      
      // Adiciona novas associações
      for (const servicoId of servicosIds) {
        await client.query(
          'INSERT INTO colaborador_servicos (colaborador_id, servico_id) VALUES ($1, $2)',
          [colaboradorId, servicoId]
        );
      }
      
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }
}

export { ColaboradorHybridStorage };