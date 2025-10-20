export function toDate(input?: string | Date | null): Date | null {
  if (!input) return null;
  if (input instanceof Date) return input;
  const d = new Date(input);
  if (isNaN(d.getTime())) return null;
  return d;
}

export function formatDate(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return 'No definida';
  return d.toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatDateTime(input?: string | Date | null): string {
  const d = toDate(input);
  if (!d) return 'No definida';
  return d.toLocaleString('es-CO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
