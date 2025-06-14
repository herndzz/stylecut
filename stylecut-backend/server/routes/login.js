const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const USUARIO_FIXO = {
  email: "admin@stylecut.com",
  senha: "123456",
};

router.post("/", (req, res) => {
  const { email, senha } = req.body;
  if (email === USUARIO_FIXO.email && senha === USUARIO_FIXO.senha) {
    const token = jwt.sign({ email }, "segredo123", { expiresIn: "1h" });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

module.exports = router;