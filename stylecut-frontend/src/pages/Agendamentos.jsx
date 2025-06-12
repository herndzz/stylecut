import { useEffect, useState } from "react";
import axios from "axios";

export default function Agendamentos() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:3001/agendamentos")
      .then(res => setDados(res.data));
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Agendamentos</h2>
      <ul className="space-y-3">
        {dados.map((a) => (
          <li key={a.id} className="bg-white p-4 rounded shadow">
            <p>Cliente: {a.cliente.nome}</p>
            <p>Horário: {new Date(a.horario).toLocaleString()}</p>
            <p>Serviço: {a.servico}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}