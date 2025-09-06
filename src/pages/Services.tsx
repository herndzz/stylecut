import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { serviceSchema } from "../schemas";
import { useServices } from "../hooks/useServices";
import { z } from "zod";

// Definição de tipos
type ServiceFormData = z.infer<typeof serviceSchema>;

interface Service extends ServiceFormData {
  id: string;
}

const Services: React.FC = () => {
  const { services, isLoading, addService, isAdding } = useServices();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
  });

  const onSubmit = (data: ServiceFormData) => {
    addService(data);
    reset();
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h${mins > 0 ? ` ${mins}min` : ""}`;
    }
    return `${mins}min`;
  };

  return (
    <div className="space-y-8">
      <h1 className="title">Gestão de Serviços</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Cadastrar Novo Serviço</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Nome do Serviço *</label>
            <input
              {...register("name")}
              className="input"
              placeholder="Ex: Corte masculino, Manicure, etc."
            />
            {errors.name && (
              <span className="text-red-500 text-sm">{errors.name?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
            <input
              {...register("price", { valueAsNumber: true })}
              type="number"
              step="0.01"
              min="0"
              className="input"
              placeholder="0.00"
            />
            {errors.price && (
              <span className="text-red-500 text-sm">{errors.price?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Duração (minutos) *</label>
            <input
              {...register("duration", { valueAsNumber: true })}
              type="number"
              min="15"
              step="15"
              className="input"
              placeholder="Ex: 30, 45, 60..."
            />
            {errors.duration && (
              <span className="text-red-500 text-sm">{errors.duration?.message}</span>
            )}
          </div>

          <button type="submit" className="btn" disabled={isAdding}>
            {isAdding ? "Cadastrando..." : "Cadastrar Serviço"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Serviços Cadastrados</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : services && services.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Preço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duração
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {services.map((service: Service) => (
                  <tr key={service.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {service.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      R$ {service.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(service.duration)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Nenhum serviço cadastrado. Cadastre um novo serviço acima.
          </div>
        )}
      </div>
    </div>
  );
};

export default Services;