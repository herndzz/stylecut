import type { Service } from '@/types';

export default function ServiceItem({ service, onEdit, onDelete }: {
  service: Service;
  onEdit: (s: Service) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div className="border rounded p-3 flex items-center justify-between mb-2 bg-white">
      <div className="space-y-1">
        <div className="font-medium">{service.name}</div>
        <div className="text-sm text-gray-600">{service.duration_minutes} min • R$ {(service.price_cents / 100).toFixed(2)}</div>
        {service.description && <div className="text-xs text-gray-500">{service.description}</div>}
      </div>
      <div className="space-x-2">
        <button className="px-3 py-1 border rounded" onClick={() => onEdit(service)}>Editar</button>
        <button className="px-3 py-1 border rounded text-red-600" onClick={() => onDelete(service.id)}>Excluir</button>
      </div>
    </div>
  );
}
