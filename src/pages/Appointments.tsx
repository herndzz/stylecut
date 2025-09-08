import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { Appointment, Client, Professional, Service } from '@/types';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AppointmentFormSchema, type AppointmentForm } from '@/validation/schemas';

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

  const [editing, setEditing] = useState<Appointment | null>(null);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AppointmentForm>({
    resolver: zodResolver(AppointmentFormSchema),
    defaultValues: { client_id: '', professional_id: '', service_id: '', start_time: '', status: 'scheduled' },
  });

  const createMut = useMutation({
    mutationFn: (payload: any) => api.post('/appointments', payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: apptQueryKey }); reset(); setErrMsg(null); },
    onError: (e: any) => setErrMsg(e.message),
  });
  const updateMut = useMutation({
    mutationFn: (payload: any) => api.put(`/appointments/${editing!.id}`, payload),
    onSuccess: () => { qc.invalidateQueries({ queryKey: apptQueryKey }); setEditing(null); reset(); setErrMsg(null); },
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

  const onSubmit = (values: AppointmentForm) => {
    setErrMsg(null);
    const payload = {
      ...values,
      start_time: values.start_time.includes('T') ? toISOFromLocal(values.start_time) : values.start_time,
    };
    if (editing) updateMut.mutate(payload); else createMut.mutate(payload);
  };

  if (isLoading) return <p>Carregando...</p>;
  if (error) return <p>Erro: {(error as Error).message}</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Agendamentos</h2>

      <div className="flex items-end gap-2">
        <div>
          <label htmlFor="dateFilter" className="block text-sm">Filtro por data (YYYY-MM-DD)</label>
          <input id="dateFilter" type="date" className="border p-2 rounded" value={dateFilter} onChange={(e)=>setDateFilter(e.target.value)} />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end">
        <div>
          <label htmlFor="client" className="block text-sm">Cliente</label>
          <select id="client" className="border p-2 rounded w-full" {...register('client_id')}>
            <option value="">Selecione...</option>
            {clients?.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {errors.client_id && <p className="text-red-600 text-xs mt-1">{errors.client_id.message}</p>}
        </div>
        <div>
          <label htmlFor="prof" className="block text-sm">Profissional</label>
          <select id="prof" className="border p-2 rounded w-full" {...register('professional_id')}>
            <option value="">Selecione...</option>
            {professionals?.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          {errors.professional_id && <p className="text-red-600 text-xs mt-1">{errors.professional_id.message}</p>}
        </div>
        <div>
          <label htmlFor="serv" className="block text-sm">Serviço</label>
          <select id="serv" className="border p-2 rounded w-full" {...register('service_id')}>
            <option value="">Selecione...</option>
            {services?.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          {errors.service_id && <p className="text-red-600 text-xs mt-1">{errors.service_id.message}</p>}
        </div>
        <div>
          <label htmlFor="start" className="block text-sm">Início</label>
          <input id="start" type="datetime-local" className="border p-2 rounded w-full" {...register('start_time')} />
          {errors.start_time && <p className="text-red-600 text-xs mt-1">{errors.start_time.message}</p>}
        </div>
        <div className="flex gap-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={isSubmitting || createMut.isPending || updateMut.isPending}>
            {editing ? 'Salvar' : 'Agendar'}
          </button>
          {editing && (
            <button type="button" className="px-3 py-2 border rounded" onClick={()=>{setEditing(null); reset(); setErrMsg(null);}}>Cancelar</button>
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
                <button className="px-3 py-1 border rounded" onClick={()=>{setEditing(a); reset({ client_id:a.client_id, professional_id:a.professional_id, service_id:a.service_id, start_time: toLocalInputValue(a.start_time), status:a.status });}}>Editar</button>
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
