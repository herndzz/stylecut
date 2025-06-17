import { renderList } from './clientes.js';
import { StorageService } from './storage.js';

/**
 * Gerencia operações relacionadas a colaboradores, incluindo CRUD e associação de serviços.
 */
class ColaboradorManager {
  constructor() {
    this.storage = new StorageService('colaboradores');
    this.colaboradores = [];
    this.colaboradorEditando = null;
    this.loadData();
  }

  loadData() {
    try {
      this.colaboradores = this.storage.load() || [];
    } catch (error) {
      console.error('Erro ao carregar colaboradores:', error);
      alert('Falha ao carregar dados de colaboradores.');
    }
  }

  saveData() {
    try {
      this.storage.save(this.colaboradores);
    } catch (error) {
      console.error('Erro ao salvar colaboradores:', error);
      alert('Falha ao salvar dados de colaboradores.');
    }
  }

  addOrUpdateColaborador(colaborador) {
    if (!colaborador.nome.trim() || !colaborador.especialidade.trim()) {
      alert('Por favor, preencha todos os campos.');
      return false;
    }
    if (this.colaboradorEditando !== null) {
      this.colaboradores[this.colaboradorEditando] = { ...colaborador, id: this.colaboradores[this.colaboradorEditando].id };
      this.colaboradorEditando = null;
    } else {
      colaborador.id = this.generateUniqueId();
      this.colaboradores.push(colaborador);
    }
    this.saveData();
    return true;
  }

  deleteColaborador(index, agendamentos) {
    const colaboradorId = this.colaboradores[index].id;
    const temAgendamentos = agendamentos.some(a => a.colaborador === colaboradorId);
    if (temAgendamentos) {
      alert('Este colaborador tem agendamentos. Não é possível excluir.');
      return false;
    }
    if (confirm('Tem certeza que deseja excluir este colaborador?')) {
      this.colaboradores.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  prepareEdit(index) {
    this.colaboradorEditando = index;
    return this.colaboradores[index];
  }

  getColaboradores() {
    return this.colaboradores;
  }

  generateUniqueId() {
    return Math.random().toString(36).substr(2, 9);
  }
}

/**
 * Atualiza a lista de colaboradores no DOM.
 * @param {Array} agendamentos - Lista de agendamentos para validação.
 */
function atualizarListaColaboradores(colaboradorManager, agendamentos) {
  renderList('lista-colaboradores', colaboradorManager.getColaboradores(),
    colaborador => `${colaborador.nome} - ${colaborador.especialidade} (Serviços: ${colaborador.servicos.map(s => s.nome).join(', ')})`,
    {
      edit: index => {
        const colaborador = colaboradorManager.prepareEdit(index);
        document.getElementById('nome-colaborador').value = colaborador.nome;
        document.getElementById('especialidade').value = colaborador.especialidade;
        const select = document.getElementById('servicos-colaborador');
        Array.from(select.options).forEach(opt => {
          opt.selected = colaborador.servicos.some(s => s.id === opt.value);
        });
        document.getElementById('add-colaborador').textContent = 'Salvar Alterações';
      },
      delete: index => {
        if (colaboradorManager.deleteColaborador(index, agendamentos)) {
          atualizarListaColaboradores(colaboradorManager, agendamentos);
          atualizarSelectColaboradores(colaboradorManager);
        }
      }
    }
  );
}

/**
 * Atualiza o select de colaboradores no formulário de agendamento.
 */
function atualizarSelectColaboradores(colaboradorManager) {
  const select = document.getElementById('colaborador');
  select.innerHTML = '<option value="">Selecione um colaborador</option>';
  colaboradorManager.getColaboradores().forEach(colaborador => {
    const option = document.createElement('option');
    option.value = colaborador.id;
    option.textContent = colaborador.nome;
    select.appendChild(option);
  });
}

export { ColaboradorManager, atualizarListaColaboradores, atualizarSelectColaboradores };