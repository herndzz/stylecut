import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Client } from '@/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ClientFormSchema, type ClientForm } from '@/validation/schemas';

export default function Clients() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<Client[]>({ queryKey: ['clients'], queryFn: () => api.get('/clients') });

  const [editing, setEditing] = useState<Client | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ClientForm>({
    resolver: zodResolver(ClientFormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const createMut = useMutation({
    mutationFn: (payload: ClientForm) => api.post('/clients', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: (payload: ClientForm) => api.put(`/clients/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['clients'] }); setEditing(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/clients/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['clients'] }),
  });

  const onSubmit = (values: ClientForm) => {
    if (editing) updateMut.mutate(values); else createMut.mutate(values);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Clientes</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label htmlFor="name" className="block text-sm">Nome</label>
          <input id="name" className="border p-2 rounded w-full" {...register('name')} />
          {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="email" className="block text-sm">Email</label>
          <input id="email" className="border p-2 rounded w-full" {...register('email')} />
          {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm">Telefone</label>
          <input id="phone" className="border p-2 rounded w-full" {...register('phone')} />
          {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone.message}</p>}
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
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Telefone</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {data?.map((c)=> (
            <tr key={c.id} className="border-t">
              <td className="p-2">{c.name}</td>
              <td className="p-2">{c.email}</td>
              <td className="p-2">{c.phone}</td>
              <td className="p-2 text-right space-x-2">
                <button className="px-3 py-1 border rounded" onClick={()=>{setEditing(c); reset({ name:c.name, email:c.email||'', phone:c.phone||'' });}}>Editar</button>
                <button className="px-3 py-1 border rounded text-red-600" onClick={()=>{ if(confirm('Excluir cliente?')) deleteMut.mutate(c.id); }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
