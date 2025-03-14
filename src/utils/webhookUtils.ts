
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
 * Test the configured webhook endpoint
 */
export const testWebhook = async (): Promise<{ success: boolean, message: string, webhookUrl?: string }> => {
  try {
    const webhookEndpoint = await getWebhookEndpoint();
    
    if (!webhookEndpoint) {
      return { 
        success: false, 
        message: "No webhook endpoint configured in Supabase app_config table"
      };
    }
    
    // Create a simple test payload
    const testPayload = {
      id: generateUniqueId(),
      timestamp: new Date().toISOString(),
      type: "webhook_test",
      message: "This is a test message from Carfiable"
    };
    
    // Send the test payload to the webhook
    const response = await fetch(webhookEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testPayload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        message: `Webhook test failed: HTTP ${response.status} - ${errorText}`,
        webhookUrl: webhookEndpoint
      };
    }
    
    // Try to parse the response as JSON
    let responseData;
    try {
      responseData = await response.json();
    } catch (e) {
      responseData = await response.text();
    }
    
    return {
      success: true,
      message: `Webhook test successful: ${JSON.stringify(responseData)}`,
      webhookUrl: webhookEndpoint
    };
  } catch (err) {
    return {
      success: false,
      message: `Error testing webhook: ${err instanceof Error ? err.message : String(err)}`
    };
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
    
    console.log("Sending quotation data to webhook:", JSON.stringify(quotationData));
    console.log("Webhook URL:", webhookEndpoint);
    
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
      const errorText = await response.text();
      console.error(`Webhook request failed: HTTP ${response.status} - ${errorText}`);
      return false;
    }
    
    // Try to parse and log the response
    try {
      const responseData = await response.json();
      console.log("Webhook response:", JSON.stringify(responseData));
    } catch (e) {
      const responseText = await response.text();
      console.log("Webhook response (text):", responseText);
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

/**
 * Get the current webhook configuration
 */
export const getWebhookConfig = async (): Promise<{ configured: boolean, url: string | null }> => {
  const webhookUrl = await getWebhookEndpoint();
  return {
    configured: !!webhookUrl,
    url: webhookUrl
  };
};

