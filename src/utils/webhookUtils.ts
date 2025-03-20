
import { supabase } from "@/integrations/supabase/client";
import { CarData, UserData } from "@/types/forms";

// Fixed webhook endpoint - using the provided test webhook URL
const FIXED_WEBHOOK_ENDPOINT = "https://webhook-test.com/c9f525259444e849009b37884b2d0885";

/**
 * Retrieve the webhook endpoint from app_config table
 */
export const getWebhookEndpoint = async (): Promise<string | null> => {
  try {
    // Log to verify this function is being called
    console.log("Retrieving webhook endpoint from app_config...");
    
    const { data, error } = await supabase
      .from('app_config')
      .select('value')
      .eq('key', 'webhook_endpoint')
      .single();
    
    if (error) {
      console.error("Error retrieving webhook endpoint:", error);
      console.log("Using fixed webhook endpoint as fallback:", FIXED_WEBHOOK_ENDPOINT);
      return FIXED_WEBHOOK_ENDPOINT;
    }
    
    if (!data || !data.value) {
      console.warn("No webhook endpoint found in app_config, using fixed endpoint:", FIXED_WEBHOOK_ENDPOINT);
      return FIXED_WEBHOOK_ENDPOINT;
    }
    
    console.log("Retrieved webhook endpoint from app_config:", data.value);
    return data.value;
  } catch (err) {
    console.error("Exception retrieving webhook endpoint:", err);
    console.log("Using fixed webhook endpoint as fallback:", FIXED_WEBHOOK_ENDPOINT);
    return FIXED_WEBHOOK_ENDPOINT;
  }
};

/**
 * Test the configured webhook endpoint
 */
