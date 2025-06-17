import { ClienteManager, renderList, atualizarListaClientes, atualizarSelectClientes } from './clientes.js';
import { ColaboradorManager, atualizarListaColaboradores, atualizarSelectColaboradores } from './colaboradores.js';
import { ServicoManager, atualizarListaServicos, atualizarSelectServicosColaborador } from './servicos.js';
import { AgendamentoManager, atualizarListaAgendamentos, atualizarSelectServicos, atualizarValorAgendamento } from './agendamentos.js';
import { TemaManager } from './temas.js';

// Inicialização dos gerenciadores
const clienteManager = new ClienteManager();
const colaboradorManager = new ColaboradorManager();
const servicoManager = new ServicoManager();
const agendamentoManager = new AgendamentoManager();
const temaManager = new TemaManager();

document.addEventListener('DOMContentLoaded', () => {
  // Inicializar interface
  atualizarListaClientes(clienteManager, agendamentoManager.getAgendamentos());
  atualizarSelectClientes(clienteManager);
  atualizarListaColaboradores(colaboradorManager, agendamentoManager.getAgendamentos());
  atualizarSelectColaboradores(colaboradorManager);
  atualizarListaServicos(servicoManager, agendamentoManager.getAgendamentos(), colaboradorManager.getColaboradores());
  atualizarSelectServicosColaborador(servicoManager);
  atualizarListaAgendamentos(agendamentoManager, colaboradorManager.getColaboradores(), servicoManager.getServicos());
  document.getElementById('toggle-theme').textContent = temaManager.getCurrentTheme() === 'light' ? 'Tema Escuro' : 'Tema Claro';

  // Evento para alternar tema
  document.getElementById('toggle-theme').addEventListener('click', () => {
    const novoTema = temaManager.toggleTheme();
    document.getElementById('toggle-theme').textContent = novoTema === 'light' ? 'Tema Escuro' : 'Tema Claro';
  });

  // Evento para o guia de uso
  document.getElementById('toggle-guia').addEventListener('click', function () {
    this.textContent = this.getAttribute('aria-expanded') === 'true' ? 'Esconder Guia de Uso' : 'Mostrar Guia de Uso';
  });

  // Evento para adicionar/editar cliente
  document.getElementById('add-cliente').addEventListener('click', () => {
    const cliente = {
      nome: document.getElementById('nome').value.trim(),
      telefone: document.getElementById('telefone').value.trim(),
    };
    if (clienteManager.addOrUpdateCliente(cliente)) {
      atualizarListaClientes(clienteManager, agendamentoManager.getAgendamentos());
      atualizarSelectClientes(clienteManager);
      document.getElementById('nome').value = '';
      document.getElementById('telefone').value = '';
      document.getElementById('add-cliente').textContent = 'Adicionar Cliente';
    }
  });

  // Evento para adicionar/editar colaborador
  document.getElementById('add-colaborador').addEventListener('click', () => {
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
      document.getElementById('add-colaborador').textContent = 'Adicionar Colaborador';
    }
  });

  // Evento para adicionar/editar serviço
  document.getElementById('add-servico').addEventListener('click', () => {
    const servico = {
      nome: document.getElementById('nome-servico').value.trim(),
      valor: parseFloat(document.getElementById('valor-servico').value)
    };
    if (servicoManager.addOrUpdateServico(servico)) {
      atualizarListaServicos(servicoManager, agendamentoManager.getAgendamentos(), colaboradorManager.getColaboradores());
      atualizarSelectServicosColaborador(servicoManager);
      document.getElementById('nome-servico').value = '';
      document.getElementById('valor-servico').value = '';
      document.getElementById('add-servico').textContent = 'Adicionar Serviço';
    }
  });

  // Evento para adicionar/editar agendamento
  document.getElementById('add-agendamento').addEventListener('click', () => {
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
      document.getElementById('add-agendamento').textContent = 'Agendar';
    }
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
});