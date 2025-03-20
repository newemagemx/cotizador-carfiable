
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CarData, UserData } from '@/types/forms';
import { ValuationResponse } from '@/types/seller';

// Import the refactored components
import ValuationHeader from '@/components/valuation/ValuationHeader';
import CarDetailsCard from '@/components/valuation/CarDetailsCard';
import PricingOptions from '@/components/valuation/PricingOptions';
import ActionButtons from '@/components/valuation/ActionButtons';
import ValuationFooter from '@/components/valuation/ValuationFooter';
import LoadingState from '@/components/valuation/LoadingState';
import ErrorState from '@/components/valuation/ErrorState';

const WEBHOOK_ENDPOINT = 'https://webhook.site/your-uuid'; // Replace with actual webhook for production

const ValuationResults = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedOption, setSelectedOption] = useState<string>('balanced');
  const [isLoading, setIsLoading] = useState(false);
  const [savedListingId, setSavedListingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get the data passed from the verification step or from Supabase Auth
  const [userData, setUserData] = useState<UserData | null>(null);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Mock valuation data (to be replaced with actual API call)
  const [valuationData, setValuationData] = useState<ValuationResponse | null>(null);

  useEffect(() => {
    // Check if we have user data from location state
    const locationUserData = location.state?.userData as UserData | undefined;
    const locationCarData = location.state?.carData as CarData | undefined;
    const locationUserId = location.state?.userId as string | undefined;
    
    const loadUserData = async () => {
      try {
        // If we have state data, use it
        if (locationUserData) {
          setUserData(locationUserData);
        }
        
        if (locationCarData) {
          setCarData(locationCarData);
        }
        
        if (locationUserId) {
          setUserId(locationUserId);
        } else {
          // Try to get current user from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            setUserId(session.user.id);
            
            // If we don't have user data from state, try to get it from user metadata
            if (!locationUserData) {
              const metadata = session.user.user_metadata;
              if (metadata) {
                setUserData({
                  name: metadata.full_name || '',
                  email: session.user.email || '',
                  phone: metadata.phone || '',
                  countryCode: metadata.country_code || '+52'
                });
              }
            }
            
            // If we don't have car data, check if we can get it from the database
            if (!locationCarData) {
              // Get the most recent vehicle listing for this user
              const { data: listings, error } = await supabase
                .from('vehicle_listings')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false })
                .limit(1);
                
              if (!error && listings && listings.length > 0) {
                const listing = listings[0];
                setCarData({
                  brand: listing.brand || '',
                  model: listing.model || '',
                  year: listing.year ? listing.year.toString() : '',
                  version: listing.version || '',
                  mileage: listing.mileage ? listing.mileage.toString() : '0',
                  condition: listing.condition || 'good',
                  price: '',
                  downPaymentPercentage: 20
                });
              }
            }
          }
        }

        // Check if we have the necessary data to continue
        if (!userData && !locationUserData) {
          setErrorMessage("No se encontró información del usuario. Por favor regresa al inicio.");
        }
        
        if (!carData && !locationCarData) {
          setErrorMessage("No se encontró información del vehículo. Por favor regresa al inicio.");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setErrorMessage("Error al cargar los datos. Por favor intenta de nuevo.");
      }
    };
    
    loadUserData();
  }, [location, navigate]);

  useEffect(() => {
    if (!userData || !carData) {
      return; // Wait until we have both user and car data
    }

    const calculateValuation = async () => {
      // This would be replaced with an actual API call to a valuation service
      try {
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

        // Store the valuation in the database
        if (userId) {
          try {
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
              setSavedListingId(data.id);
              mockValuationResponse.id = data.id;
            }
          } catch (err) {
            console.error('Exception saving valuation:', err);
          }
        }

        // Send to webhook for testing/integration
        try {
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

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const handleProceed = async () => {
    if (!valuationData) return;
    
    setIsLoading(true);
    
    // If we have a listing ID, update it with the selected price type
    if (savedListingId) {
      try {
        const { error } = await supabase
          .from('vehicle_listings')
          .update({ 
            selected_price_type: selectedOption,
            status: 'published'
          })
          .eq('id', savedListingId);
          
        if (error) {
          console.error('Error updating listing:', error);
          toast({
            title: "Error al actualizar",
            description: "No se pudo actualizar la selección. " + error.message,
            variant: "destructive",
          });
        }
      } catch (err) {
        console.error('Exception updating listing:', err);
      }
    }
    
    // Show success message
    toast({
      title: "¡Excelente elección!",
      description: "Hemos registrado tu preferencia de precio. Te contactaremos pronto.",
    });
    
    // Navigate to next step or dashboard
    setIsLoading(false);
    navigate('/seller/dashboard', { 
      state: { 
        listingId: savedListingId,
        priceType: selectedOption,
        userData,
        carData,
        valuationData
      } 
    });
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (isLoading && !valuationData) {
    return <LoadingState type="calculation" carData={carData} />;
  }

  // Handle case where we have userData but not carData yet
  if (!carData || !userData) {
    return <LoadingState type="loading" />;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <ValuationHeader 
          carBrand={carData.brand} 
          carModel={carData.model} 
          carYear={carData.year} 
        />

        <CarDetailsCard carData={carData} />

        {valuationData && (
          <PricingOptions 
            valuationData={valuationData} 
            selectedOption={selectedOption} 
            onOptionSelect={handleOptionSelect} 
          />
        )}

        <ActionButtons 
          selectedOption={selectedOption} 
          isLoading={isLoading} 
          onProceed={handleProceed} 
        />

        <ValuationFooter />
      </motion.div>
    </div>
  );
};

export default ValuationResults;
