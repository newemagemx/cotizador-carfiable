
import { supabase } from "@/integrations/supabase/client";
import { CarData, UserData } from "@/types/forms";

/**
 * Retrieve the webhook endpoint from app_config table
 */
export const getWebhookEndpoint = async (): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'webhook_endpoint')
      .single();
    
    if (error) {
      console.error("Error retrieving webhook endpoint:", error);
      return null;
    }
    
    return data?.value || null;
  } catch (err) {
    console.error("Exception retrieving webhook endpoint:", err);
    return null;
  }
};

/**
 * Send quotation data to the configured webhook
 */
export const sendQuotationToWebhook = async (
  carData: CarData,
  userData: UserData,
  countryCode: string,
  verificationCode: string,
  calculatedPayment: number,
  selectedTerm: number
): Promise<boolean> => {
  try {
    // Get the webhook endpoint from configuration
    const webhookEndpoint = await getWebhookEndpoint();
    
    if (!webhookEndpoint) {
      console.error("No webhook endpoint configured");
      return false;
    }
    
    // Prepare the quotation data for the webhook
    const quotationData = {
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
      car: {
        brand: carData.brand,
        model: carData.model,
        year: carData.year,
        price: carData.price,
        downPaymentPercentage: carData.downPaymentPercentage,
        carId: carData.carId || null
      },
      user: {
        name: userData.name,
        email: userData.email,
        phone: `${countryCode}${userData.phone}`,
        verificationCode: verificationCode
      },
      calculation: {
        monthlyPayment: calculatedPayment,
        term: selectedTerm
      }
    };
    
    // Send the data to the webhook
    const response = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(quotationData)
    });
    
    // Check if the request was successful
    if (!response.ok) {
      console.error("Webhook request failed:", await response.text());
      return false;
    }
    
    console.log("Quotation data sent to webhook successfully");
    return true;
  } catch (err) {
    console.error("Error sending quotation to webhook:", err);
    return false;
  }
};

/**
 * Generate a unique ID for webhook payloads
 */
const generateUniqueId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
};
