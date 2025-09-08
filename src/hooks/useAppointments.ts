import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';
import { Appointment, AppointmentStatus } from '@utils/types';

export type AppointmentPayload = {
  clientId: string | number;
  professionalId: string | number;
  serviceId: string | number;
  startAt: string; // ISO
};

export function useAppointments() {
  return useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const res = await api.get('/appointments');
      return res.data;
    },
  });
}

export function useAddAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AppointmentPayload) => {
      const res = await api.post('/appointments', payload);
      return res.data as Appointment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: Appointment['id']; status: AppointmentStatus }) => {
      const res = await api.patch(`/appointments/${id}`, { status });
      return res.data as Appointment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: Appointment['id']) => {
      await api.delete(`/appointments/${id}`);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['appointments'] }),
  });
}
