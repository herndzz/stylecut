import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';
import { Service } from '@utils/types';

export type ServicePayload = {
  name: string;
  price: number;
  duration: number; // minutes
};

export function useServices() {
  return useQuery<Service[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const res = await api.get('/services');
      return res.data;
    },
  });
}

export function useAddService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ServicePayload) => {
      const res = await api.post('/services', payload);
      return res.data as Service;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: Service['id']; payload: ServicePayload }) => {
      const res = await api.put(`/services/${id}`, payload);
      return res.data as Service;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: Service['id']) => {
      await api.delete(`/services/${id}`);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['services'] }),
  });
}
