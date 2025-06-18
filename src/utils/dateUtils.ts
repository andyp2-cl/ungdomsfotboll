export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('sv-SE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
} 