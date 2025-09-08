import { useEffect, useState } from 'react';
import { formatCentsBRL, parseCurrencyToCents } from '@/utils/masks';

export default function CurrencyInput({ value, onChange, id, className }: {
  value: number | undefined;
  onChange: (cents: number) => void;
  id?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    if (typeof value === 'number') setDisplay(formatCentsBRL(value));
  }, [value]);

  return (
    <input
      id={id}
      className={className}
      value={display}
      onChange={(e) => {
        const text = e.target.value;
        const cents = parseCurrencyToCents(text);
        setDisplay(formatCentsBRL(cents));
        onChange(cents);
      }}
      onBlur={(e) => {
        const cents = parseCurrencyToCents(e.target.value);
        setDisplay(formatCentsBRL(cents));
      }}
    />
  );
}
