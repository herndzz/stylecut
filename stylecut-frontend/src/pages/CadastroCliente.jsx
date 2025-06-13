import { useState } from "react";
import axios from "axios";

export default function CadastroCliente() {
  const [form, setForm] = useState({ nome: "", telefone: "", historico: "" });
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      await axios.post("http://localhost:3001/clientes", form);
      setMsg("✅ Cliente cadastrado com sucesso!");
      setForm({ nome: "", telefone: "", historico: "" });
    } catch {
      setMsg("❌ Erro ao cadastrar cliente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow" aria-live="polite">
      <h2 className="text-xl font-bold mb-4" id="cadastro-cliente">Cadastrar Cliente</h2>
      <form onSubmit={handleSubmit} className="space-y-3" aria-labelledby="cadastro-cliente">
        <label className="block">
          <span className="sr-only">Nome</span>
          <input
            name="nome"
            placeholder="Nome"
            value={form.nome}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            autoComplete="off"
          />
        </label>
        <label className="block">
          <span className="sr-only">Telefone</span>
          <input
            name="telefone"
            placeholder="Telefone"
            value={form.telefone}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
            autoComplete="off"
            type="tel"
            pattern="[0-9]{10,11}"
            title="Digite apenas números, com DDD"
          />
        </label>
        <label className="block">
          <span className="sr-only">Histórico</span>
          <textarea
            name="historico"
            placeholder="Histórico (opcional)"
            value={form.historico}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            rows={3}
          />
        </label>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Salvando..." : "Salvar"}
        </button>
      </form>
      {msg && (
        <p
          className={`mt-2 text-sm ${msg.startsWith("✅") ? "text-green-600" : "text-red-600"}`}
          role="status"
        >
          {msg}
        </p>
      )}
    </div>
  );
}