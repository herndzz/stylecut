const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Cria um cliente
  const cliente = await prisma.cliente.create({
    data: {
      nome: 'João da Silva',
      telefone: '31999990000',
      historico: 'Corte masculino, barba',
    },
  });

  // Cria um colaborador
  const colaborador = await prisma.colaborador.create({
    data: {
      nome: 'Carla Souza',
    },
  });

  // Cria um agendamento
  const agendamento = await prisma.agendamento.create({
    data: {
      horario: new Date('2025-06-13T14:30:00Z'),
      servico: 'Corte de cabelo + barba',
      clienteId: cliente.id,
      colaboradorId: colaborador.id,
    },
  });

  console.log('✔ Dados inseridos com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });