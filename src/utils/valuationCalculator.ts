
import { CarData } from '@/types/forms';
import { ValuationResponse } from '@/types/seller';

/**
 * Calculates valuation based on car data
 * This is a mock implementation that would be replaced with an actual API call
 */
export const calculateValuation = async (
  carData: CarData
): Promise<ValuationResponse> => {
  // Handle missing or empty input data with defaults
  const brand = carData.brand || 'Generic';
  const model = carData.model || 'Model';
  const yearString = carData.year?.toString() || '2020';
  const mileage = parseInt(carData.mileage?.toString() || '0');
  
  console.log("valuationCalculator: Calculating valuation with data:", { brand, model, yearString, mileage });
  
  // Mock price calculation based on car data
  return new Promise<ValuationResponse>((resolve) => {
    setTimeout(() => {
      // Default base price if we don't have specific car data
      const basePrice = 350000; // Base price for example
      const yearNumber = parseInt(yearString);
      const mileageImpact = mileage * -0.05; // Reduce price by mileage
      const yearImpact = (2023 - yearNumber) * -10000; // Older cars worth less
      
      const balancedPrice = Math.max(Math.round(basePrice + mileageImpact + yearImpact), 100000);
      const quickPrice = Math.round(balancedPrice * 0.85); // 15% less for quick sale
      const premiumPrice = Math.round(balancedPrice * 1.15); // 15% more for premium
      
      console.log("valuationCalculator: Calculated prices", { quickPrice, balancedPrice, premiumPrice });
      
      resolve({
        quickSellPrice: quickPrice,
        balancedPrice: balancedPrice,
        premiumPrice: premiumPrice,
        currency: 'MXN'
      });
    }, 1500);
  });
};

/**
 * Prepares webhook data from car and user data
 */
export const prepareWebhookData = (carData: CarData, userData: any) => {
  // Handle missing or empty input data with defaults
  const brand = carData.brand || 'Generic';
  const model = carData.model || 'Model';
  const yearString = carData.year?.toString() || '2020';
  const version = carData.version || '';
  const mileage = parseInt(carData.mileage?.toString() || '0');
  const condition = carData.condition || 'good';
  
  const name = userData.name || 'Anonymous';
  const email = userData.email || '';
  const phone = userData.phone || '';
  
  return {
    car: {
      brand,
      model,
      year: yearString,
      version,
      mileage,
      condition,
    },
    user: {
      name,
      email,
      phone,
    }
  };
};
