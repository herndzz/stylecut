import { useState } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { useServices } from '@/hooks/useServices';
import type { Service } from '@/types';
import ServiceForm from '@/components/services/ServiceForm';
import ServiceItem from '@/components/services/ServiceItem';
import { FlatList } from '@/components/ui/FlatList';
import { FixedSizeList as List } from 'react-window';
import { useToast } from '@/components/ui/ToastProvider';

export default function Services() {
  const [q, setQ] = useState('');
  const dq = useDebounce(q, 300);
  const { list, create, update, remove } = useServices(dq);
  const { notify } = useToast();

  const [editing, setEditing] = useState<Service | null>(null);

  const onCreate = (values: any) => {
    create.mutate(values, {
      onSuccess: () => notify({ type: 'success', message: 'Serviço criado' }),
      onError: (e: any) => notify({ type: 'error', message: e.message || 'Erro ao criar' }),
    });
  };
  const onUpdate = (values: any) => {
    if (!editing) return;
    update.mutate({ id: editing.id, data: values }, {
      onSuccess: () => { setEditing(null); notify({ type: 'success', message: 'Serviço atualizado' }); },
      onError: (e: any) => notify({ type: 'error', message: e.message || 'Erro ao atualizar' }),
    });
  };
  const onDelete = (id: string) => {
    if (!confirm('Excluir serviço?')) return;
    remove.mutate(id, {
      onSuccess: () => notify({ type: 'success', message: 'Serviço excluído' }),
      onError: (e: any) => notify({ type: 'error', message: e.message || 'Erro ao excluir' }),
    });
  };

  if (list.isLoading) return <p>Carregando...</p>;
  if (list.error) return <p>Erro: {(list.error as Error).message}</p>;

  const items = list.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Serviços</h2>

      <div className="flex items-end gap-2">
        <div className="w-full md:w-64">
          <label htmlFor="q" className="block text-sm">Buscar</label>
          <input id="q" className="border p-2 rounded w-full" placeholder="nome, descrição" value={q} onChange={(e)=>setQ(e.target.value)} />
        </div>
      </div>

      <div className="border rounded p-3 bg-white">
        <h3 className="font-medium mb-2">{editing ? 'Editar serviço' : 'Novo serviço'}</h3>
        <ServiceForm
          initialValues={editing ? { name: editing.name, duration_minutes: editing.duration_minutes, price_cents: editing.price_cents, description: editing.description || '' } : undefined}
          onSubmit={editing ? onUpdate : onCreate}
          onCancel={editing ? () => setEditing(null) : undefined}
          submitting={create.isPending || update.isPending}
        />
      </div>

      {items.length > 30 ? (
        <List height={480} itemCount={items.length} itemSize={84} width={'100%'}>
          {({ index, style }) => (
            <div style={style}>
              <ServiceItem service={items[index]} onEdit={setEditing} onDelete={onDelete} />
            </div>
          )}
        </List>
      ) : (
        <FlatList<Service>
          items={items}
          keyExtractor={(s) => s.id}
          renderItem={(s) => (
            <ServiceItem service={s} onEdit={setEditing} onDelete={onDelete} />
          )}
          empty={<p className="text-sm text-gray-500">Nenhum serviço encontrado</p>}
        />
      )}
    </div>
  );
}
