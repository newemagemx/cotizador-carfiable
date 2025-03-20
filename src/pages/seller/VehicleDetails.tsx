
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft } from 'lucide-react';
import { useInitializeUserData } from '@/hooks/useInitializeUserData';
import ErrorState from '@/components/valuation/ErrorState';
import { supabase } from '@/integrations/supabase/client';

const VehicleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isRecovering, setIsRecovering] = useState(false);
  const [listingId, setListingId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);

  // Recuperar datos del state
  const locationState = location.state as { 
    userData: any;
    carData: any;
    listingId: string;
    priceType: string;
    valuationData: any;
    photos?: string[];
  } | null;
  
  // Get user data from custom hook as fallback
  const { 
    userData, 
    carData, 
    errorMessage: userDataError,
    isLoading: isUserDataLoading 
  } = useInitializeUserData();

  // Try to recover data if missing
  useEffect(() => {
    const recoverData = async () => {
      if (locationState?.listingId) {
        setListingId(locationState.listingId);
        if (locationState.photos) {
          setPhotos(locationState.photos);
        }
        return;
      }
      
      // Try to recover from localStorage or database
      setIsRecovering(true);
      
      try {
        // First check localStorage
        const storedData = localStorage.getItem('valuationData');
        
        if (storedData) {
          try {
            const parsedData = JSON.parse(storedData);
            if (parsedData.listingId) {
              setListingId(parsedData.listingId);
              if (parsedData.photos) {
                setPhotos(parsedData.photos);
              }
              return;
            }
          } catch (e) {
            console.error("Error parsing stored data:", e);
          }
        }
        
        // Then check if we have a user session
        const { data: { session } } = await supabase.auth.getSession();
          
        if (session?.user?.id) {
          console.log("Found user session, fetching vehicle listing");
          
          // Get the most recent vehicle listing for this user
          const { data: listings, error: listingsError } = await supabase
            .from('vehicle_listings')
            .select('id, photos')
            .eq('user_id', session.user.id)
            .order('created_at', { ascending: false })
            .limit(1);
          
          if (listingsError) {
            console.error("Error fetching listings:", listingsError);
            setError("Error al recuperar datos del vehículo.");
            return;
          }
          
          if (listings && listings.length > 0) {
            console.log("Recovered listing:", listings[0]);
            setListingId(listings[0].id);
            if (listings[0].photos) {
              setPhotos(listings[0].photos);
            }
          } else {
            setError("No se encontraron vehículos registrados.");
          }
        } else {
          setError("No se encontró una sesión de usuario.");
        }
      } catch (err) {
        console.error("Error recovering data:", err);
        setError("Error al recuperar datos. Por favor, inicia el proceso nuevamente.");
      } finally {
        setIsRecovering(false);
      }
    };
    
    recoverData();
  }, [locationState]);

  const handleGoBack = () => {
    navigate('/seller/vehicle-photos');
  };

  const handleGoToDashboard = () => {
    navigate('/seller/dashboard');
  };

  // Loading state
  if (isRecovering || isUserDataLoading) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <Card className="shadow-lg p-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            <p className="text-center text-lg">Recuperando datos del vehículo...</p>
          </div>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container max-w-2xl mx-auto py-8 px-4">
        <ErrorState message={error} />
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleGoBack} 
            variant="outline" 
            className="flex items-center gap-2 mr-2"
          >
            <ArrowLeft className="h-4 w-4" /> Volver
          </Button>
          <Button onClick={handleGoToDashboard}>
            Ir al panel de control
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto my-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Detalles del vehículo</CardTitle>
            <CardDescription>
              Has llegado a la página de detalles del vehículo.
              {photos.length > 0 
                ? ` Has subido ${photos.length} fotos.` 
                : ' No has subido ninguna foto.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {listingId && (
              <div className="bg-gray-50 p-3 rounded-md">
                <p className="text-sm text-gray-700">
                  ID de tu vehículo: <span className="font-medium">{listingId}</span>
                </p>
              </div>
            )}
            
            <p className="text-center text-muted-foreground">
              Esta es una página temporal que representa el siguiente paso del proceso.
              Aquí se implementará el formulario para detalles adicionales del vehículo.
            </p>
            
            {photos.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium text-center">Fotos subidas:</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {photos.map((url, index) => (
                    <div key={index} className="aspect-square rounded-md overflow-hidden bg-gray-100">
                      <img 
                        src={url} 
                        alt={`Foto ${index + 1}`} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={handleGoToDashboard}
              className="w-full sm:w-auto"
            >
              Ir al panel de control
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VehicleDetails;
