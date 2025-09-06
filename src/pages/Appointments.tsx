import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { appointmentSchema } from "../schemas";
import { useAppointments } from "../hooks/useAppointments";
import { useClients } from "../hooks/useClients";
import { useProfessionals } from "../hooks/useProfessionals";
import { useServices } from "../hooks/useServices";
import { z } from "zod";

type AppointmentFormData = z.infer<typeof appointmentSchema>;

const Appointments: React.FC = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [editingAppointment, setEditingAppointment] = useState<AppointmentFormData | null>(null); // Mover para antes dos hooks de contexto

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
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const selectedService = watch("serviceId");
  const availableProfessionals = selectedService 
    ? professionals.filter((prof) => prof.services?.includes(selectedService))
    : professionals;

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      setErrorMessage("");
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, data);
        setEditingAppointment(null);
      } else {
        await addAppointment(data);
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
    const statusClasses: Record<string, string> = {
      scheduled: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return (
      <span className={`${statusClasses[status] || "bg-gray-100 text-gray-800"} text-xs px-2 py-1 rounded`}>
        {status}
      </span>
    );
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    reset(appointment);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAppointment(id);
    } catch (error: any) {
      setErrorMessage(error?.message || "Erro ao excluir agendamento.");
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="title">Gestão de Agendamentos</h1>

      {/* Formulário de agendamento */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Novo Agendamento</h2>
        
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Cliente *</label>
              <select className="input" {...register("clientId")}>
                <option value="">Selecione um cliente</option>
                {clients && clients.map((client: any) => (
                  <option key={client.id} value={client.id}>
                    {client.name} - {client.phone}
                  </option>
                ))}
              </select>
              {errors.clientId && (
                <span className="text-red-500 text-sm">{errors.clientId?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Serviço *</label>
              <select className="input" {...register("serviceId")}>
                <option value="">Selecione um serviço</option>
                {services && services.map((service: any) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - R$ {service.price?.toFixed(2)}
                  </option>
                ))}
              </select>
              {errors.serviceId && (
                <span className="text-red-500 text-sm">{errors.serviceId?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Profissional *</label>
              <select className="input" {...register("professionalId")}>
                <option value="">Selecione um profissional</option>
                {availableProfessionals && availableProfessionals.map((professional: any) => (
                  <option key={professional.id} value={professional.id}>
                    {professional.name}
                  </option>
                ))}
              </select>
              {errors.professionalId && (
                <span className="text-red-500 text-sm">{errors.professionalId?.message}</span>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Data *</label>
              <input
                type="date"
                className="input"
                min={new Date().toISOString().split("T")[0]}
                {...register("date")}
              />
              {errors.date && (
                <span className="text-red-500 text-sm">{errors.date?.message}</span>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Horário *</label>
              <select className="input" {...register("time")}>
                <option value="">Selecione um horário</option>
                {generateTimeSlots().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              {errors.time && (
                <span className="text-red-500 text-sm">{errors.time?.message}</span>
              )}
            </div>
          </div>

          <button type="submit" className="btn" disabled={isAdding}>
            {isAdding ? "Agendando..." : "Criar Agendamento"}
          </button>
        </form>
      </div>

      {/* Lista de agendamentos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4">Agendamentos</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
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
                {appointments?.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.date} às {appointment.time}
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button onClick={() => handleEdit(appointment)} className="btn btn-sm">Editar</button>
                      <button onClick={() => handleDelete(appointment.id)} className="btn btn-sm btn-danger ml-2">Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;