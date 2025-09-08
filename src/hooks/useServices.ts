import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import type { Service } from '@/types';

export function useServices(q?: string) {
  const qc = useQueryClient();
  const queryKey = ['services', q || ''];

  const list = useQuery<Service[]>({
    queryKey,
    queryFn: () => api.get(`/services${q ? `?q=${encodeURIComponent(q)}` : ''}`),
    staleTime: 60 * 1000,
  });

  const create = useMutation({
    mutationFn: (payload: Partial<Service>) => api.post('/services', payload),
    onMutate: async (newItem) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<Service[]>(queryKey) || [];
      const optimistic: Service = {
        id: `optimistic-${Date.now()}`,
        name: newItem.name || '',
        duration_minutes: newItem.duration_minutes || 0,
        price_cents: newItem.price_cents || 0,
        description: newItem.description || '',
      } as Service;
      qc.setQueryData<Service[]>(queryKey, [optimistic, ...prev]);
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const update = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Service> }) => api.put(`/services/${id}`, data),
    onMutate: async ({ id, data }) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<Service[]>(queryKey) || [];
      qc.setQueryData<Service[]>(queryKey, prev.map(s => s.id === id ? { ...s, ...data } as Service : s));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey });
      const prev = qc.getQueryData<Service[]>(queryKey) || [];
      qc.setQueryData<Service[]>(queryKey, prev.filter(s => s.id !== id));
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(queryKey, ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey }),
  });

  return { list, create, update, remove };
}
