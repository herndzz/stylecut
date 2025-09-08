import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Professional } from '@/types';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ProfessionalFormSchema, type ProfessionalForm } from '@/validation/schemas';
import { useDebounce } from '@/hooks/useDebounce';

export default function Professionals() {
  const qc = useQueryClient();
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const { data, isLoading, error } = useQuery<Professional[]>({ queryKey: ['professionals', dq], queryFn: () => api.get(`/professionals${dq?`?q=${encodeURIComponent(dq)}`:''}`) });

  const [editing, setEditing] = useState<Professional | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProfessionalForm>({
    resolver: zodResolver(ProfessionalFormSchema),
    defaultValues: { name: '', email: '', phone: '' },
  });

  const createMut = useMutation({
    mutationFn: (payload: ProfessionalForm) => api.post('/professionals', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['professionals'] }); reset(); },
  });
  const updateMut = useMutation({
    mutationFn: (payload: ProfessionalForm) => api.put(`/professionals/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['professionals'] }); setEditing(null); reset(); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/professionals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
  });

  const onSubmit = (values: ProfessionalForm) => {
    if (editing) updateMut.mutate(values); else createMut.mutate(values);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profissionais</h2>

      <div className="flex items-end gap-2">
        <div className="w-full md:w-64">
          <label htmlFor="q" className="block text-sm">Buscar</label>
          <input id="q" className="border p-2 rounded w-full" placeholder="nome, email, telefone" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

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
          <input id="phone" className="border p-2 rounded w-full" pattern="[0-9()+\-\s]{8,20}" title="Apenas dígitos, espaços, + - ( ) — 8 a 20 caracteres" {...register('phone')} />
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
                <button className="px-3 py-1 border rounded text-red-600" onClick={()=>{ if(confirm('Excluir profissional?')) deleteMut.mutate(c.id); }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
