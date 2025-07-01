import { ClienteManager, renderList, atualizarListaClientes, atualizarSelectClientes } from './clientes.js';
import { ColaboradorManager, atualizarListaColaboradores, atualizarSelectColaboradores } from './colaboradores.js';
import { ServicoManager, atualizarListaServicos, atualizarSelectServicosColaborador } from './servicos.js';
import { AgendamentoManager, atualizarListaAgendamentos, atualizarSelectServicos, atualizarValorAgendamento } from './agendamentos.js';
import { TemaManager } from './temas.js';
import { UIEnhancements } from './ui-enhancements.js';

// Inicialização dos gerenciadores
const clienteManager = new ClienteManager();
const colaboradorManager = new ColaboradorManager();
const servicoManager = new ServicoManager();
const agendamentoManager = new AgendamentoManager();
const temaManager = new TemaManager();
const uiEnhancements = new UIEnhancements();

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar interface
  initializeInterface();
  setupEventListeners();
});

function initializeInterface() {
  atualizarListaClientes(clienteManager, agendamentoManager.getAgendamentos());
  atualizarSelectClientes(clienteManager);
  atualizarListaColaboradores(colaboradorManager, agendamentoManager.getAgendamentos());
  atualizarSelectColaboradores(colaboradorManager);
  atualizarListaServicos(servicoManager, agendamentoManager.getAgendamentos(), colaboradorManager.getColaboradores());
  atualizarSelectServicosColaborador(servicoManager);
  atualizarListaAgendamentos(agendamentoManager, colaboradorManager.getColaboradores(), servicoManager.getServicos());
  
  // Configurar tema inicial
  const currentTheme = temaManager.getCurrentTheme();
  document.getElementById('toggle-theme').innerHTML = `
    <i class="bi bi-${currentTheme === 'light' ? 'moon' : 'sun'}-fill me-2"></i>
    <span>${currentTheme === 'light' ? 'Tema Escuro' : 'Tema Claro'}</span>
  `;
}

