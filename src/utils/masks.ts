export function maskPhone(input: string) {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    return digits.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
  }
  return digits.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
}

export function parseCurrencyToCents(display: string) {
  const onlyDigits = display.replace(/\D/g, '');
  return Number(onlyDigits || '0');
}

export function formatCentsBRL(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
