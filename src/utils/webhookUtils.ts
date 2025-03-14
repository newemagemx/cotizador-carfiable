
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
    
    // Convert the test payload to URL parameters for GET request
    const params = new URLSearchParams();
    Object.entries(testPayload).forEach(([key, value]) => {
      params.append(key, value.toString());
    });
    
    // Log the full URL with params for debugging
    const fullUrl = `${webhookEndpoint}?${params.toString()}`;
    console.log("Testing webhook GET URL:", fullUrl);
    
    // Send the test payload to the webhook using GET
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
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
    
    // For GET requests, we need to flatten the nested object structure
    // and convert to URL parameters
    const flattenedData: Record<string, string> = {};
    
    // Flatten car data
    Object.entries(quotationData.car).forEach(([key, value]) => {
      flattenedData[`car_${key}`] = value !== null ? value.toString() : '';
    });
    
    // Flatten user data
    Object.entries(quotationData.user).forEach(([key, value]) => {
      flattenedData[`user_${key}`] = value.toString();
    });
    
    // Flatten calculation data
    Object.entries(quotationData.calculation).forEach(([key, value]) => {
      flattenedData[`calculation_${key}`] = value.toString();
    });
    
    // Add top-level fields
    flattenedData.id = quotationData.id;
    flattenedData.timestamp = quotationData.timestamp;
    
    // Convert to URL parameters
    const params = new URLSearchParams();
    Object.entries(flattenedData).forEach(([key, value]) => {
      params.append(key, value);
    });
    
    // Build the full URL
    const fullUrl = `${webhookEndpoint}?${params.toString()}`;
    
    console.log("Sending quotation data to webhook via GET:", flattenedData);
    console.log("Webhook URL:", fullUrl);
    
    // Send the data to the webhook using GET
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
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
