import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "../schemas";
import { useAppointments } from "../hooks/useAppointments";
import { useClients } from "../hooks/useClients";
import { useProfessionals } from "../hooks/useProfessionals";
import { useServices } from "../hooks/useServices";
import { z } from "zod";

// Schema para edição que inclui status
const editAppointmentSchema = appointmentSchema.extend({
  status: z.enum(['scheduled', 'completed', 'cancelled']).optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;
type EditAppointmentFormData = z.infer<typeof editAppointmentSchema>;

interface AppointmentWithId extends AppointmentFormData {
  id: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt?: string;
  updatedAt?: string;
}

interface Service {
  id: string;
  name: string;
  price: number | string;
  duration: number;
}

const Appointments: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<AppointmentWithId | null>(null);

  const { appointments, isLoading, addAppointment, updateAppointment, deleteAppointment, isAdding } = useAppointments();
  const { clients = [] } = useClients();
  const { professionals = [] } = useProfessionals();
  const { services = [] } = useServices();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<EditAppointmentFormData>({
    resolver: zodResolver(editingAppointment ? editAppointmentSchema : appointmentSchema),
  });

  const selectedService = watch("serviceId");
  const availableProfessionals = selectedService 
    ? professionals.filter((prof) => prof.services?.includes(selectedService))
    : professionals;

  // Função helper para formatar preço
  const formatPrice = (price: number | string): string => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : price;
    return isNaN(numPrice) ? '0.00' : numPrice.toFixed(2);
  };

  // Função para formatar data para exibição
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString + 'T00:00:00');
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const onSubmit = async (data: EditAppointmentFormData) => {
    try {
      setErrorMessage("");
      if (editingAppointment) {
        // Para edição, incluir o status se fornecido
        const updateData = { ...data };
        if (data.status) {
          updateData.status = data.status;
        }
        await updateAppointment(editingAppointment.id, updateData);
        setEditingAppointment(null);
      } else {
        // Para criação, remover status se existir
        const { status, ...createData } = data;
        await addAppointment(createData);
      }
      reset();
    } catch (error: any) {
      setErrorMessage(error?.message || "Erro ao salvar agendamento.");
    }
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    // Adicionar o último horário (18:00) separadamente
    slots.push("18:00");
    return slots;
  };

  const getClientName = (clientId: string) => {
    const client = clients.find((c) => c.id === clientId);
    return client ? client.name : "Cliente não encontrado";
  };

  const getProfessionalName = (professionalId: string) => {
    const professional = professionals.find((p) => p.id === professionalId);
    return professional ? professional.name : "Profissional não encontrado";
  };

  const getServiceName = (serviceId: string) => {
    const service = services.find((s) => s.id === serviceId);
    return service ? service.name : "Serviço não encontrado";
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { class: string; label: string }> = {
      scheduled: { class: "bg-blue-100 text-blue-800", label: "Agendado" },
      completed: { class: "bg-green-100 text-green-800", label: "Concluído" },
      cancelled: { class: "bg-red-100 text-red-800", label: "Cancelado" },
    };
    
    const config = statusConfig[status] || { class: "bg-gray-100 text-gray-800", label: status };
    
    return (
      <span className={`${config.class} text-xs px-2 py-1 rounded font-medium`}>
        {config.label}
      </span>
    );
  };

  const handleEdit = (appointment: AppointmentWithId) => {
    setEditingAppointment(appointment);
    reset({
      clientId: appointment.clientId,
      professionalId: appointment.professionalId,
      serviceId: appointment.serviceId,
      date: appointment.date,
      time: appointment.time,
      status: appointment.status
    });
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este agendamento?')) {
      try {
        await deleteAppointment(id);
      } catch (error: any) {
        setErrorMessage(error?.message || "Erro ao excluir agendamento.");
      }
    }
  };

  const handleCancel = () => {
    setEditingAppointment(null);
    reset();
    setErrorMessage("");
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Gestão de Agendamentos</h1>

      {/* Formulário de agendamento */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold mb-4">
          {editingAppointment ? 'Editar Agendamento' : 'Novo Agendamento'}
        </h2>
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                {...register("clientId")}
              >
                <option value="">Selecione um cliente</option>
                {clients && clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <span className="text-red-500 text-sm mt-1 block">{errors.clientId?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Serviço *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                {...register("serviceId")}
              >
                <option value="">Selecione um serviço</option>
                {services && services.map((service: Service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {formatPrice(service.price)}
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <span className="text-red-500 text-sm mt-1 block">{errors.serviceId?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Profissional *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                {...register("professionalId")}
              >
                <option value="">Selecione um profissional</option>
                {availableProfessionals && availableProfessionals.map((professional: any) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
              {errors.professionalId && (
                <span className="text-red-500 text-sm mt-1 block">{errors.professionalId?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data *</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().split("T")[0]}
                {...register("date")}
              />
              {errors.date && (
                <span className="text-red-500 text-sm mt-1 block">{errors.date?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Horário *</label>
              <select 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                {...register("time")}
              >
                <option value="">Selecione um horário</option>
                {generateTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && (
                <span className="text-red-500 text-sm mt-1 block">{errors.time?.message}</span>
              )}
            </div>

            {/* Campo de status apenas na edição */}
            {editingAppointment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  {...register("status")}
                >
                  <option value="scheduled">Agendado</option>
                  <option value="completed">Concluído</option>
                  <option value="cancelled">Cancelado</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              type="submit" 
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50" 
              disabled={isAdding}
            >
              {isAdding ? "Salvando..." : editingAppointment ? "Atualizar Agendamento" : "Criar Agendamento"}
            </button>
            
            {editingAppointment && (
              <button 
                type="button" 
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Lista de agendamentos */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Agendamentos</h2>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : appointments && appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data e Hora
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Profissional
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Serviço
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{formatDate(appointment.date)}</div>
                        <div className="text-gray-500">{appointment.time}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getClientName(appointment.clientId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getProfessionalName(appointment.professionalId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getServiceName(appointment.serviceId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(appointment)} 
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Editar
                        </button>
                        <button 
                          onClick={() => handleDelete(appointment.id)} 
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Nenhum agendamento encontrado
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;