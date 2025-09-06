import React, { useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { professionalSchema } from "../schemas";
import { useProfessionals } from "../hooks/useProfessionals";
import { useServices } from "../hooks/useServices";
import { z } from "zod";

type ProfessionalFormData = z.infer<typeof professionalSchema>;

// Interfaces para tipos adequados
interface Service {
  id: string;
  name: string;
  price: number;
}

interface Professional {
  id: string;
  name: string;
  phone: string;
  email?: string;
  services: string[];
}

const Professionals: React.FC = () => {
  const { professionals, isLoading, addProfessional, isAdding } = useProfessionals();
  const { services } = useServices();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
  });

  // Função para formatar o telefone enquanto o usuário digita
  const formatPhone = useCallback((value: string) => {
    // Remove tudo que não for dígito
    const cleaned = value.replace(/\D/g, '');
    
    // Aplica a máscara (99) 99999-9999
    let formatted = cleaned;
    if (cleaned.length > 0) {
      formatted = `(${cleaned.slice(0, 2)}`;
      if (cleaned.length > 2) {
        formatted += `) ${cleaned.slice(2, 7)}`;
        if (cleaned.length > 7) {
          formatted += `-${cleaned.slice(7, 11)}`;
        }
      }
    }
    
    return formatted;
  }, []);

  // Observa mudanças no campo de telefone e formata automaticamente
  const phone = watch("phone");
  React.useEffect(() => {
    if (phone) {
      const formatted = formatPhone(phone);
      if (formatted !== phone) {
        setValue("phone", formatted);
      }
    }
  }, [phone, formatPhone, setValue]);

  // Cria um mapa de serviços para busca eficiente
  const servicesMap = useMemo(() => {
    const map = new Map<string, Service>();
    if (services) {
      services.forEach((service: Service) => {
        map.set(service.id, service);
      });
    }
    return map;
  }, [services]);

  const onSubmit = (data: ProfessionalFormData) => {
    addProfessional(data);
    reset();
  };

  return (
    <div className="space-y-8">
      <h1 className="title">Gestão de Profissionais</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Cadastrar Novo Profissional</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" aria-label="Formulário de cadastro de profissional">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome *</label>
            <input
              id="name"
              {...register("name")}
              className="input"
              placeholder="Digite o nome completo"
              aria-invalid={errors.name ? "true" : "false"}
            />
            {errors.name && (
              <span className="text-red-500 text-sm" role="alert">{errors.name?.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">Telefone *</label>
            <input
              id="phone"
              {...register("phone")}
              className="input"
              placeholder="(99) 99999-9999"
              maxLength={15}
              aria-invalid={errors.phone ? "true" : "false"}
            />
            {errors.phone && (
              <span className="text-red-500 text-sm" role="alert">{errors.phone?.message}</span>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <input
              id="email"
              {...register("email")}
              type="email"
              className="input"
              placeholder="email@exemplo.com"
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && (
              <span className="text-red-500 text-sm" role="alert">{errors.email?.message}</span>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Serviços que oferece *</label>
            <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded p-3" aria-labelledby="services-group">
              <div id="services-group" className="sr-only">Lista de serviços disponíveis</div>
              {services && services.length > 0 ? (
                services.map((service: Service) => (
                  <label key={service.id} className="flex items-center">
                    <input
                      type="checkbox"
                      value={service.id}
                      {...register("services")}
                      className="mr-2"
                    />
                    <span className="text-sm">{service.name} - R$ {service.price?.toFixed(2)}</span>
                  </label>
                ))
              ) : (
                <p className="text-gray-500 text-sm">Nenhum serviço disponível</p>
              )}
            </div>
            {errors.services && (
              <span className="text-red-500 text-sm" role="alert">{errors.services?.message}</span>
            )}
          </div>

          <button 
            type="submit" 
            className="btn" 
            disabled={isAdding}
            aria-busy={isAdding}
          >
            {isAdding ? "Cadastrando..." : "Cadastrar Profissional"}
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Profissionais Cadastrados</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" aria-label="Carregando profissionais"></div>
          </div>
        ) : professionals && professionals.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {professionals.map((professional: Professional) => (
              <div key={professional.id} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-lg">{professional.name}</h3>
                <p className="text-gray-600">{professional.phone}</p>
                {professional.email && (
                  <p className="text-gray-600">{professional.email}</p>
                )}
                <div className="mt-3">
                  <h4 className="font-medium text-sm">Serviços:</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {professional.services?.map((serviceId: string) => {
                      const service = servicesMap.get(serviceId);
                      return service ? (
                        <span
                          key={serviceId}
                          className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                        >
                          {service.name}
                        </span>
                      ) : null;
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">Nenhum profissional cadastrado</p>
        )}
      </div>
    </div>
  );
};

export default Professionals;