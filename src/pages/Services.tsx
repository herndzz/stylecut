import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Service } from '@/types';
import { useState } from 'react';

export default function Services() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<Service[]>({ queryKey: ['services'], queryFn: () => api.get('/services') });

  const [form, setForm] = useState<Partial<Service>>({ name: '', duration_minutes: 30, price_cents: 0, description: '' });
  const [editing, setEditing] = useState<Service | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: Partial<Service>) => api.post('/services', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setForm({ name: '', duration_minutes: 30, price_cents: 0, description: '' }); },
  });
  const updateMut = useMutation({
    mutationFn: (payload: Partial<Service>) => api.put(`/services/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['services'] }); setEditing(null); setForm({ name: '', duration_minutes: 30, price_cents: 0, description: '' }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/services/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['services'] }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return alert('Nome é obrigatório');
    if (form.duration_minutes == null) return alert('Duração é obrigatória');
    if (form.price_cents == null) return alert('Preço é obrigatório');
    if (editing) updateMut.mutate(form);
    else createMut.mutate(form);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Serviços</h2>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-sm">Nome</label>
          <input className="border p-2 rounded w-full" value={form.name||''} onChange={(e)=>setForm({...form, name:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm">Duração (min)</label>
          <input type="number" className="border p-2 rounded w-full" value={form.duration_minutes??0} onChange={(e)=>setForm({...form, duration_minutes:Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-sm">Preço (centavos)</label>
          <input type="number" className="border p-2 rounded w-full" value={form.price_cents??0} onChange={(e)=>setForm({...form, price_cents:Number(e.target.value)})} />
        </div>
        <div>
          <label className="block text-sm">Descrição</label>
          <input className="border p-2 rounded w-full" value={form.description||''} onChange={(e)=>setForm({...form, description:e.target.value})} />
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={createMut.isPending || updateMut.isPending}>
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
          {editing && (
            <button type="button" className="px-3 py-2 border rounded" onClick={()=>{setEditing(null); setForm({ name:'', duration_minutes:30, price_cents:0, description:'' });}}>Cancelar</button>
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
                <button className="px-3 py-1 border rounded" onClick={()=>{setEditing(s); setForm({ name:s.name, duration_minutes:s.duration_minutes, price_cents:s.price_cents, description:s.description });}}>Editar</button>
                <button className="px-3 py-1 border rounded text-red-600" onClick={()=>{ if(confirm('Excluir serviço?')) deleteMut.mutate(s.id); }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
