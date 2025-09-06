import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientSchema } from "../schemas";
import { useClients } from "../hooks/useClients";
import { z } from "zod";

type ClientFormData = z.infer<typeof clientSchema>;

// Definindo uma interface apropriada para Cliente
interface Client extends ClientFormData {
  id: string | number;
}

const Clients: React.FC = () => {
  const [searchPhone, setSearchPhone] = useState("");
  const [searchResult, setSearchResult] = useState<Client | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { clients, isLoading, addClient, updateClient, deleteClient, isAdding, searchByPhone } = useClients();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
  });

  const phoneValue = watch("phone");

  // Aplicar formatação ao telefone enquanto o usuário digita
  React.useEffect(() => {
    if (phoneValue) {
      const formatted = formatPhone(phoneValue);
      if (formatted !== phoneValue) {
        setValue("phone", formatted);
      }
    }
  }, [phoneValue, setValue]);

  const onSubmit = (data: ClientFormData) => {
    if (editingClient) {
      updateClient(editingClient.id.toString(), data);
      setEditingClient(null);
    } else {
      addClient(data);
    }
    reset();
  };

  const handleSearch = async () => {
    try {
      const result = await searchByPhone(searchPhone);
      if (result) {
        setSearchResult(result);
        setNotFound(false);
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
    } catch (error) {
      console.error('Erro ao buscar cliente:', error);
      setSearchResult(null);
      setNotFound(true);
    }
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
    reset(client);
  };

  const handleDelete = (id: string) => {
    deleteClient(id);
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  };

  return (
    <div className="space-y-8">
      <h1 className="title">Gestão de Clientes</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Buscar Cliente por Telefone</h2>
        <div className="flex gap-4">
          <input
            type="tel"
            value={searchPhone}
            onChange={(e) => setSearchPhone(formatPhone(e.target.value))}
            placeholder="(99) 99999-9999"
            className="input flex-1"
            maxLength={15}
            aria-label="Telefone para busca"
          />
          <button onClick={handleSearch} className="btn">
            Buscar
          </button>
        </div>
        
        {searchResult && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
            <h3 className="font-semibold text-green-800">Cliente encontrado:</h3>
            <p className="text-green-700">{searchResult.name}</p>
            <p className="text-green-700">{searchResult.phone}</p>
            {searchResult.email && <p className="text-green-700">{searchResult.email}</p>}
            <button 
              onClick={() => handleEdit(searchResult)} 
              className="btn mt-2"
            >
              Editar Cliente
            </button>
          </div>
        )}

        {notFound && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-700">Nenhum cliente encontrado com este telefone.</p>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">
          {editingClient ? "Editar Cliente" : "Cadastrar Novo Cliente"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome *</label>
            <input
              {...register("name")}
              className="input"
              placeholder="Digite o nome completo"
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefone *</label>
            <input
              {...register("phone")}
              className="input"
              placeholder="(99) 99999-9999"
              maxLength={15}
            />
            {errors.phone && (
              <span className="text-red-500 text-sm">{errors.phone?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              {...register("email")}
              type="email"
              className="input"
              placeholder="email@exemplo.com"
            />
            {errors.email && (
              <span className="text-red-500 text-sm">{errors.email?.message}</span>
            )}
          </div>

          <div className="flex gap-2">
            <button type="submit" className="btn" disabled={isAdding}>
              {isAdding ? "Salvando..." : editingClient ? "Atualizar Cliente" : "Cadastrar Cliente"}
            </button>
            {editingClient && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingClient(null);
                  reset();
                }} 
                className="btn bg-gray-500 hover:bg-gray-600"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Clientes Cadastrados</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : clients && clients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nome
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Telefone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {clients.map((client: Client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {client.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {client.email || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => handleEdit(client)} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => handleDelete(client.id.toString())} 
                        className="text-red-600 hover:text-red-900"
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Nenhum cliente cadastrado. Cadastre um novo cliente acima.
          </div>
        )}
      </div>
    </div>
  );
};

export default Clients;