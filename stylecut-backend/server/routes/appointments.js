const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.post("/", async (req, res) => {
  const { clienteId, colaboradorId, horario, servico } = req.body;
  const novo = await prisma.agendamento.create({
    data: { clienteId, colaboradorId, horario: new Date(horario), servico },
  });
  res.json(novo);
});

router.get("/", async (req, res) => {
  const agendamentos = await prisma.agendamento.findMany({
    include: { cliente: true, colaborador: true },
  });
  res.json(agendamentos);
});

module.exports = router;