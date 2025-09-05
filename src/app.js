import { APIService } from './api.js';

// Inicializar API service
const api = new APIService();

// ================ CLIENTE MANAGER ================
class ClienteManager {
  constructor() {
    this.carregarClientes();
  }

  async carregarClientes() {
    try {
      const clientes = await api.getClientes();
      this.renderizarClientes(clientes);
      this.atualizarSelectClientes(clientes);
      console.log('✅ Clientes carregados:', clientes.length);
    } catch (error) {
      console.error('❌ Erro ao carregar clientes:', error);
    }
  }

  async adicionarCliente(nome, telefone) {
    if (!nome || !telefone) {
      alert('Nome e telefone são obrigatórios!');
      return;
    }

    if (nome.length > 255) {
      alert('Nome muito longo! Máximo 255 caracteres.');
      return;
    }

    if (telefone.length > 20) {
      alert('Telefone muito longo! Máximo 20 caracteres.');
      return;
    }

    const telefoneNumeros = telefone.replace(/\D/g, '');
    if (telefoneNumeros.length < 10 || telefoneNumeros.length > 11) {
      alert('Telefone deve ter 10 ou 11 dígitos!');
      return;
    }

    try {
      const novoCliente = await api.createCliente({ nome, telefone });
      console.log('✅ Cliente adicionado:', novoCliente);
      
      await this.carregarClientes();
      this.limparFormulario();
      this.mostrarNotificacao('Cliente adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao adicionar cliente:', error);
      this.mostrarNotificacao('Erro ao adicionar cliente', 'error');
    }
  }

  async editarCliente(id, nome, telefone) {
    if (!nome || !telefone) {
      alert('Nome e telefone são obrigatórios!');
      return;
    }

    try {
      await api.updateCliente(id, { nome, telefone });
      console.log('✅ Cliente atualizado');
      
      await this.carregarClientes();
      this.mostrarNotificacao('Cliente atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao editar cliente:', error);
      this.mostrarNotificacao('Erro ao editar cliente', 'error');
    }
  }

  async removerCliente(id) {
    if (!confirm('Tem certeza que deseja remover este cliente?')) return;

    try {
      await api.deleteCliente(id);
      console.log('✅ Cliente removido');
      
      await this.carregarClientes();
      this.mostrarNotificacao('Cliente removido com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao remover cliente:', error);
      this.mostrarNotificacao('Erro ao remover cliente', 'error');
    }
  }

  renderizarClientes(clientes) {
    const lista = document.getElementById('lista-clientes');
    if (!lista) return;
    
    lista.innerHTML = '';

    if (clientes.length === 0) {
      lista.innerHTML = '<li class="list-group-item text-muted">Nenhum cliente cadastrado</li>';
      return;
    }

    clientes.forEach(cliente => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${cliente.nome}</strong><br>
          <small class="text-muted">📞 ${cliente.telefone || 'Sem telefone'}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" 
                  onclick="window.editarClientePrompt(${cliente.id}, '${cliente.nome.replace(/'/g, "\\'")}', '${(cliente.telefone || '').replace(/'/g, "\\'")}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="window.clienteManager.removerCliente(${cliente.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  atualizarSelectClientes(clientes) {
    const select = document.getElementById('cliente');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um cliente</option>';

    clientes.forEach(cliente => {
      const option = document.createElement('option');
      option.value = cliente.id;
      option.textContent = `${cliente.nome} - ${cliente.telefone || 'Sem telefone'}`;
      select.appendChild(option);
    });
  }

  limparFormulario() {
    const nome = document.getElementById('nome');
    const telefone = document.getElementById('telefone');
    
    if (nome) nome.value = '';
    if (telefone) telefone.value = '';
  }

  mostrarNotificacao(mensagem, tipo = 'info') {
    console.log(`${tipo.toUpperCase()}: ${mensagem}`);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
}

// ================ SERVIÇO MANAGER ================
class ServicoManager {
  constructor() {
    this.carregarServicos();
  }

  async carregarServicos() {
    try {
      const servicos = await api.getServicos();
      this.renderizarServicos(servicos);
      this.atualizarSelectServicos(servicos);
      console.log('✅ Serviços carregados:', servicos.length);
    } catch (error) {
      console.error('❌ Erro ao carregar serviços:', error);
    }
  }

