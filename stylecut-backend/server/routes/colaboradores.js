const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

router.get("/", async (_, res) => {
  const data = await prisma.colaborador.findMany();
  res.json(data);
});

router.post("/", async (req, res) => {
  const data = await prisma.colaborador.create({ data: req.body });
  res.json(data);
});

router.put("/:id", async (req, res) => {
  const data = await prisma.colaborador.update({
    where: { id: parseInt(req.params.id) },
    data: req.body,
  });
  res.json(data);
});

router.delete("/:id", async (req, res) => {
  await prisma.colaborador.delete({ where: { id: parseInt(req.params.id) } });
  res.sendStatus(204);
});

module.exports = router;