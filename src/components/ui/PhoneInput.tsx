import { useEffect, useState } from 'react';
import { maskPhone } from '@/utils/masks';

export default function PhoneInput({ value, onChange, id, className, title }: {
  value?: string;
  onChange: (phone: string) => void;
  id?: string;
  className?: string;
  title?: string;
}) {
  const [display, setDisplay] = useState('');
  useEffect(() => {
    setDisplay(maskPhone(value || ''));
  }, [value]);
  return (
    <input
      id={id}
      className={className}
      value={display}
      title={title}
      onChange={(e) => {
        const masked = maskPhone(e.target.value);
        setDisplay(masked);
        onChange(masked);
      }}
      inputMode="tel"
      aria-label="Telefone"
    />
  );
}
