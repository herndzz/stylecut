import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Service } from '@/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ServiceFormSchema, type ServiceForm } from '@/validation/schemas';
import { useDebounce } from '@/hooks/useDebounce';

export default function Services() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const { data, isLoading, error } = useQuery<Service[]>({ queryKey: ['services', dq], queryFn: () => api.get(`/services${dq?`?q=${encodeURIComponent(dq)}`:''}`) });

  const [editing, setEditing] = useState<Service | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ServiceForm>({
    resolver: zodResolver(ServiceFormSchema),
    defaultValues: { name: '', duration_minutes: 30, price_cents: 0, description: '' },
  });

  const createMut = useMutation({
    mutationFn: (payload: ServiceForm) => api.post('/services', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: (payload: ServiceForm) => api.put(`/services/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setEditing(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  const onSubmit = (values: ServiceForm) => {
    if (editing) updateMut.mutate(values); else createMut.mutate(values);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Serviços</h2>

      <div className="flex items-end gap-2">
        <div className="w-full md:w-64">
          <label htmlFor="q" className="block text-sm">Buscar</label>
          <input id="q" className="border p-2 rounded w-full" placeholder="nome, descrição" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label htmlFor="name" className="block text-sm">Nome</label>
          <input id="name" className="border p-2 rounded w-full" {...register('name')} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="duration" className="block text-sm">Duração (min)</label>
          <input id="duration" type="number" className="border p-2 rounded w-full" {...register('duration_minutes', { valueAsNumber: true })} />
          {errors.duration_minutes && <p className="text-red-600 text-xs mt-1">{errors.duration_minutes.message}</p>}
        </div>
        <div>
          <label htmlFor="price" className="block text-sm">Preço (centavos)</label>
          <input id="price" type="number" className="border p-2 rounded w-full" {...register('price_cents', { valueAsNumber: true })} />
          {errors.price_cents && <p className="text-red-600 text-xs mt-1">{errors.price_cents.message}</p>}
        </div>
        <div>
          <label htmlFor="desc" className="block text-sm">Descrição</label>
          <input id="desc" className="border p-2 rounded w-full" {...register('description')} />
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isSubmitting || createMut.isPending || updateMut.isPending}>
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
          {editing && (
            <button type="button" className="px-3 py-2 border rounded" onClick={()=>{setEditing(null); reset();}}>Cancelar</button>
          )}
        </div>
      </form>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nome</th>
            <th className="p-2 text-left">Duração</th>
            <th className="p-2 text-left">Preço</th>
            <th className="p-2 text-left">Descrição</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((s)=> (
            <tr key={s.id} className="border-t">
              <td className="p-2">{s.name}</td>
              <td className="p-2">{s.duration_minutes} min</td>
              <td className="p-2">R$ {(s.price_cents/100).toFixed(2)}</td>
              <td className="p-2">{s.description}</td>
              <td className="p-2 text-right space-x-2">
                <button className="px-3 py-1 border rounded" onClick={()=>{setEditing(s); reset({ name:s.name, duration_minutes:s.duration_minutes, price_cents:s.price_cents, description:s.description||'' });}}>Editar</button>
                <button className="px-3 py-1 border rounded text-red-600" onClick={()=>{ if(confirm('Excluir serviço?')) deleteMut.mutate(s.id); }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
