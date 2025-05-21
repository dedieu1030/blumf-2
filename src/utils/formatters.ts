
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(date: string | Date): string {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, 'dd/MM/yyyy', { locale: fr });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  if (amount === undefined || amount === null) return '';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
}

export function formatRecurringInterval(interval: string, count: number): string {
  if (!interval) return '';
  
  const intervals: Record<string, string> = {
    'day': count > 1 ? `${count} jours` : 'jour',
    'week': count > 1 ? `${count} semaines` : 'semaine',
    'month': count > 1 ? `${count} mois` : 'mois',
    'quarter': count > 1 ? `${count} trimestres` : 'trimestre',
    'semester': count > 1 ? `${count} semestres` : 'semestre',
    'year': count > 1 ? `${count} ans` : 'an'
  };
  
  return intervals[interval] || `${count} ${interval}`;
}

export function formatAddress(address: string, city?: string, zipCode?: string, country?: string): string {
  const parts = [address];
  
  if (zipCode && city) {
    parts.push(`${zipCode} ${city}`);
  } else if (city) {
    parts.push(city);
  }
  
  if (country) {
    parts.push(country);
  }
  
  return parts.filter(Boolean).join('\n');
}
