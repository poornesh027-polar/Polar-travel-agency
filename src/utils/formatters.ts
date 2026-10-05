import { SupportedCurrency, CURRENCY_SYMBOLS, EXCHANGE_RATES_TO_USD } from '../types/expense';

export function formatCurrency(
  amount: number,
  currency: string = 'USD',
  compact: boolean = false
): string {
  const code = (currency || 'USD').toUpperCase() as SupportedCurrency;
  const symbol = CURRENCY_SYMBOLS[code] || '$';

  if (compact && Math.abs(amount) >= 1000) {
    if (code === 'JPY') {
      return `${symbol}${Math.round(amount).toLocaleString()}`;
    }
    return `${symbol}${(amount / 1000).toFixed(1)}k`;
  }

  if (code === 'JPY') {
    return `${symbol}${Math.round(amount).toLocaleString()}`;
  }

  return `${symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: SupportedCurrency
): number {
  const fromCode = (fromCurrency || 'USD').toUpperCase() as SupportedCurrency;
  const toCode = (toCurrency || 'USD').toUpperCase() as SupportedCurrency;

  if (fromCode === toCode) return amount;

  // Convert to USD first
  const rateFrom = EXCHANGE_RATES_TO_USD[fromCode] || 1.0;
  const amountInUSD = amount * rateFrom;

  // Convert USD to target
  const rateTo = EXCHANGE_RATES_TO_USD[toCode] || 1.0;
  return amountInUSD / rateTo;
}

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return dateString;
  }
}
