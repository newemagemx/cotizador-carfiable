
import { supabase } from '@/integrations/supabase/client';
import { CarData } from '@/types/forms';
import { ValuationResponse } from '@/types/seller';

const WEBHOOK_ENDPOINT = 'https://webhook-test.com/c9f525259444e849009b37884b2d0885';

/**
 * Sends data to webhook for testing/integration
 */
export const sendToWebhook = async (
  webhookData: any,
  valuationData: ValuationResponse
): Promise<boolean> => {
  try {
    console.log("valuationApi: Sending data to webhook", WEBHOOK_ENDPOINT);
    
    const controller = new AbortController();
    // Set a timeout to prevent hanging if the webhook is unreachable
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const webhookResponse = await fetch(WEBHOOK_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...webhookData,
          valuation: valuationData
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!webhookResponse.ok) {
        console.warn('Webhook notification failed:', await webhookResponse.text());
        return false;
      } else {
        console.log("valuationApi: Webhook notification successful");
        return true;
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      throw fetchError;
    }
  } catch (err) {
    console.warn('Webhook error (non-critical):', err);
    return false;
  }
};

/**
 * Saves vehicle listing to database
 */
export const saveVehicleListing = async (
  userId: string,
  carData: CarData,
  valuationResponse: ValuationResponse
): Promise<{ data: any; error: any }> => {
  console.log("valuationApi: Saving valuation to vehicle_listings for user", userId);
  
  // Asegurar que tenemos valores válidos para todos los campos requeridos
  // Verificamos los campos y proporcionamos valores predeterminados si es necesario
  const brand = carData.brand || 'Vehículo';
  const model = carData.model || 'Genérico';
  const yearString = carData.year?.toString() || '2023';
  const version = carData.version || '';
  const mileage = parseInt(carData.mileage?.toString() || '0');
  const condition = carData.condition || 'good';
  const location = carData.location || '';
  const features = carData.features || [];
  
  try {
    console.log("valuationApi: Insertando datos en vehicle_listings:", {
      user_id: userId,
      brand, model, yearString, version, mileage, condition, location, features,
      estimated_prices: {
        quick: valuationResponse.quickSellPrice,
        balanced: valuationResponse.balancedPrice,
        premium: valuationResponse.premiumPrice
      }
    });
    
    const { data, error } = await supabase
      .from('vehicle_listings')
      .insert({
        user_id: userId,
        brand,
        model,
        year: yearString,
        version,
        mileage,
        condition,
        location,
        features,
        estimated_price_quick: valuationResponse.quickSellPrice,
        estimated_price_balanced: valuationResponse.balancedPrice,
        estimated_price_premium: valuationResponse.premiumPrice,
        currency: 'MXN',
        status: 'draft'
      })
      .select();

    if (error) {
      console.error('Error saving valuation:', error);
      return { data: null, error };
    }
    
    console.log("valuationApi: Successfully saved valuation to vehicle_listings", data);
    return { data: data[0], error: null };
  } catch (err) {
    console.error('Exception saving valuation:', err);
    return { data: null, error: err };
  }
};

/**
 * Updates vehicle listing with selected price option
 */
export const updateVehicleListing = async (
  selectedOption: string,
  listingId: string
): Promise<{ success: boolean; error: any }> => {
  try {
    console.log("valuationApi: Updating selected price type in vehicle_listings", { listingId, selectedOption });
    const { error } = await supabase
      .from('vehicle_listings')
      .update({ 
        selected_price_type: selectedOption,
        status: 'published'
      })
      .eq('id', listingId);
      
    if (error) {
      console.error('Error updating listing:', error);
      return { success: false, error };
    } else {
      console.log("valuationApi: Successfully updated listing with selected price type");
      return { success: true, error: null };
    }
  } catch (err) {
    console.error('Exception updating listing:', err);
    return { success: false, error: err };
  }
};
