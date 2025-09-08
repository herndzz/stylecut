import type { ReactNode } from 'react';

export function FlatList<T>({
  items,
  renderItem,
  keyExtractor,
  empty,
  className,
}: {
  items: T[] | undefined;
  renderItem: (item: T, index: number) => ReactNode;
  keyExtractor: (item: T, index: number) => string;
  empty?: ReactNode;
  className?: string;
}) {
  if (!items || items.length === 0) return <div className={className}>{empty ?? <p className="text-sm text-gray-500">Nenhum registro</p>}</div>;
  return (
    <div className={className}>
      {items.map((it, idx) => (
        <div key={keyExtractor(it, idx)}>{renderItem(it, idx)}</div>
      ))}
    </div>
  );
}
