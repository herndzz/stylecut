import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Appointment } from '../types';
import { offlineService } from '../services/offlineService';
import axios, { AxiosError } from 'axios';

// Tipo para o retorno da função
interface UseAppointmentsReturn {
  appointments: Appointment[];
  isLoading: boolean;
  addAppointment: (data: AppointmentInput) => Promise<Appointment>;
  isAdding: boolean;
  error: Error | null;
  isError: boolean;
}

// Tipo para os dados de entrada de um novo agendamento
type AppointmentInput = Omit<Appointment, 'id' | 'status' | 'createdAt' | 'updatedAt'>;

export const useAppointments = (): UseAppointmentsReturn => {
  const queryClient = useQueryClient();

  const appointmentsQuery = useQuery<Appointment[], Error>('appointments', async () => {
    try {
      const response = await axios.get('/api/appointments');
      return response.data;
    } catch (error) {
      console.log('Falha na comunicação com o servidor, usando dados offline');
      // Usa serviço offline apenas em caso de erro de rede
      return offlineService.getAppointments();
    }
  });

  const addAppointmentMutation = useMutation<
    Appointment,
    Error,
    AppointmentInput
  >(
    async (appointmentData) => {
      try {
        const response = await axios.post('/api/appointments', appointmentData);
        return response.data;
      } catch (error) {
        if ((error as AxiosError).isAxiosError) {
          // Se for um erro do Axios, tentamos salvar offline e notificamos
          const result = await offlineService.addAppointment(appointmentData);
          console.log('Agendamento salvo offline');
          return result;
        }
        throw error; // Se for outro tipo de erro, propagamos
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('appointments');
      },
      onError: (error) => {
        const errorMessage = error instanceof AxiosError 
          ? error.response?.data?.message || 'Erro ao criar agendamento'
          : 'Erro ao criar agendamento';
        console.error(errorMessage);
      },
    }
  );

  return {
    appointments: appointmentsQuery.data || [],
    isLoading: appointmentsQuery.isLoading,
    addAppointment: addAppointmentMutation.mutateAsync,
    isAdding: addAppointmentMutation.isLoading,
    error: appointmentsQuery.error || addAppointmentMutation.error,
    isError: appointmentsQuery.isError || addAppointmentMutation.isError,
  };
};