  async adicionarServico(nome, valor) {
    if (!nome || !valor) {
      alert('Nome e valor são obrigatórios!');
      return;
    }

    if (nome.length > 255) {
      alert('Nome muito longo! Máximo 255 caracteres.');
      return;
    }

    if (isNaN(valor) || parseFloat(valor) <= 0) {
      alert('Valor deve ser um número maior que zero!');
      return;
    }

    try {
      const novoServico = await api.createServico({ 
        nome, 
        valor: parseFloat(valor),
        duracao: 60,
        categoria: 'Geral'
      });
      
      console.log('✅ Serviço adicionado:', novoServico);
      
      await this.carregarServicos();
      this.limparFormulario();
      this.mostrarNotificacao('Serviço adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao adicionar serviço:', error);
      this.mostrarNotificacao('Erro ao adicionar serviço', 'error');
    }
  }

  async editarServico(id, nome, valor) {
    if (!nome || !valor) {
      alert('Nome e valor são obrigatórios!');
      return;
    }

    try {
      await api.updateServico(id, { nome, valor: parseFloat(valor) });
      console.log('✅ Serviço atualizado');
      
      await this.carregarServicos();
      this.mostrarNotificacao('Serviço atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao editar serviço:', error);
      this.mostrarNotificacao('Erro ao editar serviço', 'error');
    }
  }

  async removerServico(id) {
    if (!confirm('Tem certeza que deseja remover este serviço?')) return;

    try {
      await api.deleteServico(id);
      console.log('✅ Serviço removido');
      
      await this.carregarServicos();
      this.mostrarNotificacao('Serviço removido com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao remover serviço:', error);
      this.mostrarNotificacao('Erro ao remover serviço', 'error');
    }
  }

  renderizarServicos(servicos) {
    const lista = document.getElementById('lista-servicos');
    if (!lista) return;
    
    lista.innerHTML = '';

    if (servicos.length === 0) {
      lista.innerHTML = '<li class="list-group-item text-muted">Nenhum serviço cadastrado</li>';
      return;
    }

    servicos.forEach(servico => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${servico.nome}</strong><br>
          <small class="text-muted">💰 R$ ${parseFloat(servico.valor).toFixed(2)}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" 
                  onclick="window.editarServicoPrompt(${servico.id}, '${servico.nome.replace(/'/g, "\\'")}', '${servico.valor}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="window.servicoManager.removerServico(${servico.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  atualizarSelectServicos(servicos) {
    const select = document.getElementById('servico');
    if (select) {
      select.innerHTML = '<option value="">Selecione um serviço</option>';

      servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.dataset.valor = servico.valor;
        option.textContent = `${servico.nome} - R$ ${parseFloat(servico.valor).toFixed(2)}`;
        select.appendChild(option);
      });
    }

    // Atualizar select de colaboradores também
    const selectColaborador = document.getElementById('servicos-colaborador');
    if (selectColaborador) {
      selectColaborador.innerHTML = '';

      servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = `${servico.nome} - R$ ${parseFloat(servico.valor).toFixed(2)}`;
        selectColaborador.appendChild(option);
      });
    }
  }

  limparFormulario() {
    const nome = document.getElementById('nome-servico');
    const valor = document.getElementById('valor-servico');
    
    if (nome) nome.value = '';
    if (valor) valor.value = '';
  }

  mostrarNotificacao(mensagem, tipo = 'info') {
    console.log(`${tipo.toUpperCase()}: ${mensagem}`);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
}

// ================ COLABORADOR MANAGER ================
class ColaboradorManager {
  constructor() {
    this.carregarColaboradores();
  }

  async carregarColaboradores() {
    try {
      const colaboradores = await api.getColaboradores();
      this.renderizarColaboradores(colaboradores);
      this.atualizarSelectColaboradores(colaboradores);
      console.log('✅ Colaboradores carregados:', colaboradores.length);
    } catch (error) {
      console.error('❌ Erro ao carregar colaboradores:', error);
    }
  }

  async adicionarColaborador(nome, especialidade, telefone, servicosIds) {
    if (!nome || !especialidade) {
      alert('Nome e especialidade são obrigatórios!');
      return;
    }

    if (nome.length > 255) {
      alert('Nome muito longo! Máximo 255 caracteres.');
      return;
    }

    if (especialidade.length > 100) {
      alert('Especialidade muito longa! Máximo 100 caracteres.');
      return;
    }

    try {
      const novoColaborador = await api.createColaborador({ 
        nome, 
        especialidade,
        telefone: telefone || null,
        servicos: servicosIds || []
      });
      
      console.log('✅ Colaborador adicionado:', novoColaborador);
      
      await this.carregarColaboradores();
      this.limparFormulario();
      this.mostrarNotificacao('Colaborador adicionado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao adicionar colaborador:', error);
      this.mostrarNotificacao('Erro ao adicionar colaborador', 'error');
    }
  }

