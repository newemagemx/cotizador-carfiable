
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CarData, UserData } from '@/types/forms';
import { ValuationResponse } from '@/types/seller';

const WEBHOOK_ENDPOINT = 'https://webhook-test.com/c9f525259444e849009b37884b2d0885'; // Updated webhook URL

export const useValuation = (
  carData: CarData | null,
  userData: UserData | null,
  userId: string | null
) => {
  const { toast } = useToast();
  const [valuationData, setValuationData] = useState<ValuationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [savedListingId, setSavedListingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Clear any previous error message when dependencies change
    setErrorMessage(null);
    
    if (!userData || !carData) {
      console.log("useValuation: Waiting for userData and carData", { userData, carData });
      return; // Wait until we have both user and car data
    }

    const calculateValuation = async () => {
      // This would be replaced with an actual API call to a valuation service
      try {
        console.log("useValuation: Starting valuation calculation", { userData, carData, userId });
        // For now, simulate an API call with setTimeout
        setIsLoading(true);
        
        // Safely parse mileage and year as numbers
        const mileage = parseInt(carData.mileage?.toString() || '0');
        const yearString = carData.year?.toString() || '2020';
        
        // You can replace this with an actual API call when ready
        const webhookData = {
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
        
        console.log("useValuation: Prepared webhook data", webhookData);

        // This is currently just a mock response - in production connect to your valuation API
        const mockValuationResponse = await new Promise<ValuationResponse>((resolve) => {
          setTimeout(() => {
            // Mock price calculation based on car data
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
        
        console.log("useValuation: Generated mock valuation", mockValuationResponse);

        // Store the valuation in the database
        if (userId) {
          try {
            console.log("useValuation: Saving valuation to database for user", userId);
            const { data, error } = await supabase
              .from('vehicle_listings')
              .insert({
                user_id: userId,
                brand: carData.brand || '',
                model: carData.model || '',
                year: yearString,
                version: carData.version || '',
                mileage: mileage,
                condition: carData.condition || 'good',
                location: carData.location || '',
                features: carData.features || [],
                estimated_price_quick: mockValuationResponse.quickSellPrice,
                estimated_price_balanced: mockValuationResponse.balancedPrice,
                estimated_price_premium: mockValuationResponse.premiumPrice,
                currency: 'MXN',
                status: 'draft'
              })
              .select()
              .single();

            if (error) {
              console.error('Error saving valuation:', error);
              toast({
                title: "Error al guardar",
                description: "No se pudo guardar la valuación. " + error.message,
                variant: "destructive",
              });
            } else if (data) {
              console.log("useValuation: Successfully saved valuation", data);
              setSavedListingId(data.id);
              mockValuationResponse.id = data.id;
            }
          } catch (err) {
            console.error('Exception saving valuation:', err);
          }
        } else {
          console.log("useValuation: No userId provided, skipping database save");
        }

        // Send to webhook for testing/integration
        try {
          console.log("useValuation: Sending data to webhook", WEBHOOK_ENDPOINT);
          const webhookResponse = await fetch(WEBHOOK_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ...webhookData,
              valuation: mockValuationResponse
            }),
          });
          
          if (!webhookResponse.ok) {
            console.warn('Webhook notification failed:', await webhookResponse.text());
          } else {
            console.log("useValuation: Webhook notification successful");
          }
        } catch (err) {
          console.warn('Webhook error:', err);
        }

        setValuationData(mockValuationResponse);
        setIsLoading(false);
      } catch (error) {
        console.error('Error during valuation:', error);
        toast({
          title: "Error de valuación",
          description: "No se pudo completar la valuación del vehículo. Por favor intenta de nuevo.",
          variant: "destructive",
        });
        setIsLoading(false);
        setErrorMessage("Error al calcular la valuación. Por favor intenta de nuevo.");
      }
    };

    calculateValuation();
  }, [carData, userData, userId, toast]);

  const updateSelectedOption = async (selectedOption: string, listingId: string | null) => {
    setIsLoading(true);
    
    // If we have a listing ID, update it with the selected price type
    if (listingId) {
      try {
        console.log("useValuation: Updating selected price type", { listingId, selectedOption });
        const { error } = await supabase
          .from('vehicle_listings')
          .update({ 
            selected_price_type: selectedOption,
            status: 'published'
          })
          .eq('id', listingId);
          
        if (error) {
          console.error('Error updating listing:', error);
          toast({
            title: "Error al actualizar",
            description: "No se pudo actualizar la selección. " + error.message,
            variant: "destructive",
          });
        } else {
          console.log("useValuation: Successfully updated listing with selected price type");
        }
      } catch (err) {
        console.error('Exception updating listing:', err);
      }
    } else {
      console.log("useValuation: No listing ID available, skipping update");
    }
    
    // Show success message
    toast({
      title: "¡Excelente elección!",
      description: "Hemos registrado tu preferencia de precio. Te contactaremos pronto.",
    });
    
    setIsLoading(false);
    
    return { success: true, listingId };
  };

  return {
    valuationData,
    isLoading,
    savedListingId,
    errorMessage,
    updateSelectedOption
  };
};
