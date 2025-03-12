
/**
 * Generate a random ID for sharing
 */
export const generateShareId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

/**
 * Create a WhatsApp share link with quote details
 */
export const createWhatsAppShareLink = (
  carBrand: string, 
  carModel: string, 
  carYear: string, 
  price: string, 
  downPayment: number,
  monthlyPayment: number,
  term: number
): string => {
  // Create a unique ID for this quote
  const quoteId = generateShareId();
  
  // Format the message text
  const text = encodeURIComponent(
    `¡Mira mi cotización de Carfiable para un ${carBrand} ${carModel} ${carYear}!\n\n` +
    `💰 Precio: ${price}\n` +
    `⬇️ Enganche: ${downPayment}%\n` +
    `📅 Plazo: ${term} meses\n` +
    `💵 Mensualidad: $${monthlyPayment}\n\n` +
    `Calcula tu propio crédito en: https://carfiable.mx/cotizador?ref=${quoteId}`
  );
  
  return `https://api.whatsapp.com/send?text=${text}`;
};