  async editarColaborador(id, nome, especialidade, telefone, servicosIds) {
    if (!nome || !especialidade) {
      alert('Nome e especialidade são obrigatórios!');
      return;
    }

    try {
      await api.updateColaborador(id, { 
        nome, 
        especialidade,
        telefone: telefone || null,
        servicos: servicosIds || []
      });
      console.log('✅ Colaborador atualizado');
      
      await this.carregarColaboradores();
      this.mostrarNotificacao('Colaborador atualizado com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao editar colaborador:', error);
      this.mostrarNotificacao('Erro ao editar colaborador', 'error');
    }
  }

  async removerColaborador(id) {
    if (!confirm('Tem certeza que deseja remover este colaborador?')) return;

    try {
      await api.deleteColaborador(id);
      console.log('✅ Colaborador removido');
      
      await this.carregarColaboradores();
      this.mostrarNotificacao('Colaborador removido com sucesso!', 'success');
    } catch (error) {
      console.error('❌ Erro ao remover colaborador:', error);
      this.mostrarNotificacao('Erro ao remover colaborador', 'error');
    }
  }

  renderizarColaboradores(colaboradores) {
    const lista = document.getElementById('lista-colaboradores');
    if (!lista) return;
    
    lista.innerHTML = '';

    if (colaboradores.length === 0) {
      lista.innerHTML = '<li class="list-group-item text-muted">Nenhum colaborador cadastrado</li>';
      return;
    }

    colaboradores.forEach(colaborador => {
      const li = document.createElement('li');
      li.className = 'list-group-item d-flex justify-content-between align-items-center';
      li.innerHTML = `
        <div>
          <strong>${colaborador.nome}</strong><br>
          <small class="text-muted">👨‍💼 ${colaborador.especialidade}</small><br>
          <small class="text-muted">📞 ${colaborador.telefone || 'Sem telefone'}</small>
        </div>
        <div>
          <button class="btn btn-sm btn-outline-primary me-2" 
                  onclick="window.editarColaboradorPrompt(${colaborador.id}, '${colaborador.nome.replace(/'/g, "\\'")}', '${colaborador.especialidade.replace(/'/g, "\\'")}', '${(colaborador.telefone || '').replace(/'/g, "\\'")}')">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger" 
                  onclick="window.colaboradorManager.removerColaborador(${colaborador.id})">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      `;
      lista.appendChild(li);
    });
  }

  atualizarSelectColaboradores(colaboradores) {
    const select = document.getElementById('colaborador');
    if (!select) return;
    
    select.innerHTML = '<option value="">Selecione um colaborador</option>';

    colaboradores.forEach(colaborador => {
      const option = document.createElement('option');
      option.value = colaborador.id;
      option.textContent = `${colaborador.nome} - ${colaborador.especialidade}`;
      select.appendChild(option);
    });
  }

  limparFormulario() {
    const nome = document.getElementById('nome-colaborador');
    const especialidade = document.getElementById('especialidade');
    const telefone = document.getElementById('telefone-colaborador');
    const servicos = document.getElementById('servicos-colaborador');
    
    if (nome) nome.value = '';
    if (especialidade) especialidade.value = '';
    if (telefone) telefone.value = '';
    if (servicos) {
      Array.from(servicos.options).forEach(option => option.selected = false);
    }
  }

