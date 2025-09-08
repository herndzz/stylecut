import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Professional } from '@/types';
import { useState } from 'react';

export default function Professionals() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery<Professional[]>({ queryKey: ['professionals'], queryFn: () => api.get('/professionals') });

  const [form, setForm] = useState<Partial<Professional>>({ name: '', email: '', phone: '' });
  const [editing, setEditing] = useState<Professional | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: Partial<Professional>) => api.post('/professionals', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['professionals'] }); setForm({ name: '', email: '', phone: '' }); },
  });
  const updateMut = useMutation({
    mutationFn: (payload: Partial<Professional>) => api.put(`/professionals/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['professionals'] }); setEditing(null); setForm({ name: '', email: '', phone: '' }); },
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/professionals/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['professionals'] }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name) return alert('Nome é obrigatório');
    if (editing) updateMut.mutate(form);
    else createMut.mutate(form);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Profissionais</h2>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="block text-sm">Nome</label>
          <input className="border p-2 rounded w-full" value={form.name||''} onChange={(e)=>setForm({...form, name:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input className="border p-2 rounded w-full" value={form.email||''} onChange={(e)=>setForm({...form, email:e.target.value})} />
        </div>
        <div>
          <label className="block text-sm">Telefone</label>
          <input className="border p-2 rounded w-full" value={form.phone||''} onChange={(e)=>setForm({...form, phone:e.target.value})} />
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={createMut.isPending || updateMut.isPending}>
            {editing ? 'Salvar' : 'Adicionar'}
          </button>
          {editing && (
            <button type="button" className="px-3 py-2 border rounded" onClick={()=>{setEditing(null); setForm({ name:'', email:'', phone:'' });}}>Cancelar</button>
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
                <button className="px-3 py-1 border rounded" onClick={()=>{setEditing(c); setForm({ name:c.name, email:c.email, phone:c.phone });}}>Editar</button>
                <button className="px-3 py-1 border rounded text-red-600" onClick={()=>{ if(confirm('Excluir profissional?')) deleteMut.mutate(c.id); }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
