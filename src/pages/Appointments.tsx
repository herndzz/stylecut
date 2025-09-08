import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Appointment, Client, Professional, Service } from '@/types';
import { useEffect, useMemo, useState } from 'react';

function toISOFromLocal(dt: string) {
  // dt from input[type="datetime-local"] (local time) -> ISO string UTC
  const d = new Date(dt);
  return d.toISOString();
}

function toLocalInputValue(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth()+1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

export default function Appointments() {
  const qc = useQueryClient();
  const { data: clients } = useQuery<Client[]>({ queryKey: ['clients'], queryFn: () => api.get('/clients') });
  const { data: professionals } = useQuery<Professional[]>({ queryKey: ['professionals'], queryFn: () => api.get('/professionals') });
  const { data: services } = useQuery<Service[]>({ queryKey: ['services'], queryFn: () => api.get('/services') });

  const [dateFilter, setDateFilter] = useState<string>('');

  const apptQueryKey = useMemo(()=> ['appointments', dateFilter || 'all'], [dateFilter]);
  const { data: appointments, isLoading, error, refetch } = useQuery<Appointment[]>({
    queryKey: apptQueryKey,
    queryFn: () => api.get(`/appointments${dateFilter?`?date=${dateFilter}`:''}`),
  });

  useEffect(()=>{ refetch(); }, [dateFilter, refetch]);

  const [form, setForm] = useState<Partial<Appointment>>({ status: 'scheduled' });
  const [editing, setEditing] = useState<Appointment | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const createMut = useMutation({
    mutationFn: (payload: any) => api.post('/appointments', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: apptQueryKey }); setForm({ status: 'scheduled' }); setErrMsg(null); },
    onError: (e: any) => setErrMsg(e.message),
  });
  const updateMut = useMutation({
    mutationFn: (payload: any) => api.put(`/appointments/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: apptQueryKey }); setEditing(null); setForm({ status: 'scheduled' }); setErrMsg(null); },
    onError: (e: any) => setErrMsg(e.message),
  });
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: apptQueryKey }),
  });

  const cancelMut = useMutation({
    mutationFn: (id: string) => api.put(`/appointments/${id}`, { status: 'cancelled' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: apptQueryKey }),
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg(null);
    if (!form.client_id || !form.professional_id || !form.service_id || !form.start_time) return alert('Preencha todos os campos');
    const payload = {
      client_id: form.client_id,
      professional_id: form.professional_id,
      service_id: form.service_id,
      start_time: typeof form.start_time === 'string' && form.start_time.includes('T') ? toISOFromLocal(form.start_time) : form.start_time,
      status: form.status || 'scheduled',
    };
    if (editing) updateMut.mutate(payload);
    else createMut.mutate(payload);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Agendamentos</h2>

      <div className="flex items-end gap-2">
        <div>
          <label className="block text-sm">Filtro por data (YYYY-MM-DD)</label>
          <input type="date" className="border p-2 rounded" value={dateFilter} onChange={(e)=>setDateFilter(e.target.value)} />
        </div>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label className="block text-sm">Cliente</label>
          <select className="border p-2 rounded w-full" value={form.client_id||''} onChange={(e)=>setForm({...form, client_id:e.target.value})}>
            <option value="">Selecione...</option>
            {clients?.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Profissional</label>
          <select className="border p-2 rounded w-full" value={form.professional_id||''} onChange={(e)=>setForm({...form, professional_id:e.target.value})}>
            <option value="">Selecione...</option>
            {professionals?.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Serviço</label>
          <select className="border p-2 rounded w-full" value={form.service_id||''} onChange={(e)=>setForm({...form, service_id:e.target.value})}>
            <option value="">Selecione...</option>
            {services?.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm">Início</label>
          <input type="datetime-local" className="border p-2 rounded w-full" value={toLocalInputValue(form.start_time as string)} onChange={(e)=>setForm({...form, start_time:e.target.value})} />
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={createMut.isPending || updateMut.isPending}>
            {editing ? 'Salvar' : 'Agendar'}
          </button>
          {editing && (
            <button type="button" className="px-3 py-2 border rounded" onClick={()=>{setEditing(null); setForm({ status: 'scheduled' }); setErrMsg(null);}}>Cancelar</button>
          )}
        </div>
      </form>

      {errMsg && <div className="text-red-700 bg-red-50 border border-red-200 p-2 rounded">{errMsg}</div>}

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Cliente</th>
            <th className="p-2 text-left">Profissional</th>
            <th className="p-2 text-left">Serviço</th>
            <th className="p-2 text-left">Início</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2"></th>
          </tr>
        </thead>
        <tbody>
          {appointments?.map((a)=> (
            <tr key={a.id} className="border-t">
              <td className="p-2">{a.client_name || a.client_id}</td>
              <td className="p-2">{a.professional_name || a.professional_id}</td>
              <td className="p-2">{a.service_name || a.service_id}</td>
              <td className="p-2">{new Date(a.start_time).toLocaleString()}</td>
              <td className="p-2">{a.status}</td>
              <td className="p-2 text-right space-x-2">
                <button className="px-3 py-1 border rounded" onClick={()=>{setEditing(a); setForm({ client_id:a.client_id, professional_id:a.professional_id, service_id:a.service_id, start_time:a.start_time, status:a.status });}}>Editar</button>
                {a.status !== 'cancelled' && (
                  <button className="px-3 py-1 border rounded text-yellow-700" onClick={()=>{ if(confirm('Cancelar agendamento?')) cancelMut.mutate(a.id); }}>Cancelar</button>
                )}
                <button className="px-3 py-1 border rounded text-red-600" onClick={()=>{ if(confirm('Excluir agendamento?')) deleteMut.mutate(a.id); }}>Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
