export function validateRequired(value: string, fieldLabel: string) {
  if (!value || !value.trim()) return `${fieldLabel} é obrigatório.`;
  return '';
}

export function validatePhone(value: string) {
  if (!value || !value.trim()) return 'Telefone é obrigatório.';
  const cleaned = value.replace(/[^0-9]/g, '');
  if (cleaned.length < 8) return 'Telefone inválido.';
  return '';
}

export function validatePositiveNumber(value: string | number, fieldLabel: string) {
  const v = typeof value === 'number' ? value : parseFloat(String(value).replace(',', '.'));
  if (!isFinite(v) || v <= 0) return `${fieldLabel} inválido.`;
  return '';
}

export function validatePositiveInteger(value: string | number, fieldLabel: string) {
  const v = typeof value === 'number' ? value : parseInt(String(value).replace(/[^0-9]/g, ''), 10);
  if (!isFinite(v) || v <= 0) return `${fieldLabel} inválido.`;
  if (!Number.isInteger(v)) return `${fieldLabel} deve ser inteiro.`;
  return '';
}

export function validateDate(value: string) {
  if (!value) return 'Data é obrigatória.';
  const ok = /^\d{4}-\d{2}-\d{2}$/.test(value);
  if (!ok) return 'Data inválida (use YYYY-MM-DD).';
  const dt = new Date(value + 'T00:00:00');
  if (isNaN(dt.getTime())) return 'Data inválida.';
  return '';
}

export function validateTime(value: string) {
  if (!value) return 'Hora é obrigatória.';
  const ok = /^([01]?\d|2[0-3]):[0-5]\d$/.test(value);
  if (!ok) return 'Hora inválida (use HH:mm).';
  return '';
}
