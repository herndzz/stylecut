const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Criar cliente
router.post("/", async (req, res) => {
  const { nome, telefone, historico } = req.body;
  try {
    const cliente = await prisma.cliente.create({
      data: { nome, telefone, historico },
    });
    res.status(201).json(cliente);
  } catch (error) {
    res.status(500).json({ error: "Erro ao criar cliente." });
  }
});

// Listar clientes
router.get("/", async (req, res) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
});

module.exports = router;