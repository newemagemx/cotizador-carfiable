
/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: MXN)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency: string = 'MXN'): string => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(amount);
};
