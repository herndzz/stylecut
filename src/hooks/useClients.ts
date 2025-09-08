import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';
import { Client } from '@utils/types';

export type ClientPayload = {
  name: string;
  phone: string;
};

export function useClients() {
  return useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const res = await api.get('/clients');
      return res.data;
    },
  });
}

export function useAddClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ClientPayload) => {
      const res = await api.post('/clients', payload);
      return res.data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: Client['id']; payload: ClientPayload }) => {
      const res = await api.put(
        `/clients/${id}`,
        payload,
      );
      return res.data as Client;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: Client['id']) => {
      await api.delete(`/clients/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}