  mostrarNotificacao(mensagem, tipo = 'info') {
    console.log(`${tipo.toUpperCase()}: ${mensagem}`);
    
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${tipo === 'error' ? 'danger' : 'success'} alert-dismissible fade show position-fixed`;
    alertDiv.style.top = '20px';
    alertDiv.style.right = '20px';
    alertDiv.style.zIndex = '1050';
    alertDiv.innerHTML = `
      ${mensagem}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
}

// Inicialização dos managers
const clienteManager = new ClienteManager();
const servicoManager = new ServicoManager();
const colaboradorManager = new ColaboradorManager();

// Tornar os managers globais para acesso pelos botões
window.clienteManager = clienteManager;
window.servicoManager = servicoManager;
window.colaboradorManager = colaboradorManager;

// Funções globais para os botões
window.editarClientePrompt = function(id, nome, telefone) {
  const novoNome = prompt('Novo nome:', nome);
  const novoTelefone = prompt('Novo telefone:', telefone);
  
  if (novoNome && novoTelefone) {
    clienteManager.editarCliente(id, novoNome, novoTelefone);
  }
};

window.editarServicoPrompt = function(id, nome, valor) {
  const novoNome = prompt('Novo nome:', nome);
  const novoValor = prompt('Novo valor:', valor);
  
  if (novoNome && novoValor) {
    servicoManager.editarServico(id, novoNome, novoValor);
  }
};

window.editarColaboradorPrompt = function(id, nome, especialidade, telefone) {
  const novoNome = prompt('Novo nome:', nome);
  const novaEspecialidade = prompt('Nova especialidade:', especialidade);
  const novoTelefone = prompt('Novo telefone:', telefone);
  
  if (novoNome && novaEspecialidade) {
    colaboradorManager.editarColaborador(id, novoNome, novaEspecialidade, novoTelefone, []);
  }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // ============ NAVEGAÇÃO ============
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = e.target.closest('.nav-link').dataset.section;
      
      // Esconder todas as seções
      document.querySelectorAll('section').forEach(s => s.classList.add('d-none'));
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      
      // Mostrar seção selecionada
      const targetSection = document.getElementById(section);
      if (targetSection) {
        targetSection.classList.remove('d-none');
        e.target.closest('.nav-link').classList.add('active');
      }
    });
  });

  // ============ MÁSCARAS ============
  // Máscara para telefone
  const telefoneInputs = document.querySelectorAll('#telefone, #telefone-colaborador');
  telefoneInputs.forEach(input => {
    if (input) {
      input.addEventListener('input', (e) => {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length <= 11) {
          if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
          } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
          }
          e.target.value = value;
        } else {
          e.target.value = e.target.value.slice(0, -1);
        }
      });

      input.placeholder = '(11) 99999-9999';
      input.maxLength = 15;
    }
  });

  // ============ BOTÕES CLIENTES ============
  const addCliente = document.getElementById('add-cliente');
  if (addCliente) {
    addCliente.addEventListener('click', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome')?.value.trim();
      const telefone = document.getElementById('telefone')?.value.trim();
      if (nome && telefone) {
        clienteManager.adicionarCliente(nome, telefone);
      }
    });
  }

  // ============ BOTÕES SERVIÇOS ============
  const addServico = document.getElementById('add-servico');
  if (addServico) {
    addServico.addEventListener('click', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome-servico')?.value.trim();
      const valor = document.getElementById('valor-servico')?.value;
      if (nome && valor) {
        servicoManager.adicionarServico(nome, valor);
      }
    });
  }

  // ============ BOTÕES COLABORADORES ============
  const addColaborador = document.getElementById('add-colaborador');
  if (addColaborador) {
    addColaborador.addEventListener('click', (e) => {
      e.preventDefault();
      const nome = document.getElementById('nome-colaborador')?.value.trim();
      const especialidade = document.getElementById('especialidade')?.value.trim();
      const telefone = document.getElementById('telefone-colaborador')?.value.trim();
      
      // Pegar serviços selecionados
      const servicosSelect = document.getElementById('servicos-colaborador');
      const servicosIds = Array.from(servicosSelect.selectedOptions).map(option => option.value);
      
      if (nome && especialidade) {
        colaboradorManager.adicionarColaborador(nome, especialidade, telefone, servicosIds);
      } else {
        alert('Por favor, preencha nome e especialidade!');
      }
    });
  }

  // ============ FORMULÁRIOS ============
  // Form de cliente
  const formCliente = document.getElementById('form-cliente');
  if (formCliente) {
    formCliente.addEventListener('submit', (e) => {
      e.preventDefault();
      addCliente.click();
    });
  }

  // Form de serviço
  const formServico = document.getElementById('form-servico');
  if (formServico) {
    formServico.addEventListener('submit', (e) => {
      e.preventDefault();
      addServico.click();
    });
  }

  // Form de colaborador
  const formColaborador = document.getElementById('form-colaborador');
  if (formColaborador) {
    formColaborador.addEventListener('submit', (e) => {
      e.preventDefault();
      addColaborador.click();
    });
  }

  // ============ AUTO-PREENCHIMENTO ============
  const servicoSelect = document.getElementById('servico');
  if (servicoSelect) {
    servicoSelect.addEventListener('change', (e) => {
      const valorElement = e.target.selectedOptions[0]?.dataset.valor;
      const valorInput = document.getElementById('valor-agendamento');
      if (valorInput && valorElement) {
        valorInput.value = `R$ ${parseFloat(valorElement).toFixed(2)}`;
      }
    });
  }

  console.log('🚀 Style Cut carregado completamente!');
  console.log('📊 Managers disponíveis:', { clienteManager, servicoManager, colaboradorManager });
});

// Status da conexão
setInterval(async () => {
  try {
    await api.request('/clientes');
    console.log('🌐 API Online');
  } catch (error) {
    console.log('📱 API Offline - usando localStorage');
  }
}, 30000);

// Tratar erros globais
window.addEventListener('error', (e) => {
  console.error('💥 Erro JavaScript:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('💥 Promise rejeitada:', e.reason);
});