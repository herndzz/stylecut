const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const appointmentsRoutes = require("./server/routes/appointments.js");
app.use("/agendamentos", appointmentsRoutes);

const clientesRoutes = require("./server/routes/clientes.js");
app.use("/clientes", clientesRoutes);

// Rota padrão (resposta simples para GET /)
app.get("/", (req, res) => {
  res.send("✅ API StyleCut está rodando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});