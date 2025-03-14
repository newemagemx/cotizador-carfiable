
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
  const { testWebhook, getWebhookHistory, getWebhookResponses } = await import('./webhookUtils');
  
  console.log("%c 🔍 WEBHOOK DEBUGGING HELPER 🔍", "background: #8A2BE2; color: #FFF; padding: 6px; border-radius: 4px; font-weight: bold; font-size: 14px;");
  console.log("%c Running webhook test...", "font-style: italic;");
  
  try {
    const result = await testWebhook();
    
    if (result.success) {
      console.log("%c ✅ Webhook test successful!", "color: #32CD32; font-weight: bold;");
      console.log("%c Webhook URL:", "font-weight: bold;", result.webhookUrl);
      console.log("%c Message:", "font-weight: bold;", result.message);
    } else {
      console.log("%c ❌ Webhook test failed!", "color: #FF6347; font-weight: bold;");
      console.log("%c Message:", "font-weight: bold;", result.message);
      if (result.webhookUrl) {
        console.log("%c Webhook URL:", "font-weight: bold;", result.webhookUrl);
      }
    }
    
    // Get and display webhook history
    const history = getWebhookHistory();
    if (history.length > 0) {
      console.log("%c 📋 Recent Webhook Requests (Last 20)", "background: #4682B4; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.table(history);
    } else {
      console.log("%c No webhook request history found", "font-style: italic;");
    }
    
    // Get and display webhook responses
    const responses = getWebhookResponses();
    if (responses.length > 0) {
      console.log("%c 📩 Recent Webhook Responses (Last 20)", "background: #4682B4; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.table(responses);
    } else {
      console.log("%c No webhook response history found", "font-style: italic;");
    }
    
    console.log("%c 💡 HELP", "background: #FFA500; color: #000; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("1. Ensure your webhook URL is set in Supabase's 'app_config' table with key 'webhook_endpoint'");
    console.log("2. Your webhook should handle GET requests with URL parameters");
    console.log("3. Look at the Network tab in DevTools to check the actual HTTP requests");
    console.log("4. To view full request details, check the webhook history above");
    console.log("5. To test again, run: window.testWebhook = async () => { const { testWebhookIntegration } = await import('./utils/shareUtils'); await testWebhookIntegration(); }; window.testWebhook();");
    
  } catch (error) {
    console.log("%c ❌ Error running webhook test:", "color: #FF6347; font-weight: bold;", error);
  }
};

/**
 * Display detailed webhook debugging information
 */
export const showWebhookDebugInfo = async (): Promise<void> => {
  // Import dynamically to avoid circular dependencies
  const { getWebhookConfig, getWebhookHistory, getWebhookResponses, clearWebhookData } = await import('./webhookUtils');
  
  try {
    console.log("%c 🔍 WEBHOOK DEBUGGING INFORMATION 🔍", "background: #8A2BE2; color: #FFF; padding: 6px; border-radius: 4px; font-weight: bold; font-size: 14px;");
    
    // Get and display webhook configuration
    const config = await getWebhookConfig();
    console.log("%c Configuration", "background: #4682B4; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("Webhook configured:", config.configured);
    console.log("Webhook URL:", config.url || "Not set");
    
    // Get and display webhook history
    const history = getWebhookHistory();
    console.log("%c Request History", "background: #4682B4; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    if (history.length > 0) {
      console.table(history.map(item => ({
        timestamp: new Date(item.timestamp).toLocaleString(),
        type: item.type,
        method: item.method,
        url: item.url.substring(0, 50) + (item.url.length > 50 ? '...' : '')
      })));
      
      console.log("To see full request details:");
      history.forEach((item, index) => {
        console.log(`Request #${index + 1} (${item.type}):`);
        console.log("URL:", item.url);
        console.log("Data:", item.data);
        console.log("-------------------");
      });
    } else {
      console.log("No request history found");
    }
    
    // Get and display webhook responses
    const responses = getWebhookResponses();
    console.log("%c Response History", "background: #4682B4; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    if (responses.length > 0) {
      console.table(responses.map(item => ({
        id: item.id,
        timestamp: item.timestamp ? new Date(item.timestamp).toLocaleString() : 'unknown',
        success: item.success,
        status: item.status
      })));
      
      console.log("To see full response details:");
      responses.forEach((item, index) => {
        console.log(`Response #${index + 1} (ID: ${item.id}):`);
        console.log("Success:", item.success);
        console.log("Status:", item.status);
        console.log("Response:", item.response);
        console.log("-------------------");
      });
    } else {
      console.log("No response history found");
    }
    
    console.log("%c Helper Functions", "background: #4682B4; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("1. Test webhook: window.testWebhook = async () => { const { testWebhookIntegration } = await import('./utils/shareUtils'); await testWebhookIntegration(); }; window.testWebhook();");
    console.log("2. Show this info again: window.debugWebhook = async () => { const { showWebhookDebugInfo } = await import('./utils/shareUtils'); await showWebhookDebugInfo(); }; window.debugWebhook();");
    console.log("3. Clear history: window.clearWebhookData = async () => { const { clearWebhookData } = await import('./utils/webhookUtils'); clearWebhookData(); console.log('Webhook history cleared'); }; window.clearWebhookData();");
    
  } catch (error) {
    console.error("Error displaying webhook debug info:", error);
  }
};