function setupEventListeners() {
  // Evento para alternar tema
  document.getElementById('toggle-theme').addEventListener('click', () => {
    const novoTema = temaManager.toggleTheme();
    const button = document.getElementById('toggle-theme');
    button.innerHTML = `
      <i class="bi bi-${novoTema === 'light' ? 'moon' : 'sun'}-fill me-2"></i>
      <span>${novoTema === 'light' ? 'Tema Escuro' : 'Tema Claro'}</span>
    `;
    uiEnhancements.showNotification(`Tema ${novoTema === 'light' ? 'claro' : 'escuro'} ativado!`, 'info');
  });

  // Evento para o guia de uso
  document.getElementById('toggle-guia').addEventListener('click', function () {
    const isExpanded = this.getAttribute('aria-expanded') === 'true';
    this.innerHTML = `
      <i class="bi bi-question-circle me-2"></i>
      <span>${isExpanded ? 'Mostrar Guia de Uso' : 'Esconder Guia de Uso'}</span>
    `;
  });

  // Evento para adicionar/editar cliente
  document.getElementById('add-cliente').addEventListener('click', async () => {
    const button = document.getElementById('add-cliente');
    uiEnhancements.showLoader(button);
    
    const cliente = {
      nome: document.getElementById('nome').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
    };
    
    if (clienteManager.addOrUpdateCliente(cliente)) {
      atualizarListaClientes(clienteManager, agendamentoManager.getAgendamentos());
      atualizarSelectClientes(clienteManager);
      document.getElementById('nome').value = '';
      document.getElementById('telefone').value = '';
      document.getElementById('add-cliente').innerHTML = '<i class="bi bi-person-plus me-2"></i>Adicionar Cliente';
      
      uiEnhancements.showNotification('Cliente adicionado com sucesso!', 'success');
    } else {
      uiEnhancements.showNotification('Erro ao adicionar cliente. Verifique os dados.', 'error');
    }
    
    uiEnhancements.hideLoader(button);
  });

  // Evento para adicionar/editar colaborador
  document.getElementById('add-colaborador').addEventListener('click', async () => {
    const button = document.getElementById('add-colaborador');
    uiEnhancements.showLoader(button);
    
    const colaborador = {
      nome: document.getElementById('nome-colaborador').value.trim(),
      especialidade: document.getElementById('especialidade').value.trim(),
      servicos: Array.from(document.getElementById('servicos-colaborador').selectedOptions).map(opt => ({
        id: opt.value,
        nome: opt.text.split(' (')[0],
        valor: parseFloat(opt.text.match(/R\$ ([\d.]+)/)[1])
      }))
    };
    
    if (colaboradorManager.addOrUpdateColaborador(colaborador)) {
      atualizarListaColaboradores(colaboradorManager, agendamentoManager.getAgendamentos());
      atualizarSelectColaboradores(colaboradorManager);
      document.getElementById('nome-colaborador').value = '';
      document.getElementById('especialidade').value = '';
      document.getElementById('servicos-colaborador').selectedIndex = -1;
      document.getElementById('add-colaborador').innerHTML = '<i class="bi bi-person-plus me-2"></i>Adicionar Colaborador';
      
      uiEnhancements.showNotification('Colaborador adicionado com sucesso!', 'success');
    } else {
      uiEnhancements.showNotification('Erro ao adicionar colaborador. Verifique os dados.', 'error');
    }
    
    uiEnhancements.hideLoader(button);
  });

  // Evento para adicionar/editar serviço
  document.getElementById('add-servico').addEventListener('click', async () => {
    const button = document.getElementById('add-servico');
    uiEnhancements.showLoader(button);
    
    const servico = {
      nome: document.getElementById('nome-servico').value.trim(),
      valor: parseFloat(document.getElementById('valor-servico').value)
    };
    
    if (servicoManager.addOrUpdateServico(servico)) {
      atualizarListaServicos(servicoManager, agendamentoManager.getAgendamentos(), colaboradorManager.getColaboradores());
      atualizarSelectServicosColaborador(servicoManager);
      document.getElementById('nome-servico').value = '';
      document.getElementById('valor-servico').value = '';
      document.getElementById('add-servico').innerHTML = '<i class="bi bi-plus-circle me-2"></i>Adicionar Serviço';
      
      uiEnhancements.showNotification('Serviço adicionado com sucesso!', 'success');
    } else {
      uiEnhancements.showNotification('Erro ao adicionar serviço. Verifique os dados.', 'error');
    }
    
    uiEnhancements.hideLoader(button);
  });

  // Evento para adicionar/editar agendamento
  document.getElementById('add-agendamento').addEventListener('click', async () => {
    const button = document.getElementById('add-agendamento');
    uiEnhancements.showLoader(button);
    
    const agendamento = {
      cliente: document.getElementById('cliente').value,
      colaborador: document.getElementById('colaborador').value,
      servico: document.getElementById('servico').value,
      data: document.getElementById('data').value,
      hora: document.getElementById('hora').value
    };
    
    if (agendamentoManager.addOrUpdateAgendamento(agendamento, colaboradorManager.getColaboradores(), servicoManager.getServicos())) {
      atualizarListaAgendamentos(agendamentoManager, colaboradorManager.getColaboradores(), servicoManager.getServicos());
      document.getElementById('servico').value = '';
      document.getElementById('data').value = '';
      document.getElementById('hora').value = '';
      document.getElementById('add-agendamento').innerHTML = '<i class="bi bi-calendar-check me-2"></i>Confirmar Agendamento';
      
      uiEnhancements.showNotification('Agendamento confirmado com sucesso!', 'success');
    } else {
      uiEnhancements.showNotification('Erro ao confirmar agendamento. Verifique os dados.', 'error');
    }
    
    uiEnhancements.hideLoader(button);
  });

  // Atualizar serviços ao selecionar colaborador
  document.getElementById('colaborador').addEventListener('change', () => {
    const colaboradorId = document.getElementById('colaborador').value;
    atualizarSelectServicos(colaboradorId, colaboradorManager.getColaboradores(), servicoManager.getServicos());
    atualizarValorAgendamento(colaboradorId, document.getElementById('servico').value, colaboradorManager.getColaboradores(), servicoManager.getServicos());
  });

  // Atualizar valor ao selecionar serviço
  document.getElementById('servico').addEventListener('change', () => {
    const colaboradorId = document.getElementById('colaborador').value;
    const servicoId = document.getElementById('servico').value;
    atualizarValorAgendamento(colaboradorId, servicoId, colaboradorManager.getColaboradores(), servicoManager.getServicos());
  });
}