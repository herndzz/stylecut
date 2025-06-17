import { renderList } from './clientes.js';
import { StorageService } from './storage.js';

/**
 * Gerencia operações relacionadas a serviços, incluindo CRUD.
 */
class ServicoManager {
  constructor() {
    this.storage = new StorageService('servicos');
    this.servicos = [];
    this.servicoEditando = null;
    this.loadData();
  }

  loadData() {
    try {
      this.servicos = this.storage.load() || [];
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      alert('Falha ao carregar dados de serviços.');
    }
  }

  saveData() {
    try {
      this.storage.save(this.servicos);
    } catch (error) {
      console.error('Erro ao salvar serviços:', error);
      alert('Falha ao salvar dados de serviços.');
    }
  }

  addOrUpdateServico(servico) {
    if (!servico.nome.trim() || isNaN(servico.valor) || servico.valor <= 0) {
      alert('Por favor, preencha o nome e um valor válido.');
      return false;
    }
    if (this.servicoEditando !== null) {
      this.servicos[this.servicoEditando] = { ...servico, id: this.servicos[this.servicoEditando].id };
      this.servicoEditando = null;
    } else {
      servico.id = this.generateUniqueId();
      this.servicos.push(servico);
    }
    this.saveData();
    return true;
  }

  deleteServico(index, agendamentos, colaboradores) {
    const servicoId = this.servicos[index].id;
    const temAgendamentos = agendamentos.some(a => a.servico === servicoId);
    const temColaboradores = colaboradores.some(c => c.servicos.some(s => s.id === servicoId));
    if (temAgendamentos || temColaboradores) {
      alert('Este serviço está associado a agendamentos ou colaboradores. Não é possível excluir.');
      return false;
    }
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      this.servicos.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  prepareEdit(index) {
    this.servicoEditando = index;
    return this.servicos[index];
  }

  getServicos() {
    return this.servicos;
  }

  generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Atualiza a lista de serviços no DOM.
 * @param {Array} agendamentos - Lista de agendamentos para validação.
 * @param {Array} colaboradores - Lista de colaboradores para validação.
 */
function atualizarListaServicos(servicoManager, agendamentos, colaboradores) {
  renderList('lista-servicos', servicoManager.getServicos(),
    servico => `${servico.nome} - R$ ${servico.valor.toFixed(2)}`,
    {
      edit: index => {
        const servico = servicoManager.prepareEdit(index);
        document.getElementById('nome-servico').value = servico.nome;
        document.getElementById('valor-servico').value = servico.valor;
        document.getElementById('add-servico').textContent = 'Salvar Alterações';
      },
      delete: index => {
        if (servicoManager.deleteServico(index, agendamentos, colaboradores)) {
          atualizarListaServicos(servicoManager, agendamentos, colaboradores);
          atualizarSelectServicosColaborador(servicoManager);
        }
      }
    }
  );
}

/**
 * Atualiza o select de serviços no formulário de colaboradores.
 */
function atualizarSelectServicosColaborador(servicoManager) {
  const select = document.getElementById('servicos-colaborador');
  select.innerHTML = '';
  servicoManager.getServicos().forEach(servico => {
    const option = document.createElement('option');
    option.value = servico.id;
    option.textContent = `${servico.nome} (R$ ${servico.valor.toFixed(2)})`;
    select.appendChild(option);
  });
}

export { ServicoManager, atualizarListaServicos, atualizarSelectServicosColaborador };