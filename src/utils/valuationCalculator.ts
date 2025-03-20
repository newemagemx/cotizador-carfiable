
import { CarData } from '@/types/forms';
import { ValuationResponse } from '@/types/seller';

/**
 * Calculates valuation based on car data
 * This is a mock implementation that would be replaced with an actual API call
 */
export const calculateValuation = async (
  carData: CarData
): Promise<ValuationResponse> => {
  // Safely parse mileage and year as numbers
  const mileage = parseInt(carData.mileage?.toString() || '0');
  const yearString = carData.year?.toString() || '2020';
  
  // Mock price calculation based on car data
  return new Promise<ValuationResponse>((resolve) => {
    setTimeout(() => {
      const basePrice = 350000; // Base price for example
      const yearNumber = parseInt(yearString);
      const mileageImpact = mileage * -0.05; // Reduce price by mileage
      const yearImpact = (2023 - yearNumber) * -10000; // Older cars worth less
      
      const balancedPrice = Math.round(basePrice + mileageImpact + yearImpact);
      const quickPrice = Math.round(balancedPrice * 0.85); // 15% less for quick sale
      const premiumPrice = Math.round(balancedPrice * 1.15); // 15% more for premium
      
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
  // Safely parse mileage and year as numbers
  const mileage = parseInt(carData.mileage?.toString() || '0');
  const yearString = carData.year?.toString() || '2020';
  
  return {
    car: {
      brand: carData.brand || '',
      model: carData.model || '',
      year: yearString,
      version: carData.version || '',
      mileage: mileage,
      condition: carData.condition || 'good',
    },
    user: {
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
    }
  };
};
