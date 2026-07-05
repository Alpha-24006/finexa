/**
 * Formats a numeric value into a localized currency string.
 * Reads user currency preferences from localStorage.
 */
export function formatCurrency(amount: number): string {
  const currency = localStorage.getItem('user_currency') || 'INR';
  
  let locale = 'en-IN';
  let currencyCode = 'INR';

  switch (currency) {
    case 'USD':
      locale = 'en-US';
      currencyCode = 'USD';
      break;
    case 'EUR':
      locale = 'de-DE';
      currencyCode = 'EUR';
      break;
    case 'GBP':
      locale = 'en-GB';
      currencyCode = 'GBP';
      break;
    case 'INR':
    default:
      locale = 'en-IN';
      currencyCode = 'INR';
      break;
  }

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currencyCode,
    maximumFractionDigits: 0
  }).format(amount);
}

export function getCurrencySymbol(): string {
  const currency = localStorage.getItem('user_currency') || 'INR';
  switch (currency) {
    case 'USD': return '$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    case 'INR':
    default: return '₹';
  }
}
