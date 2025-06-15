let clientes = [];
let colaboradores = [];
let servicos = [];
let agendamentos = [];
let clienteEditando = null;
let colaboradorEditando = null;
let servicoEditando = null;
let agendamentoEditando = null;

document.addEventListener('DOMContentLoaded', () => {
  // Carregar tema salvo
  const temaSalvo = localStorage.getItem('tema') || 'light';
  document.body.className = temaSalvo;
  atualizarBotaoTema(temaSalvo);

  // Evento para alternar tema
  document.getElementById('toggle-theme').addEventListener('click', () => {
    const novoTema = document.body.className === 'light' ? 'dark' : 'light';
    document.body.className = novoTema;
    localStorage.setItem('tema', novoTema);
    atualizarBotaoTema(novoTema);
  });

  carregarDados();
  atualizarListaClientes();
  atualizarSelectClientes();
  atualizarListaColaboradores();
  atualizarSelectColaboradores();
  atualizarListaServicos();
  atualizarSelectServicos();
  atualizarListaAgendamentos();

  // Adicionar Cliente
  document.getElementById('add-cliente').addEventListener('click', () => {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value.trim();
    if (nome === '' || telefone === '') {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (clienteEditando !== null) {
      clientes[clienteEditando] = { nome, telefone };
      clienteEditando = null;
      document.getElementById('add-cliente').textContent = 'Adicionar Cliente';
    } else {
      clientes.push({ nome, telefone });
    }
    salvarDados();
    atualizarListaClientes();
    atualizarSelectClientes();
    document.getElementById('nome').value = '';
    document.getElementById('telefone').value = '';
  });

  // Adicionar Colaborador
  document.getElementById('add-colaborador').addEventListener('click', () => {
    const nome = document.getElementById('nome-colaborador').value.trim();
    const especialidade = document.getElementById('especialidade').value.trim();
    const servicosSelecionados = Array.from(document.getElementById('servicos-colaborador').selectedOptions).map(opt => ({
      id: opt.value,
      nome: opt.text.split(' (')[0],
      valor: parseFloat(opt.text.match(/R\$ ([\d.]+)/)[1])
    }));
    if (nome === '' || especialidade === '') {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    if (colaboradorEditando !== null) {
      colaboradores[colaboradorEditando] = { id: colaboradores[colaboradorEditando].id, nome, especialidade, servicos: servicosSelecionados };
      colaboradorEditando = null;
      document.getElementById('add-colaborador').textContent = 'Adicionar Colaborador';
    } else {
      colaboradores.push({ id: gerarId(), nome, especialidade, servicos: servicosSelecionados });
    }
    salvarDados();
    atualizarListaColaboradores();
    atualizarSelectColaboradores();
    document.getElementById('nome-colaborador').value = '';
    document.getElementById('especialidade').value = '';
    document.getElementById('servicos-colaborador').selectedIndex = -1;
  });

  // Adicionar Serviço
  document.getElementById('add-servico').addEventListener('click', () => {
    const nome = document.getElementById('nome-servico').value.trim();
    const valor = parseFloat(document.getElementById('valor-servico').value);
    if (nome === '' || isNaN(valor) || valor <= 0) {
      alert('Por favor, preencha o nome e um valor válido.');
      return;
    }
    if (servicoEditando !== null) {
      servicos[servicoEditando] = { id: servicos[servicoEditando].id, nome, valor };
      servicoEditando = null;
      document.getElementById('add-servico').textContent = 'Adicionar Serviço';
    } else {
      servicos.push({ id: gerarId(), nome, valor });
    }
    salvarDados();
    atualizarListaServicos();
    atualizarSelectServicos();
    document.getElementById('nome-servico').value = '';
    document.getElementById('valor-servico').value = '';
  });

  // Adicionar ou Editar Agendamento
  document.getElementById('add-agendamento').addEventListener('click', () => {
    const cliente = document.getElementById('cliente').value;
    const colaboradorId = document.getElementById('colaborador').value;
    const servicoId = document.getElementById('servico').value;
    const data = document.getElementById('data').value;
    const hora = document.getElementById('hora').value;
    if (!cliente || !colaboradorId || !servicoId || !data || !hora) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
    const hoje = new Date();
    const dataAgendamento = new Date(data + 'T' + hora);
    if (dataAgendamento <= hoje) {
      alert('A data e hora do agendamento devem ser futuras.');
      return;
    }
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    const servico = servicos.find(s => s.id === servicoId);
    const valor = colaborador.servicos.find(s => s.id === servicoId)?.valor || servico.valor;
    if (agendamentoEditando !== null) {
      agendamentos[agendamentoEditando] = { id: agendamentos[agendamentoEditando].id, cliente, colaborador: colaboradorId, servico: servicoId, data, hora, valor };
      agendamentoEditando = null;
      document.getElementById('add-agendamento').textContent = 'Agendar';
    } else {
      agendamentos.push({ id: gerarId(), cliente, colaborador: colaboradorId, servico: servicoId, data, hora, valor });
    }
    salvarDados();
    atualizarListaAgendamentos();
    document.getElementById('servico').value = '';
    document.getElementById('data').value = '';
    document.getElementById('hora').value = '';
  });

  // Atualizar serviços disponíveis ao selecionar colaborador
  document.getElementById('colaborador').addEventListener('change', () => {
    const colaboradorId = document.getElementById('colaborador').value;
    const colaborador = colaboradores.find(c => c.id === colaboradorId);
    const selectServico = document.getElementById('servico');
    selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
    if (colaborador) {
      colaborador.servicos.forEach(servico => {
        const option = document.createElement('option');
        option.value = servico.id;
        option.textContent = `${servico.nome} (R$ ${servico.valor.toFixed(2)})`;
        selectServico.appendChild(option);
      });
    }
    atualizarValorAgendamento();
  });

  // Atualizar valor do agendamento ao selecionar serviço
  document.getElementById('servico').addEventListener('change', atualizarValorAgendamento);
});

function atualizarBotaoTema(tema) {
  document.getElementById('toggle-theme').textContent = tema === 'light' ? 'Tema Escuro' : 'Tema Claro';
}

function gerarId() {
  return Math.random().toString(36).substr(2, 9);
}

function salvarDados() {
  localStorage.setItem('clientes', JSON.stringify(clientes));
  localStorage.setItem('colaboradores', JSON.stringify(colaboradores));
  localStorage.setItem('servicos', JSON.stringify(servicos));
  localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
}

function carregarDados() {
  const clientesSalvos = localStorage.getItem('clientes');
  const colaboradoresSalvos = localStorage.getItem('colaboradores');
  const servicosSalvos = localStorage.getItem('servicos');
  const agendamentosSalvos = localStorage.getItem('agendamentos');
  if (clientesSalvos) clientes = JSON.parse(clientesSalvos);
  if (colaboradoresSalvos) colaboradores = JSON.parse(colaboradoresSalvos);
  if (servicosSalvos) servicos = JSON.parse(servicosSalvos);
  if (agendamentosSalvos) agendamentos = JSON.parse(agendamentosSalvos);
}

function atualizarListaClientes() {
  const lista = document.getElementById('lista-clientes');
  lista.innerHTML = '';
  clientes.forEach((cliente, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${cliente.nome} - ${cliente.telefone}`;
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-sm btn-warning me-2';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarCliente(index));
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-sm btn-danger';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirCliente(index));
    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

function atualizarSelectClientes() {
  const select = document.getElementById('cliente');
  select.innerHTML = '<option value="">Selecione um cliente</option>';
  clientes.forEach(cliente => {
    const option = document.createElement('option');
    option.value = cliente.nome;
    option.textContent = cliente.nome;
    select.appendChild(option);
  });
}

function atualizarListaColaboradores() {
  const lista = document.getElementById('lista-colaboradores');
  lista.innerHTML = '';
  colaboradores.forEach((colaborador, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${colaborador.nome} - ${colaborador.especialidade} (Serviços: ${colaborador.servicos.map(s => s.nome).join(', ')})`;
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-sm btn-warning me-2';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarColaborador(index));
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-sm btn-danger';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirColaborador(index));
    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

function atualizarSelectColaboradores() {
  const select = document.getElementById('colaborador');
  select.innerHTML = '<option value="">Selecione um colaborador</option>';
  colaboradores.forEach(colaborador => {
    const option = document.createElement('option');
    option.value = colaborador.id;
    option.textContent = colaborador.nome;
    select.appendChild(option);
  });
}

function atualizarListaServicos() {
  const lista = document.getElementById('lista-servicos');
  lista.innerHTML = '';
  servicos.forEach((servico, index) => {
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${servico.nome} - R$ ${servico.valor.toFixed(2)}`;
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-sm btn-warning me-2';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarServico(index));
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-sm btn-danger';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirServico(index));
    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
  atualizarSelectServicosColaborador();
}

function atualizarSelectServicosColaborador() {
  const select = document.getElementById('servicos-colaborador');
  select.innerHTML = '';
  servicos.forEach(servico => {
    const option = document.createElement('option');
    option.value = servico.id;
    option.textContent = `${servico.nome} (R$ ${servico.valor.toFixed(2)})`;
    select.appendChild(option);
  });
}

function atualizarSelectServicos() {
  const select = document.getElementById('servico');
  select.innerHTML = '<option value="">Selecione um serviço</option>';
  const colaboradorId = document.getElementById('colaborador').value;
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

function atualizarListaAgendamentos() {
  const lista = document.getElementById('lista-agendamentos');
  lista.innerHTML = '';
  agendamentos.forEach((agendamento, index) => {
    const colaborador = colaboradores.find(c => c.id === agendamento.colaborador);
    const servico = servicos.find(s => s.id === agendamento.servico);
    const li = document.createElement('li');
    li.className = 'list-group-item d-flex justify-content-between align-items-center';
    li.textContent = `${agendamento.cliente} com ${colaborador ? colaborador.nome : 'Desconhecido'} - ${servico ? servico.nome : 'Desconhecido'} (R$ ${agendamento.valor.toFixed(2)}) em ${agendamento.data} às ${agendamento.hora}`;
    const btnEditar = document.createElement('button');
    btnEditar.className = 'btn btn-sm btn-warning me-2';
    btnEditar.textContent = 'Editar';
    btnEditar.addEventListener('click', () => editarAgendamento(index));
    const btnExcluir = document.createElement('button');
    btnExcluir.className = 'btn btn-sm btn-danger';
    btnExcluir.textContent = 'Excluir';
    btnExcluir.addEventListener('click', () => excluirAgendamento(index));
    li.appendChild(btnEditar);
    li.appendChild(btnExcluir);
    lista.appendChild(li);
  });
}

function atualizarValorAgendamento() {
  const colaboradorId = document.getElementById('colaborador').value;
  const servicoId = document.getElementById('servico').value;
  const colaborador = colaboradores.find(c => c.id === colaboradorId);
  const valorInput = document.getElementById('valor-agendamento');
  if (colaborador && servicoId) {
    const servico = colaborador.servicos.find(s => s.id === servicoId) || servicos.find(s => s.id === servicoId);
    valorInput.value = servico ? `R$ ${servico.valor.toFixed(2)}` : '';
  } else {
    valorInput.value = '';
  }
}

function editarCliente(index) {
  clienteEditando = index;
  const cliente = clientes[index];
  document.getElementById('nome').value = cliente.nome;
  document.getElementById('telefone').value = cliente.telefone;
  document.getElementById('add-cliente').textContent = 'Salvar Alterações';
}

function excluirCliente(index) {
  const clienteNome = clientes[index].nome;
  const temAgendamentos = agendamentos.some(agendamento => agendamento.cliente === clienteNome);
  if (temAgendamentos) {
    alert('Este cliente tem agendamentos. Não é possível excluir.');
    return;
  }
  if (confirm('Tem certeza que deseja excluir este cliente?')) {
    clientes.splice(index, 1);
    salvarDados();
    atualizarListaClientes();
    atualizarSelectClientes();
  }
}

function editarColaborador(index) {
  colaboradorEditando = index;
  const colaborador = colaboradores[index];
  document.getElementById('nome-colaborador').value = colaborador.nome;
  document.getElementById('especialidade').value = colaborador.especialidade;
  const select = document.getElementById('servicos-colaborador');
  Array.from(select.options).forEach(opt => {
    opt.selected = colaborador.servicos.some(s => s.id === opt.value);
  });
  document.getElementById('add-colaborador').textContent = 'Salvar Alterações';
}

function excluirColaborador(index) {
  const colaboradorId = colaboradores[index].id;
  const temAgendamentos = agendamentos.some(agendamento => agendamento.colaborador === colaboradorId);
  if (temAgendamentos) {
    alert('Este colaborador tem agendamentos. Não é possível excluir.');
    return;
  }
  if (confirm('Tem certeza que deseja excluir este colaborador?')) {
    colaboradores.splice(index, 1);
    salvarDados();
    atualizarListaColaboradores();
    atualizarSelectColaboradores();
  }
}

function editarServico(index) {
  servicoEditando = index;
  const servico = servicos[index];
  document.getElementById('nome-servico').value = servico.nome;
  document.getElementById('valor-servico').value = servico.valor;
  document.getElementById('add-servico').textContent = 'Salvar Alterações';
}

function excluirServico(index) {
  const servicoId = servicos[index].id;
  const temAgendamentos = agendamentos.some(agendamento => agendamento.servico === servicoId);
  const temColaboradores = colaboradores.some(colaborador => colaborador.servicos.some(s => s.id === servicoId));
  if (temAgendamentos || temColaboradores) {
    alert('Este serviço está associado a agendamentos ou colaboradores. Não é possível excluir.');
    return;
  }
  if (confirm('Tem certeza que deseja excluir este serviço?')) {
    servicos.splice(index, 1);
    salvarDados();
    atualizarListaServicos();
    atualizarSelectServicosColaborador();
  }
}

function editarAgendamento(index) {
  agendamentoEditando = index;
  const agendamento = agendamentos[index];
  document.getElementById('cliente').value = agendamento.cliente;
  document.getElementById('colaborador').value = agendamento.colaborador;
  atualizarSelectServicos();
  document.getElementById('servico').value = agendamento.servico;
  document.getElementById('data').value = agendamento.data;
  document.getElementById('hora').value = agendamento.hora;
  atualizarValorAgendamento();
  document.getElementById('add-agendamento').textContent = 'Salvar Alterações';
}

function excluirAgendamento(index) {
  if (confirm('Tem certeza que deseja excluir este agendamento?')) {
    agendamentos.splice(index, 1);
    salvarDados();
    atualizarListaAgendamentos();
  }
}