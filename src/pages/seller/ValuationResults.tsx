
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CarData, UserData } from '@/types/forms';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Clock, Check, Sparkles, ArrowRight, Share2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { ValuationResponse } from '@/types/seller';
import { formatCurrency } from '@/utils/shareUtils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

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
        const mileage = parseInt(carData.mileage.toString() || '0');
        const year = parseInt(carData.year?.toString() || '2020');
        
        // You can replace this with an actual API call when ready
        const webhookData = {
          car: {
            brand: carData.brand || '',
            model: carData.model || '',
            year: year,
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
            const mileageImpact = mileage * -0.05; // Reduce price by mileage
            const yearImpact = (2023 - year) * -10000; // Older cars worth less
            
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
                year: year,
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

  const getSelectedPrice = () => {
    if (!valuationData) return 0;
    
    switch (selectedOption) {
      case 'quick':
        return valuationData.quickSellPrice;
      case 'premium':
        return valuationData.premiumPrice;
      case 'balanced':
      default:
        return valuationData.balancedPrice;
    }
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

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  if (errorMessage) {
    return (
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        <Button onClick={() => navigate('/')} className="w-full">
          Volver al inicio
        </Button>
      </div>
    );
  }

  if (isLoading && !valuationData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Calculando el valor de tu {carData?.brand} {carData?.model}
          </h2>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Estamos analizando miles de datos para brindarte la mejor valoración...
          </p>
        </div>
      </div>
    );
  }

  // Handle case where we have userData but not carData yet
  if (!carData || !userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Cargando información...</h2>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <motion.div variants={itemVariants}>
          <h1 className="text-3xl font-bold text-center mb-2">Resultado de la Valuación</h1>
          <p className="text-center text-muted-foreground mb-8">
            Hemos calculado el valor de tu {carData.brand} {carData.model} {carData.year}.
            Selecciona la opción que mejor se adapte a tus necesidades.
          </p>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="mb-6 shadow-md border-blue-100">
            <CardHeader className="pb-2">
              <CardTitle>Tu Vehículo</CardTitle>
              <CardDescription>
                <span className="font-semibold">{carData.brand} {carData.model} {carData.year}</span>
                {carData.version && <span> - {carData.version}</span>}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Kilometraje:</span> {carData.mileage} km
                </div>
                <div>
                  <span className="text-muted-foreground">Condición:</span> {carData.condition === 'excellent' ? 'Excelente' : carData.condition === 'good' ? 'Buena' : 'Regular'}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <RadioGroup
            value={selectedOption}
            onValueChange={handleOptionSelect}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className={`relative rounded-lg border-2 ${selectedOption === 'quick' ? 'border-orange-500 bg-orange-50' : 'border-gray-200'} p-4 transition-all`}>
              <RadioGroupItem
                value="quick"
                id="quick"
                className="absolute right-4 top-4 border-orange-500"
              />
              <div className="mb-2">
                <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                  <Clock className="h-3 w-3 mr-1" /> Venta Rápida
                </Badge>
              </div>
              <Label
                htmlFor="quick"
                className="text-xl font-bold block mb-1 cursor-pointer"
              >
                {valuationData && formatCurrency(valuationData.quickSellPrice, valuationData.currency)}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Precio más bajo pero con venta garantizada en 7-14 días.
              </p>
              <ul className="text-xs space-y-1 text-gray-600">
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-orange-500" /> Proceso acelerado
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-orange-500" /> Menos trámites
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-orange-500" /> Pago inmediato
                </li>
              </ul>
            </div>

            <div className={`relative rounded-lg border-2 ${selectedOption === 'balanced' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'} p-4 transition-all`}>
              <RadioGroupItem
                value="balanced"
                id="balanced"
                className="absolute right-4 top-4 border-blue-500"
              />
              <div className="mb-2">
                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                  <Check className="h-3 w-3 mr-1" /> Equilibrado
                </Badge>
              </div>
              <Label
                htmlFor="balanced"
                className="text-xl font-bold block mb-1 cursor-pointer"
              >
                {valuationData && formatCurrency(valuationData.balancedPrice, valuationData.currency)}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                Mejor relación entre precio y tiempo de venta (15-30 días).
              </p>
              <ul className="text-xs space-y-1 text-gray-600">
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-blue-500" /> Mejor precio que la venta rápida
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-blue-500" /> Tiempo razonable
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-blue-500" /> Mayor exposición
                </li>
              </ul>
            </div>

            <div className={`relative rounded-lg border-2 ${selectedOption === 'premium' ? 'border-purple-500 bg-purple-50' : 'border-gray-200'} p-4 transition-all`}>
              <RadioGroupItem
                value="premium"
                id="premium"
                className="absolute right-4 top-4 border-purple-500"
              />
              <div className="mb-2">
                <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                  <Sparkles className="h-3 w-3 mr-1" /> Premium
                </Badge>
              </div>
              <Label
                htmlFor="premium"
                className="text-xl font-bold block mb-1 cursor-pointer"
              >
                {valuationData && formatCurrency(valuationData.premiumPrice, valuationData.currency)}
              </Label>
              <p className="text-sm text-muted-foreground mb-4">
                El mejor precio posible, pero requiere más tiempo (30-45 días).
              </p>
              <ul className="text-xs space-y-1 text-gray-600">
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-purple-500" /> Precio máximo del mercado
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-purple-500" /> Marketing premium
                </li>
                <li className="flex items-center">
                  <Check className="h-3 w-3 mr-1 text-purple-500" /> Atención personalizada
                </li>
              </ul>
            </div>
          </RadioGroup>
        </motion.div>

        <motion.div variants={itemVariants} className="flex flex-col space-y-4">
          <Button
            onClick={handleProceed}
            className="w-full py-6 text-lg"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Procesando...
              </span>
            ) : (
              <span className="flex items-center">
                Continuar con precio {selectedOption === 'quick' ? 'rápido' : selectedOption === 'premium' ? 'premium' : 'equilibrado'} 
                <ArrowRight className="ml-2 h-5 w-5" />
              </span>
            )}
          </Button>

          <Button
            variant="outline"
            className="w-full"
            disabled={isLoading}
          >
            <Share2 className="mr-2 h-4 w-4" /> Compartir valuación
          </Button>
        </motion.div>

        <motion.div variants={itemVariants}>
          <p className="text-center text-sm text-muted-foreground mt-6">
            Esta valuación es una estimación basada en los datos proporcionados y las condiciones actuales del mercado.
            El precio final puede variar según la inspección física del vehículo.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ValuationResults;
