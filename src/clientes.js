/**
 * Gerencia operações relacionadas a clientes, incluindo CRUD e renderização.
 */
class ClienteManager {
  constructor(storageKey = 'clientes') {
    this.storageKey = storageKey;
    this.clientes = [];
    this.clienteEditando = null;
    this.loadData();
  }

  /**
   * Carrega dados do localStorage.
   */
  loadData() {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (data) this.clientes = JSON.parse(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
      alert('Falha ao carregar dados de clientes.');
    }
  }

  /**
   * Salva dados no localStorage.
   */
  saveData() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.clientes));
    } catch (error) {
      console.error('Erro ao salvar clientes:', error);
      alert('Falha ao salvar dados de clientes.');
    }
  }

  /**
   * Adiciona ou edita um cliente.
   * @param {Object} cliente - Objeto com nome e telefone.
   */
  addOrUpdateCliente(cliente) {
    if (!cliente.nome.trim() || !cliente.telefone.trim()) {
      alert('Por favor, preencha todos os campos.');
      return false;
    }
    if (this.clienteEditando !== null) {
      this.clientes[this.clienteEditando] = cliente;
      this.clienteEditando = null;
    } else {
      this.clientes.push(cliente);
    }
    this.saveData();
    return true;
  }

  /**
   * Exclui um cliente, verificando dependências.
   * @param {number} index - Índice do cliente.
   * @param {Array} agendamentos - Lista de agendamentos para validação.
   */
  deleteCliente(index, agendamentos) {
    const clienteNome = this.clientes[index].nome;
    const temAgendamentos = agendamentos.some(a => a.cliente === clienteNome);
    if (temAgendamentos) {
      alert('Este cliente tem agendamentos. Não é possível excluir.');
      return false;
    }
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clientes.splice(index, 1);
      this.saveData();
      return true;
    }
    return false;
  }

  /**
   * Prepara a edição de um cliente.
   * @param {number} index - Índice do cliente.
   * @returns {Object} Dados do cliente.
   */
  prepareEdit(index) {
    this.clienteEditando = index;
    return this.clientes[index];
  }

  /**
   * Obtém a lista de clientes.
   * @returns {Array} Lista de clientes.
   */
  getClientes() {
    return this.clientes;
  }
}

/**
 * Renderiza uma lista genérica no DOM.
 * @param {string} listId - ID do elemento <ul>.
 * @param {Array} items - Itens a serem renderizados.
 * @param {Function} renderItem - Função que renderiza cada item.
 * @param {Object} actions - Funções de ação (ex.: edit, delete).
 */
function renderList(listId, items, renderItem, actions) {
  const lista = document.getElementById(listId);
  lista.innerHTML = '';
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = renderItem(item);
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-sm btn-warning me-2';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => actions.edit(index));
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-sm btn-danger';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => actions.delete(index));
    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

/**
 * Atualiza a lista de clientes no DOM.
 * @param {ClienteManager} clienteManager - Instância do gerenciador de clientes.
 * @param {Array} agendamentos - Lista de agendamentos para validação.
 */
function atualizarListaClientes(clienteManager, agendamentos) {
  renderList('lista-clientes', clienteManager.getClientes(),
    cliente => `${cliente.nome} - ${cliente.telefone}`,
    {
      edit: index => {
        const cliente = clienteManager.prepareEdit(index);
        document.getElementById('nome').value = cliente.nome;
        document.getElementById('telefone').value = cliente.telefone;
        document.getElementById('add-cliente').textContent = 'Salvar Alterações';
      },
      delete: index => {
        if (clienteManager.deleteCliente(index, agendamentos)) {
          atualizarListaClientes(clienteManager, agendamentos);
          atualizarSelectClientes(clienteManager);
        }
      }
    }
  );
}

/**
 * Atualiza o select de clientes no formulário de agendamento.
 * @param {ClienteManager} clienteManager - Instância do gerenciador de clientes.
 */
function atualizarSelectClientes(clienteManager) {
  const select = document.getElementById('cliente');
  select.innerHTML = '<option value="">Selecione um cliente</option>';
  clienteManager.getClientes().forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente.nome;
    option.textContent = cliente.nome;
    select.appendChild(option);
  });
}

export { ClienteManager, renderList, atualizarListaClientes, atualizarSelectClientes };