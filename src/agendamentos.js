import { renderList } from './clientes.js';
import { StorageService } from './storage.js';

/**
 * Gerencia operações relacionadas a agendamentos, incluindo CRUD.
 */
class AgendamentoManager {
  constructor() {
    this.storage = new StorageService('agendamentos');
    this.agendamentos = [];
    this.agendamentoEditando = null;
    this.loadData();
  }

  loadData() {
    try {
      this.agendamentos = this.storage.load() || [];
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      alert('Falha ao carregar dados de agendamentos.');
    }
  }

  saveData() {
    try {
      this.storage.save(this.agendamentos);
    } catch (error) {
      console.error('Erro ao salvar agendamentos:', error);
      alert('Falha ao salvar dados de agendamentos.');
    }
  }

  addOrUpdateAgendamento(agendamento, colaboradores, servicos) {
    if (!agendamento.cliente || !agendamento.colaborador || !agendamento.servico || !agendamento.data || !agendamento.hora) {
      alert('Por favor, preencha todos os campos.');
      return false;
    }
    const dataAgendamento = new Date(`${agendamento.data}T${agendamento.hora}`);
    if (dataAgendamento <= new Date()) {
      alert('A data e hora do agendamento devem ser futuras.');
      return false;
    }
    const colaborador = colaboradores.find(c => c.id === agendamento.colaborador);
    const servico = servicos.find(s => s.id === agendamento.servico);
    agendamento.valor = colaborador.servicos.find(s => s.id === agendamento.servico)?.valor || servico.valor;
    if (this.agendamentoEditando !== null) {
      this.agendamentos[this.agendamentoEditando] = { ...agendamento, id: this.agendamentos[this.agendamentoEditando].id };
      this.agendamentoEditando = null;
    } else {
      agendamento.id = this.generateUniqueId();
      this.agendamentos.push(agendamento);
    }
    this.saveData();
    return true;
  }

  deleteAgendamento(index) {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      this.agendamentos.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  prepareEdit(index) {
    this.agendamentoEditando = index;
    return this.agendamentos[index];
  }

  getAgendamentos() {
    return this.agendamentos;
  }

  generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Atualiza a lista de agendamentos no DOM.
 * @param {Array} colaboradores - Lista de colaboradores para exibição.
 * @param {Array} servicos - Lista de serviços para exibição.
 */
function atualizarListaAgendamentos(agendamentoManager, colaboradores, servicos) {
  renderList('lista-agendamentos', agendamentoManager.getAgendamentos(),
    agendamento => {
      const colaborador = colaboradores.find(c => c.id === agendamento.colaborador);
      const servico = servicos.find(s => s.id === agendamento.servico);
      return `${agendamento.cliente} com ${colaborador ? colaborador.nome : 'Desconhecido'} - ${servico ? servico.nome : 'Desconhecido'} (R$ ${agendamento.valor.toFixed(2)}) em ${agendamento.data} às ${agendamento.hora}`;
    },
    {
      edit: index => {
        const agendamento = agendamentoManager.prepareEdit(index);
        document.getElementById('cliente').value = agendamento.cliente;
        document.getElementById('colaborador').value = agendamento.colaborador;
        atualizarSelectServicos(agendamento.colaborador, colaboradores, servicos);
        document.getElementById('servico').value = agendamento.servico;
        document.getElementById('data').value = agendamento.data;
        document.getElementById('hora').value = agendamento.hora;
        atualizarValorAgendamento(agendamento.colaborador, agendamento.servico, colaboradores, servicos);
        document.getElementById('add-agendamento').textContent = 'Salvar Alterações';
      },
      delete: index => {
        if (agendamentoManager.deleteAgendamento(index)) {
          atualizarListaAgendamentos(agendamentoManager, colaboradores, servicos);
        }
      }
    }
  );
}

/**
 * Atualiza o select de serviços no formulário de agendamento.
 * @param {string} colaboradorId - ID do colaborador selecionado.
 * @param {Array} colaboradores - Lista de colaboradores.
 * @param {Array} servicos - Lista de serviços.
 */
function atualizarSelectServicos(colaboradorId, colaboradores, servicos) {
  const select = document.getElementById('servico');
  select.innerHTML = '<option value="">Selecione um serviço</option>';
  const colaborador = colaboradores.find(c => c.id === colaboradorId);
  if (colaborador) {
    colaborador.servicos.forEach(servico => {
      const option = document.createElement('option');
      option.value = servico.id;
      option.textContent = `${servico.nome} (R$ ${servico.valor.toFixed(2)})`;
      select.appendChild(option);
    });
  }
}

/**
 * Atualiza o valor do agendamento no formulário.
 * @param {string} colaboradorId - ID do colaborador selecionado.
 * @param {string} servicoId - ID do serviço selecionado.
 * @param {Array} colaboradores - Lista de colaboradores.
 * @param {Array} servicos - Lista de serviços.
 */
function atualizarValorAgendamento(colaboradorId, servicoId, colaboradores, servicos) {
  const colaborador = colaboradores.find(c => c.id === colaboradorId);
  const valorInput = document.getElementById('valor-agendamento');
  if (colaborador && servicoId) {
    const servico = colaborador.servicos.find(s => s.id === servicoId) || servicos.find(s => s.id === servicoId);
    valorInput.value = servico ? `R$ ${servico.valor.toFixed(2)}` : '';
  } else {
    valorInput.value = '';
  }
}

export { AgendamentoManager, atualizarListaAgendamentos, atualizarSelectServicos, atualizarValorAgendamento };