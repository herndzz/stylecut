-- CreateTable
CREATE TABLE "Cliente" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "historico" TEXT
);

-- CreateTable
CREATE TABLE "Colaborador" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "nome" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Agendamento" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "horario" DATETIME NOT NULL,
    "servico" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "colaboradorId" INTEGER NOT NULL,
    CONSTRAINT "Agendamento_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Agendamento_colaboradorId_fkey" FOREIGN KEY ("colaboradorId") REFERENCES "Colaborador" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
