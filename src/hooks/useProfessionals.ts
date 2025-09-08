import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';
import { Professional } from '@utils/types';

export type ProfessionalPayload = {
  name: string;
  phone: string;
};

export function useProfessionals() {
  return useQuery<Professional[]>({
    queryKey: ['professionals'],
    queryFn: async () => {
      const res = await api.get('/professionals');
      return res.data;
    },
  });
}

export function useAddProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProfessionalPayload) => {
      const res = await api.post('/professionals', payload);
      return res.data as Professional;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professionals'] }),
  });
}

export function useUpdateProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: Professional['id']; payload: ProfessionalPayload }) => {
      const res = await api.put(`/professionals/${id}`, payload);
      return res.data as Professional;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professionals'] }),
  });
}

export function useDeleteProfessional() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: Professional['id']) => {
      await api.delete(`/professionals/${id}`);
      return id;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['professionals'] }),
  });
}