export const testWebhook = async (specificEndpoint?: string): Promise<{ success: boolean, message: string, webhookUrl?: string }> => {
  try {
    // Use the provided endpoint, or the fixed endpoint as default
    const webhookEndpoint = specificEndpoint || FIXED_WEBHOOK_ENDPOINT;
    
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
    console.log("%c ⚡ WEBHOOK TEST REQUEST ⚡", "background: #FFD700; color: #000; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("%c URL", "font-weight: bold;", fullUrl);
    console.log("%c Payload", "font-weight: bold;", testPayload);
    
    // Save the request to history
    saveWebhookHistory({
      timestamp: new Date().toISOString(),
      url: fullUrl,
      method: 'GET',
      data: testPayload,
      type: 'test'
    });
    
    // Send the test payload to the webhook using GET
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log("%c ❌ WEBHOOK TEST FAILED ❌", "background: #FF6347; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.log("%c Status", "font-weight: bold;", response.status, response.statusText);
      console.log("%c Error", "font-weight: bold;", errorText);
      
      // Save the error response
      saveWebhookResponse({
        id: testPayload.id,
        success: false,
        status: response.status,
        response: errorText
      });
      
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
      console.log("%c ✅ WEBHOOK TEST SUCCEEDED ✅", "background: #32CD32; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.log("%c Response", "font-weight: bold;", responseData);
    } catch (e) {
      responseData = await response.text();
      console.log("%c ✅ WEBHOOK TEST SUCCEEDED ✅", "background: #32CD32; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.log("%c Response (Text)", "font-weight: bold;", responseData);
    }
    
    // Save the successful response
    saveWebhookResponse({
      id: testPayload.id,
      success: true,
      status: response.status,
      response: responseData
    });
    
    return {
      success: true,
      message: `Webhook test successful: ${JSON.stringify(responseData)}`,
      webhookUrl: webhookEndpoint
    };
  } catch (err) {
    console.log("%c ❌ WEBHOOK TEST ERROR ❌", "background: #FF6347; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("%c Error", "font-weight: bold;", err);
    
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
    // Use the fixed webhook endpoint directly to avoid any retrieval issues
    const webhookEndpoint = FIXED_WEBHOOK_ENDPOINT;
    
    console.log("Using webhook endpoint for quotation:", webhookEndpoint);
    
    if (!webhookEndpoint) {
      console.error("No webhook endpoint configured");
      return false;
    }
    
    // Generate a unique ID for tracking
    const quotationId = generateUniqueId();
    
    // Prepare the quotation data for the webhook
    const quotationData = {
      id: quotationId,
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
    
    console.log("%c 🚀 WEBHOOK QUOTATION SENT 🚀", "background: #4169E1; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("%c URL", "font-weight: bold;", fullUrl);
    console.log("%c Original Data", "font-weight: bold;", quotationData);
    console.log("%c Flattened Data", "font-weight: bold;", flattenedData);
    
    // Add to webhook history in localStorage for debugging
    saveWebhookHistory({
      timestamp: new Date().toISOString(),
      url: fullUrl,
      method: 'GET',
      data: flattenedData,
      type: 'quotation'
    });
    
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
      console.log("%c ❌ WEBHOOK REQUEST FAILED ❌", "background: #FF6347; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.log("%c Status", "font-weight: bold;", response.status, response.statusText);
      console.log("%c Error", "font-weight: bold;", errorText);
      
      // Save the error response
      saveWebhookResponse({
        id: quotationData.id,
        success: false,
        status: response.status,
        response: errorText
      });
      
      return false;
    }
    
    // Try to parse and log the response
    try {
      const responseData = await response.json();
      console.log("%c ✅ WEBHOOK RESPONSE ✅", "background: #32CD32; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.log("%c Response", "font-weight: bold;", responseData);
      
      // Save the successful response
      saveWebhookResponse({
        id: quotationData.id,
        success: true,
        status: response.status,
        response: responseData
      });
    } catch (e) {
      const responseText = await response.text();
      console.log("%c ✅ WEBHOOK RESPONSE ✅", "background: #32CD32; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
      console.log("%c Response (Text)", "font-weight: bold;", responseText);
      
      // Save the successful text response
      saveWebhookResponse({
        id: quotationData.id,
        success: true,
        status: response.status,
        response: responseText
      });
    }
    
    return true;
  } catch (err) {
    console.log("%c ❌ WEBHOOK ERROR ❌", "background: #FF6347; color: #FFF; padding: 4px; border-radius: 4px; font-weight: bold;");
    console.log("%c Error", "font-weight: bold;", err);
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
  const webhookUrl = FIXED_WEBHOOK_ENDPOINT;
  return {
    configured: !!webhookUrl,
    url: webhookUrl
  };
};

// Types for webhook history
interface WebhookHistoryItem {
  timestamp: string;
  url: string;
  method: string;
  data: any;
  type: 'test' | 'quotation';
}

interface WebhookResponseItem {
  id: string;
  timestamp?: string;
  success: boolean;
  status: number;
  response: any;
}

/**
 * Save webhook request to localStorage history
 */
const saveWebhookHistory = (item: WebhookHistoryItem) => {
  try {
    // Get existing history
    const historyJson = localStorage.getItem('webhook_history');
    const history: WebhookHistoryItem[] = historyJson ? JSON.parse(historyJson) : [];
    
    // Add new item
    history.unshift(item);
    
    // Limit history to 20 items
    const limitedHistory = history.slice(0, 20);
    
    // Save back to localStorage
    localStorage.setItem('webhook_history', JSON.stringify(limitedHistory));
  } catch (err) {
    console.error("Error saving webhook history:", err);
  }
};

/**
 * Save webhook response to localStorage
 */
const saveWebhookResponse = (item: WebhookResponseItem) => {
  try {
    // Add timestamp
    const itemWithTimestamp = {
      ...item,
      timestamp: new Date().toISOString()
    };
    
    // Get existing responses
    const responsesJson = localStorage.getItem('webhook_responses');
    const responses: WebhookResponseItem[] = responsesJson ? JSON.parse(responsesJson) : [];
    
    // Add new response
    responses.unshift(itemWithTimestamp);
    
    // Limit responses to 20 items
    const limitedResponses = responses.slice(0, 20);
    
    // Save back to localStorage
    localStorage.setItem('webhook_responses', JSON.stringify(limitedResponses));
  } catch (err) {
    console.error("Error saving webhook response:", err);
  }
};

/**
 * Get webhook history from localStorage
 */
export const getWebhookHistory = (): WebhookHistoryItem[] => {
  try {
    const historyJson = localStorage.getItem('webhook_history');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (err) {
    console.error("Error getting webhook history:", err);
    return [];
  }
};

/**
 * Get webhook responses from localStorage
 */
export const getWebhookResponses = (): WebhookResponseItem[] => {
  try {
    const responsesJson = localStorage.getItem('webhook_responses');
    return responsesJson ? JSON.parse(responsesJson) : [];
  } catch (err) {
    console.error("Error getting webhook responses:", err);
    return [];
  }
};

/**
 * Clear webhook history and responses from localStorage
 */
export const clearWebhookData = () => {
  localStorage.removeItem('webhook_history');
  localStorage.removeItem('webhook_responses');
};

// Add the webhook utility functions to the window object for easy console access
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.testWebhook = testWebhook;
  // @ts-ignore
  window.getWebhookHistory = getWebhookHistory;
  // @ts-ignore
  window.getWebhookResponses = getWebhookResponses;
  // @ts-ignore
  window.clearWebhookData = clearWebhookData;
}
