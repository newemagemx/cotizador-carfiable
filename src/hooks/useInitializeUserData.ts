
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
          console.log('Using user data from location state:', locationUserData);
          setUserData(locationUserData);
        }
        
        if (locationCarData) {
          console.log('Using car data from location state:', locationCarData);
          setCarData(locationCarData);
        }
        
        if (locationUserId) {
          console.log('Using user ID from location state:', locationUserId);
          setUserId(locationUserId);
        } else {
          // Try to get current user from Supabase
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            console.log('Found Supabase session user:', session.user.id);
            setUserId(session.user.id);
            
            // If we don't have user data from state, try to get it from user metadata
            if (!locationUserData) {
              const metadata = session.user.user_metadata;
              if (metadata) {
                console.log('Using user data from metadata:', metadata);
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
                console.log('Retrieved car data from vehicle_listings:', listing);
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
          } else {
            console.log('No Supabase session found, checking localStorage/sessionStorage');
            // Try to get data from localStorage/sessionStorage as a fallback
            const storedUserData = sessionStorage.getItem('userData');
            const storedValuationData = localStorage.getItem('valuationData');
            
            if (storedUserData) {
              try {
                const parsedUserData = JSON.parse(storedUserData);
                console.log('Retrieved user data from sessionStorage:', parsedUserData);
                setUserData(parsedUserData);
                if (parsedUserData.id) {
                  setUserId(parsedUserData.id);
                }
              } catch (parseError) {
                console.error('Error parsing userData from sessionStorage:', parseError);
              }
            } else if (storedValuationData) {
              try {
                const valuationData = JSON.parse(storedValuationData);
                console.log('Retrieved data from valuationData in localStorage:', valuationData);
                if (valuationData.userData) {
                  setUserData(valuationData.userData);
                }
                if (valuationData.carData) {
                  setCarData(valuationData.carData);
                }
                if (valuationData.userId) {
                  setUserId(valuationData.userId);
                }
              } catch (parseError) {
                console.error('Error parsing valuationData from localStorage:', parseError);
              }
            }
          }
        }

        // After all attempts to load data, check if we have the necessary data
        if (!userData && !locationUserData && !sessionStorage.getItem('userData') && !localStorage.getItem('valuationData')) {
          console.error('No user data found after all attempts');
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
