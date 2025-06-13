import { useEffect, useState } from "react";
import axios from "axios";

export default function Agendamentos() {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    axios
      .get("http://localhost:3001/agendamentos")
      .then((res) => setDados(res.data))
      .catch((err) => setErro("Erro ao carregar agendamentos."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-500">Carregando agendamentos...</p>;
  }

  if (erro) {
    return <p className="text-red-500">{erro}</p>;
  }

  if (dados.length === 0) {
    return <p className="text-gray-500">Nenhum agendamento encontrado.</p>;
  }

  return (
    <div className="space-y-3" aria-live="polite">
      {dados.map((a) => (
        <div key={a.id} className="bg-white p-4 rounded shadow" tabIndex={0} aria-label={`Agendamento de ${a.cliente?.nome || "Cliente desconhecido"}`}>
          <p>
            <strong>Cliente:</strong> {a.cliente?.nome || "Não informado"}
          </p>
          <p>
            <strong>Horário:</strong>{" "}
            {a.horario ? new Date(a.horario).toLocaleString() : "Não informado"}
          </p>
          <p>
            <strong>Serviço:</strong> {a.servico || "Não informado"}
          </p>
        </div>
      ))}
    </div>
  );
}
