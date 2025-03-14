
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
    `Calcula tu propio crédito en: https://cotizador.carfiable.mx?ref=${quoteId}`
  );
  
  return `https://api.whatsapp.com/send?text=${text}`;
};

/**
 * Get the reference ID from the URL
 */
export const getReferenceId = (): string | null => {
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('ref');
  }
  return null;
};

/**
 * Test the webhook integration
 * This function is useful for debugging webhook issues
 */
export const testWebhookIntegration = async (): Promise<void> => {
  // Import dynamically to avoid circular dependencies
  const { testWebhook } = await import('./webhookUtils');
  
  try {
    const result = await testWebhook();
    
    if (result.success) {
      console.log('✅ Webhook test successful!');
      console.log(`Webhook URL: ${result.webhookUrl}`);
      console.log(`Message: ${result.message}`);
    } else {
      console.error('❌ Webhook test failed!');
      console.error(`Message: ${result.message}`);
      if (result.webhookUrl) {
        console.error(`Webhook URL: ${result.webhookUrl}`);
      }
    }
  } catch (error) {
    console.error('❌ Error running webhook test:', error);
  }
};

