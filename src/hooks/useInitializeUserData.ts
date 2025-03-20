
import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CarData, UserData } from '@/types/forms';

export const useInitializeUserData = () => {
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if we have user data from location state
    const locationUserData = location.state?.userData as UserData | undefined;
    const locationCarData = location.state?.carData as CarData | undefined;
    const locationUserId = location.state?.userId as string | undefined;
    
    const loadUserData = async () => {
      try {
        setIsLoading(true);
        
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
                  mileage: listing.mileage ? Number(listing.mileage) : 0,
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
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading user data:", error);
        setErrorMessage("Error al cargar los datos. Por favor intenta de nuevo.");
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [location]);

  return {
    userData,
    carData,
    userId,
    errorMessage,
    isLoading
  };
};
