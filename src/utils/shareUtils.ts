
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

/**
 * Creates a WhatsApp share link with car quote information
 * @param brand - Car brand
 * @param model - Car model
 * @param year - Car year
 * @param price - Formatted car price
 * @param downPaymentPercentage - Down payment percentage
 * @param monthlyPayment - Monthly payment amount
 * @param term - Loan term in months
 * @returns WhatsApp share URL
 */
export const createWhatsAppShareLink = (
  brand: string,
  model: string,
  year: string,
  price: string,
  downPaymentPercentage: number,
  monthlyPayment: number,
  term: number
): string => {
  const formattedMessage = encodeURIComponent(
    `¡Mira mi cotización de crédito automotriz con Carfiable! 🚗\n\n` +
    `*${brand} ${model} ${year}*\n` +
    `Precio: ${price}\n` +
    `Enganche: ${downPaymentPercentage}%\n` +
    `Mensualidad: ${formatCurrency(monthlyPayment)}\n` +
    `Plazo: ${term} meses\n\n` +
    `Obtén tu cotización personalizada en: https://carfiable.com/?ref=${generateShareId()}`
  );

  return `https://wa.me/?text=${formattedMessage}`;
};

/**
 * Generates a unique share ID for reference
 * @returns Random string to use as reference ID
 */
const generateShareId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Gets the reference ID from URL if present
 * @returns Reference ID or null
 */
export const getReferenceId = (): string | null => {
  const url = new URL(window.location.href);
  return url.searchParams.get('ref');
};
