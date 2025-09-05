import { HybridStorage } from './hybrid-storage.js';
import { db } from './connection.js';

class AgendamentoHybridStorage extends HybridStorage {
  constructor() {
    super('agendamentos', 'agendamentos');
    this.loadSyncQueue();
  }

  async saveToDatabase(agendamento) {
    const query = `
      INSERT INTO agendamentos (cliente_id, colaborador_id, servico_id, data_agendamento, 
                               hora_inicio, hora_fim, status, valor_total, observacoes)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const values = [
      agendamento.clienteId,
      agendamento.colaboradorId || null,
      agendamento.servicoId || null,
      agendamento.data,
      agendamento.hora,
      agendamento.horaFim || null,
      agendamento.status || 'agendado',
      agendamento.valor || null,
      agendamento.observacoes || null
    ];

    const result = await db.query(query, values);
    const row = result.rows[0];
    
    return {
      id: row.id,
      clienteId: row.cliente_id,
      colaboradorId: row.colaborador_id,
      servicoId: row.servico_id,
      data: row.data_agendamento,
      hora: row.hora_inicio,
      horaFim: row.hora_fim,
      status: row.status,
      valor: row.valor_total,
      observacoes: row.observacoes
    };
  }

  async getAllFromDatabase() {
    const query = `
      SELECT a.*, c.nome as cliente_nome, col.nome as colaborador_nome, s.nome as servico_nome
      FROM agendamentos a
      LEFT JOIN clientes c ON a.cliente_id = c.id
      LEFT JOIN colaboradores col ON a.colaborador_id = col.id
      LEFT JOIN servicos s ON a.servico_id = s.id
      ORDER BY a.data_agendamento DESC, a.hora_inicio
    `;
    
    const result = await db.query(query);
    
    return result.rows.map(row => ({
      id: row.id,
      clienteId: row.cliente_id,
      colaboradorId: row.colaborador_id,
      servicoId: row.servico_id,
      data: row.data_agendamento,
      hora: row.hora_inicio,
      horaFim: row.hora_fim,
      status: row.status,
      valor: row.valor_total,
      observacoes: row.observacoes,
      // Dados extras para exibição
      clienteNome: row.cliente_nome,
      colaboradorNome: row.colaborador_nome,
      servicoNome: row.servico_nome
    }));
  }

  async updateInDatabase(id, agendamento) {
    const query = `
      UPDATE agendamentos 
      SET cliente_id = $1, colaborador_id = $2, servico_id = $3, data_agendamento = $4,
          hora_inicio = $5, hora_fim = $6, status = $7, valor_total = $8, 
          observacoes = $9, updated_at = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *
    `;
    
    const values = [
      agendamento.clienteId,
      agendamento.colaboradorId || null,
      agendamento.servicoId || null,
      agendamento.data,
      agendamento.hora,
      agendamento.horaFim || null,
      agendamento.status || 'agendado',
      agendamento.valor || null,
      agendamento.observacoes || null,
      id
    ];

    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error(`Agendamento com ID ${id} não encontrado`);
    }

    const row = result.rows[0];
    return {
      id: row.id,
      clienteId: row.cliente_id,
      colaboradorId: row.colaborador_id,
      servicoId: row.servico_id,
      data: row.data_agendamento,
      hora: row.hora_inicio,
      horaFim: row.hora_fim,
      status: row.status,
      valor: row.valor_total,
      observacoes: row.observacoes
    };
  }

  async deleteFromDatabase(id) {
    const query = 'DELETE FROM agendamentos WHERE id = $1';
    const result = await db.query(query, [id]);
    
    if (result.rowCount === 0) {
      throw new Error(`Agendamento com ID ${id} não encontrado`);
    }
  }

  async verificarConflito(colaboradorId, data, horaInicio, horaFim, agendamentoId = null) {
    try {
      const query = `
        SELECT verificar_conflito_horario($1, $2, $3, $4, $5) as conflito
      `;
      
      const result = await db.query(query, [colaboradorId, data, horaInicio, horaFim, agendamentoId]);
      return result.rows[0].conflito;
    } catch (error) {
      // Fallback para localStorage - verificação simples
      const agendamentos = this.localStorage.obterTodos();
      return agendamentos.some(a => 
        a.colaboradorId === colaboradorId &&
        a.data === data &&
        a.status !== 'cancelado' &&
        (agendamentoId === null || a.id !== agendamentoId) &&
        ((horaInicio >= a.hora && horaInicio < a.horaFim) ||
         (horaFim > a.hora && horaFim <= a.horaFim) ||
         (horaInicio <= a.hora && horaFim >= a.horaFim))
      );
    }
  }

  async buscarPorData(data) {
    try {
      const query = `
        SELECT a.*, c.nome as cliente_nome, col.nome as colaborador_nome, s.nome as servico_nome
        FROM agendamentos a
        LEFT JOIN clientes c ON a.cliente_id = c.id
        LEFT JOIN colaboradores col ON a.colaborador_id = col.id
        LEFT JOIN servicos s ON a.servico_id = s.id
        WHERE a.data_agendamento = $1
        ORDER BY a.hora_inicio
      `;
      
      const result = await db.query(query, [data]);
      
      return result.rows.map(row => ({
        id: row.id,
        clienteId: row.cliente_id,
        colaboradorId: row.colaborador_id,
        servicoId: row.servico_id,
        data: row.data_agendamento,
        hora: row.hora_inicio,
        horaFim: row.hora_fim,
        status: row.status,
        valor: row.valor_total,
        observacoes: row.observacoes,
        clienteNome: row.cliente_nome,
        colaboradorNome: row.colaborador_nome,
        servicoNome: row.servico_nome
      }));
    } catch (error) {
      // Fallback para localStorage
      const agendamentos = this.localStorage.obterTodos();
      return agendamentos.filter(a => a.data === data);
    }
  }
}

export { AgendamentoHybridStorage };