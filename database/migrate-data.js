import { ClienteHybridStorage } from './client-hybrid.js';
import { ColaboradorHybridStorage } from './colaborador-hybrid.js';
import { ServicoHybridStorage } from './servico-hybrid.js';
import { AgendamentoHybridStorage } from './agendamento-hybrid.js';

async function migrarDados() {
  console.log('🔄 Iniciando migração de dados do localStorage para PostgreSQL...');
  
  try {
    // Instanciar storages híbridos
    const clienteStorage = new ClienteHybridStorage();
    const colaboradorStorage = new ColaboradorHybridStorage();
    const servicoStorage = new ServicoHybridStorage();
    const agendamentoStorage = new AgendamentoHybridStorage();

    // Migrar clientes
    console.log('👥 Migrando clientes...');
    const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
    for (const cliente of clientesLocal) {
      try {
        await clienteStorage.saveToDatabase(cliente);
        console.log(`✅ Cliente ${cliente.nome} migrado`);
      } catch (error) {
        console.log(`⚠️ Cliente ${cliente.nome} já existe ou erro: ${error.message}`);
      }
    }

    // Migrar serviços
    console.log('💇 Migrando serviços...');
    const servicosLocal = JSON.parse(localStorage.getItem('servicos') || '[]');
    for (const servico of servicosLocal) {
      try {
        await servicoStorage.saveToDatabase(servico);
        console.log(`✅ Serviço ${servico.nome} migrado`);
      } catch (error) {
        console.log(`⚠️ Serviço ${servico.nome} já existe ou erro: ${error.message}`);
      }
    }

    // Migrar colaboradores
    console.log('👨‍💼 Migrando colaboradores...');
    const colaboradoresLocal = JSON.parse(localStorage.getItem('colaboradores') || '[]');
    for (const colaborador of colaboradoresLocal) {
      try {
        await colaboradorStorage.saveToDatabase(colaborador);
        console.log(`✅ Colaborador ${colaborador.nome} migrado`);
      } catch (error) {
        console.log(`⚠️ Colaborador ${colaborador.nome} já existe ou erro: ${error.message}`);
      }
    }

    // Migrar agendamentos
    console.log('📅 Migrando agendamentos...');
    const agendamentosLocal = JSON.parse(localStorage.getItem('agendamentos') || '[]');
    for (const agendamento of agendamentosLocal) {
      try {
        await agendamentoStorage.saveToDatabase(agendamento);
        console.log(`✅ Agendamento ${agendamento.data} ${agendamento.hora} migrado`);
      } catch (error) {
        console.log(`⚠️ Agendamento já existe ou erro: ${error.message}`);
      }
    }

    console.log('🎉 Migração concluída com sucesso!');
    
    // Fazer backup do localStorage
    const backup = {
      clientes: clientesLocal,
      colaboradores: colaboradoresLocal,
      servicos: servicosLocal,
      agendamentos: agendamentosLocal,
      migrado_em: new Date().toISOString()
    };
    
    localStorage.setItem('backup_pre_migracao', JSON.stringify(backup));
    console.log('💾 Backup do localStorage criado');

  } catch (error) {
    console.error('❌ Erro durante migração:', error);
  }
}

// Auto-executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  migrarDados();
}

export { migrarDados };