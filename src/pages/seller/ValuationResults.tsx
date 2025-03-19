
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Clock, 
  DollarSign, 
  Share2, 
  CheckCircle2, 
  Zap,
  BarChart4
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { VehicleData, User, PriceEstimate } from "@/types/seller";
import { supabase } from "@/integrations/supabase/client";

const ValuationResults: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate>({
    quick: 0,
    balanced: 0,
    premium: 0,
    currency: 'MXN'
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load user and vehicle data from sessionStorage
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    const storedVehicleData = sessionStorage.getItem('vehicleData');
    
    if (!storedUserData || !storedVehicleData) {
      toast({
        title: "Error",
        description: "No se encontraron los datos necesarios. Por favor vuelve a empezar el proceso.",
        variant: "destructive",
      });
      navigate('/seller');
      return;
    }

    try {
      const parsedUserData = JSON.parse(storedUserData);
      const parsedVehicleData = JSON.parse(storedVehicleData);
      
      setUserData(parsedUserData);
      setVehicleData(parsedVehicleData);
      
      // Generate valuation
      generateValuation(parsedVehicleData);
    } catch (error) {
      console.error("Error parsing stored data:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al cargar los datos. Por favor vuelve a empezar el proceso.",
        variant: "destructive",
      });
      navigate('/seller');
    }
  }, [navigate]);

  // Generate price estimation based on vehicle data
  const generateValuation = async (vehicle: VehicleData) => {
    setIsLoading(true);
    
    try {
      // Calculate base price (for demo purposes)
      // In a real app, this would come from an API or database
      const basePrice = calculateBasePrice(vehicle);
      
      // Create the price estimate
      const estimate: PriceEstimate = {
        quick: Math.round(basePrice * 0.85), // 15% less for quick sale
        balanced: basePrice,
        premium: Math.round(basePrice * 1.15), // 15% more for premium
        currency: 'MXN'
      };
      
      setPriceEstimate(estimate);
      
      // Send to webhook for demo purposes
      sendValuationToWebhook(vehicle, estimate);
      
      // Save to database if needed
      if (userData?.id) {
        saveValuationToDatabase(vehicle, estimate, userData.id);
      }
    } catch (error) {
      console.error("Error generating valuation:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error al generar la valuación. Por favor intenta nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate base price based on vehicle attributes (demo algorithm)
  const calculateBasePrice = (vehicle: VehicleData): number => {
    // Base price calculation logic - this is just a demo
    // In reality, this would be much more complex or come from an external API
    
    // Start with a base value depending on brand tier
    let baseValue = 150000; // Default base value
    
    // Apply brand multiplier
    const brandMultipliers: Record<string, number> = {
      'BMW': 2.5,
      'Mercedes-Benz': 2.4,
      'Audi': 2.3,
      'Volkswagen': 1.5,
      'Honda': 1.3,
      'Toyota': 1.4,
      'Nissan': 1.2,
      'Ford': 1.1,
      'Chevrolet': 1.0,
      'Hyundai': 1.0,
      'Kia': 0.9
    };
    
    const brandMultiplier = brandMultipliers[vehicle.brand] || 1.0;
    baseValue *= brandMultiplier;
    
    // Apply year factor
    const currentYear = new Date().getFullYear();
    const vehicleYear = parseInt(vehicle.year);
    const yearFactor = Math.max(0.5, 1 - ((currentYear - vehicleYear) * 0.08));
    baseValue *= yearFactor;
    
    // Apply mileage factor
    const mileageFactor = Math.max(0.5, 1 - (vehicle.mileage / 150000));
    baseValue *= mileageFactor;
    
    // Apply condition factor
    const conditionFactors: Record<string, number> = {
      'excellent': 1.2,
      'good': 1.0,
      'fair': 0.8
    };
    
    const conditionFactor = conditionFactors[vehicle.condition] || 1.0;
    baseValue *= conditionFactor;
    
    // Apply features bonus (each feature adds a small percentage)
    if (vehicle.features && vehicle.features.length > 0) {
      const featureBonus = 1 + (vehicle.features.length * 0.02);
      baseValue *= featureBonus;
    }
    
    // Round to nearest thousand
    return Math.round(baseValue / 1000) * 1000;
  };
  
  // Send valuation data to webhook
  const sendValuationToWebhook = async (vehicle: VehicleData, priceEstimate: PriceEstimate) => {
    try {
      // Just log for demo purposes
      console.log("Sending valuation data to webhook:", {
        vehicle,
        priceEstimate,
        timestamp: new Date().toISOString()
      });
      
      // In a real app, you would send this to a real webhook endpoint
      // For now, we'll simulate a successful response
      console.log("Webhook response received:", {
        success: true,
        message: "Valuation data received successfully"
      });
    } catch (error) {
      console.error("Error sending data to webhook:", error);
    }
  };
  
  // Save valuation to database
  const saveValuationToDatabase = async (vehicle: VehicleData, priceEstimate: PriceEstimate, userId: string) => {
    try {
      // We'll save this as a vehicle listing in draft status
      const { data, error } = await supabase
        .from('vehicle_listings')
        .insert({
          user_id: userId,
          brand: vehicle.brand,
          model: vehicle.model,
          year: vehicle.year,
          version: vehicle.version,
          mileage: vehicle.mileage,
          condition: vehicle.condition,
          location: vehicle.location || '',
          features: vehicle.features || [],
          estimated_price_quick: priceEstimate.quick,
          estimated_price_balanced: priceEstimate.balanced, 
          estimated_price_premium: priceEstimate.premium,
          currency: priceEstimate.currency,
          status: 'draft'
        })
        .select('id')
        .single();
      
      if (error) {
        console.error("Error saving valuation to database:", error);
        // Don't show error to user, as this is a background operation
        return null;
      }
      
      // If successful, return the ID
      return data.id;
    } catch (error) {
      console.error("Exception saving valuation to database:", error);
      return null;
    }
  };
  
  // Handle continue button click
  const handleContinue = () => {
    navigate('/seller/photos'); // Navigate to photo upload page
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', { 
      style: 'currency', 
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading || !vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-lg p-8 text-center">
          <div className="space-y-4">
            <BarChart4 className="mx-auto h-12 w-12 text-primary animate-pulse" />
            <CardTitle>Calculando Valuación</CardTitle>
            <CardDescription>
              Estamos analizando los datos de tu vehículo para brindarte la mejor estimación de precio.
            </CardDescription>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => navigate('/seller')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al inicio
          </Button>

          <Card className="mb-8">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle>Resultados de la Valuación</CardTitle>
              <CardDescription>
                {vehicleData.brand} {vehicleData.model} {vehicleData.year}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-800">
                  <div className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Valuación completada con éxito</p>
                      <p className="text-sm">
                        Basado en las condiciones del mercado actual y los detalles proporcionados de tu vehículo.
                      </p>
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="balanced" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="quick">Precio Rápido</TabsTrigger>
                    <TabsTrigger value="balanced">Precio Equilibrado</TabsTrigger>
                    <TabsTrigger value="premium">Precio Premium</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="quick" className="pt-4">
                    <Card>
                      <CardHeader className="bg-orange-50 pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center text-orange-700">
                              <Zap className="mr-2 h-5 w-5" />
                              Precio Rápido
                            </CardTitle>
                            <CardDescription className="text-orange-600">
                              Venta inmediata, menor ganancia
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-orange-700">
                              {formatCurrency(priceEstimate.quick)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Venta en menos de 2 semanas</p>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Trámites simplificados</p>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Pago inmediato</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tiempo estimado: 1-2 semanas
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleContinue}
                        >
                          Seleccionar
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="balanced" className="pt-4">
                    <Card>
                      <CardHeader className="bg-emerald-50 pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center text-emerald-700">
                              <BarChart4 className="mr-2 h-5 w-5" />
                              Precio Equilibrado
                            </CardTitle>
                            <CardDescription className="text-emerald-600">
                              Balance entre tiempo y ganancia
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-emerald-700">
                              {formatCurrency(priceEstimate.balanced)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Venta en 3-4 semanas</p>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Mayor exposición en el mercado</p>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Buen balance entre precio y tiempo</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tiempo estimado: 3-4 semanas
                        </div>
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={handleContinue}
                        >
                          Seleccionar
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="premium" className="pt-4">
                    <Card>
                      <CardHeader className="bg-indigo-50 pb-2">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="flex items-center text-indigo-700">
                              <DollarSign className="mr-2 h-5 w-5" />
                              Precio Premium
                            </CardTitle>
                            <CardDescription className="text-indigo-600">
                              Máxima ganancia, mayor tiempo
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-indigo-700">
                              {formatCurrency(priceEstimate.premium)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-4">
                        <div className="space-y-2 text-sm">
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Maximiza tu ganancia</p>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Marketing especializado</p>
                          </div>
                          <div className="flex items-start">
                            <CheckCircle2 className="h-4 w-4 mt-0.5 mr-2 text-green-500" />
                            <p>Compradores selectos</p>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="border-t bg-gray-50 flex justify-between">
                        <div className="text-sm text-gray-500 flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          Tiempo estimado: 5-8 semanas
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleContinue}
                        >
                          Seleccionar
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                </Tabs>
                
                <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                  <h4 className="font-medium text-blue-800 mb-2">Información de la Valuación</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600 mb-1">Marca:</p>
                      <p className="font-medium">{vehicleData.brand}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Modelo:</p>
                      <p className="font-medium">{vehicleData.model}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Año:</p>
                      <p className="font-medium">{vehicleData.year}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Versión:</p>
                      <p className="font-medium">{vehicleData.version || 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Kilometraje:</p>
                      <p className="font-medium">{vehicleData.mileage.toLocaleString()} km</p>
                    </div>
                    <div>
                      <p className="text-gray-600 mb-1">Condición:</p>
                      <p className="font-medium capitalize">{vehicleData.condition}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t bg-gray-50 flex flex-wrap gap-2 justify-between">
              <Button variant="ghost" onClick={() => navigate('/seller')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver
              </Button>
              
              <div className="flex gap-2">
                <Button variant="outline">
                  <Share2 className="mr-2 h-4 w-4" />
                  Compartir
                </Button>
                <Button onClick={handleContinue}>
                  Continuar
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ValuationResults;
