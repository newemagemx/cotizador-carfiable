
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CarData, UserData } from '@/types/forms';
import { ValuationResponse } from '@/types/seller';
import { calculateValuation, prepareWebhookData } from '@/utils/valuationCalculator';
import { saveVehicleListing, sendToWebhook, updateVehicleListing } from '@/api/valuationApi';

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

    const performValuation = async () => {
      try {
        console.log("useValuation: Starting valuation calculation", { userData, carData, userId });
        setIsLoading(true);
        
        // Prepare webhook data
        const webhookData = prepareWebhookData(carData, userData);
        console.log("useValuation: Prepared webhook data", webhookData);
        
        // Calculate valuation
        const mockValuationResponse = await calculateValuation(carData);
        console.log("useValuation: Generated valuation", mockValuationResponse);

        // Store the valuation in the database if we have a userId
        if (userId) {
          const { data, error } = await saveVehicleListing(userId, carData, mockValuationResponse);
          
          if (error) {
            toast({
              title: "Error al guardar",
              description: "No se pudo guardar la valuación. " + error.message,
              variant: "destructive",
            });
          } else if (data) {
            setSavedListingId(data.id);
            mockValuationResponse.id = data.id;
          }
        } else {
          console.log("useValuation: No userId provided, skipping database save");
        }

        // Send to webhook for testing/integration
        await sendToWebhook(webhookData, mockValuationResponse);

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

    performValuation();
  }, [carData, userData, userId, toast]);

  const updateSelectedOption = async (selectedOption: string, listingId: string | null) => {
    setIsLoading(true);
    
    // If we have a listing ID, update it with the selected price type
    if (listingId) {
      const { success, error } = await updateVehicleListing(selectedOption, listingId);
      
      if (!success) {
        toast({
          title: "Error al actualizar",
          description: "No se pudo actualizar la selección. " + (error?.message || ''),
          variant: "destructive",
        });
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
