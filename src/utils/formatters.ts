
import { format } from 'date-fns';

/**
 * Format a date to a localized string
 */
export function formatDate(date: string | Date | null | undefined) {
  if (!date) return '';
  try {
    return format(new Date(date), 'dd/MM/yyyy');
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Format a recurring interval to a human-readable string
 */
export function formatRecurringInterval(
  interval: string, 
  count: number, 
  customDays?: number | null
) {
  const intervalMap: Record<string, string> = {
    day: count > 1 ? 'jours' : 'jour',
    week: count > 1 ? 'semaines' : 'semaine',
    month: count > 1 ? 'mois' : 'mois',
    quarter: count > 1 ? 'trimestres' : 'trimestre',
    semester: count > 1 ? 'semestres' : 'semestre',
    year: count > 1 ? 'ans' : 'an',
    custom: 'jours personnalisés'
  };
  
  if (interval === 'custom' && customDays) {
    return `Tous les ${customDays} jours`;
  }
  
  return `Tous les ${count} ${intervalMap[interval] || 'périodes'}`;
}

/**
 * Format a number to a currency string
 */
export function formatCurrency(amount: number, currency = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a price in cents to a currency string
 */
export function formatPriceCents(priceCents: number | undefined, currency = 'EUR') {
  if (priceCents === undefined) return '';
  return formatCurrency(priceCents / 100, currency);
}
