
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const calculationDone = useRef(false);
  const isUpdating = useRef(false);

  useEffect(() => {
    // Only run this effect once per component instance
    if (calculationDone.current) return;

    // Clear any previous error message when dependencies change
    setErrorMessage(null);
    
    // Create default objects if carData or userData is null
    const safeCarData: CarData = carData || {
      brand: 'Generic',
      model: 'Model',
      year: '2020',
      price: '',
      downPaymentPercentage: 20,
      mileage: 0,
      condition: 'good'
    };
    
    const safeUserData: UserData = userData || {
      name: 'Anonymous',
      email: '',
      phone: ''
    };
    
    const performValuation = async () => {
      try {
        console.log("useValuation: Starting valuation calculation", { safeUserData, safeCarData, userId });
        setIsLoading(true);
        
        // Prepare webhook data
        const webhookData = prepareWebhookData(safeCarData, safeUserData);
        console.log("useValuation: Prepared webhook data", webhookData);
        
        // Calculate valuation
        const mockValuationResponse = await calculateValuation(safeCarData);
        console.log("useValuation: Generated valuation", mockValuationResponse);

        // Store the valuation in the database if we have a userId
        if (userId) {
          try {
            const { data, error } = await saveVehicleListing(userId, safeCarData, mockValuationResponse);
            
            if (error) {
              console.error("Error saving valuation to database:", error);
              // Continue even if saving to DB fails - don't block the UI
            } else if (data) {
              console.log("useValuation: Saved listing with ID", data.id);
              setSavedListingId(data.id);
              mockValuationResponse.id = data.id;
            }
          } catch (dbError) {
            console.error("Exception when saving to database:", dbError);
            // Continue without DB save
          }
        } else {
          console.log("useValuation: No userId provided, skipping database save");
        }

        // Don't wait for webhook - it's often unavailable in development
        sendToWebhook(webhookData, mockValuationResponse)
          .catch(err => console.warn("Webhook notification failed (non-critical):", err));

        setValuationData(mockValuationResponse);
        calculationDone.current = true;
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

  const updateSelectedOption = useCallback(async (selectedOption: string, listingId: string | null) => {
    // Prevent multiple simultaneous calls
    if (isUpdating.current) return { success: false, listingId };
    
    try {
      isUpdating.current = true;
      setIsLoading(true);
      
      // If we have a listing ID, update it with the selected price type
      if (listingId) {
        try {
          const { success, error } = await updateVehicleListing(selectedOption, listingId);
          
          if (!success) {
            console.error("Failed to update listing with selected option:", error);
            toast({
              title: "Error al actualizar",
              description: "No se pudo actualizar la selección. " + (error?.message || ''),
              variant: "destructive",
            });
            // Continue even if update fails
          }
        } catch (err) {
          console.error("Exception updating listing:", err);
          // Continue even if update fails
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
      isUpdating.current = false;
      
      return { success: true, listingId };
    } catch (error) {
      console.error("Error in updateSelectedOption:", error);
      setIsLoading(false);
      isUpdating.current = false;
      return { success: false, listingId };
    }
  }, [toast]);

  return {
    valuationData,
    isLoading,
    savedListingId,
    errorMessage,
    updateSelectedOption
  };
};
