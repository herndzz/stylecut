import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import { Appointment } from '../types';
import { offlineService } from '../services/offlineService';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const useAppointments = () => {
  const queryClient = useQueryClient();

  const { data: appointments, isLoading, error } = useQuery<Appointment[]>(
    'appointments',
    async () => {
      try {
        const response = await axios.get(`${API_URL}/api/appointments`);
        return response.data;
      } catch (error) {
        console.log("Endpoint '/api/appointments' não encontrado. Usando fallback offline.");
        return offlineService.getAppointments();
      }
    }
  );

  const addAppointmentMutation = useMutation(
    async (appointmentData: Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => {
      try {
        const response = await axios.post(`${API_URL}/api/appointments`, appointmentData);
        return response.data;
      } catch (error) {
        console.log("Agendamento salvo offline");
        return await offlineService.addAppointment(appointmentData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  const updateAppointmentMutation = useMutation(
    async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      try {
        const response = await axios.put(`${API_URL}/api/appointments/${id}`, data);
        return response.data;
      } catch (error) {
        console.error(error);
        throw new Error('Falha ao atualizar agendamento');
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  const deleteAppointmentMutation = useMutation(
    async (id: string) => {
      try {
        await axios.delete(`${API_URL}/api/appointments/${id}`);
      } catch (error) {
        console.log(`Agendamento com ID ${id} não encontrado no servidor. Removendo localmente.`);
        // Remove localmente se não encontrar no servidor
        const appointments = offlineService.getAppointments();
        const updatedAppointments = appointments.filter(apt => apt.id !== id);
        localStorage.setItem('stylecut_appointments', JSON.stringify(updatedAppointments));
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
    }
  );

  return {
    appointments,
    isLoading,
    error,
    addAppointment: addAppointmentMutation.mutateAsync,
    updateAppointment: (id: string, data: Partial<Appointment>) => updateAppointmentMutation.mutateAsync({ id, data }),
    deleteAppointment: deleteAppointmentMutation.mutateAsync,
    isAdding: addAppointmentMutation.isLoading,
  };
};