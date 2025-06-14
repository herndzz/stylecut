const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const clientesRoutes = require("./server/routes/clientes.js");
const appointmentsRoutes = require("./server/routes/appointments.js");
//const colaboradoresRoutes = require("./server/routes/colaboradores.js");
//const loginRoute = require("./server/routes/login.js");

app.use("/clientes", clientesRoutes);
app.use("/agendamentos", appointmentsRoutes);
//app.use("/colaboradores", colaboradoresRoutes);
//app.use("/login", loginRoute);

// Rota padrão (resposta simples para GET /)
app.get("/", (req, res) => {
  res.send("✅ API StyleCut está rodando!");
});

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});