
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
import { AlertTriangle, ChevronLeft, ShieldCheck } from "lucide-react";
import VerificationCodeInput from "@/components/verification/VerificationCodeInput";
import VerificationActions from "@/components/verification/VerificationActions";
import { useVerificationCode } from "@/hooks/useVerificationCode";
import { toast } from "@/hooks/use-toast";
import { SellerData, VehicleData } from "@/types/seller";
import { verifyCodeAndSaveData } from "@/components/verification/VerificationService";

const VerifyPhone: React.FC = () => {
  const navigate = useNavigate();
  const [sellerData, setSellerData] = useState<SellerData | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Load data from sessionStorage
  useEffect(() => {
    const storedSellerData = sessionStorage.getItem('sellerData');
    const storedVehicleData = sessionStorage.getItem('vehicleData');
    
    if (!storedSellerData || !storedVehicleData) {
      toast({
        title: "Error",
        description: "No se encontraron los datos necesarios. Por favor vuelve a empezar el proceso.",
        variant: "destructive",
      });
      navigate('/seller');
      return;
    }

    try {
      setSellerData(JSON.parse(storedSellerData));
      setVehicleData(JSON.parse(storedVehicleData));
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

  // Initialize verification code hook
  const {
    verificationCode,
    expectedCode,
    isLoading,
    setIsLoading,
    error,
    setError,
    countdown,
    canResend,
    isSendingSMS,
    handleInputChange,
    sendCode
  } = useVerificationCode({ 
    userData: sellerData as any,
    countryCode: sellerData?.countryCode || '+52'
  });

  // Handle verification code submission
  const handleVerify = async () => {
    if (!verificationCode) {
      setVerificationError('Por favor ingresa el código de verificación');
      return;
    }

    if (!sellerData || !vehicleData) {
      toast({
        title: "Error",
        description: "No se encontraron los datos necesarios. Por favor vuelve a empezar el proceso.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setVerificationError('');

    try {
      // Convert to the expected format for the verification service
      const userData = {
        name: sellerData.name,
        email: sellerData.email,
        phone: sellerData.phone,
        countryCode: sellerData.countryCode
      };

      const carData = {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        price: '0', // This will be updated after valuation
        downPaymentPercentage: 0, // Not applicable for seller flow
        carId: '', // Will be created later
      };

      const success = await verifyCodeAndSaveData(
        verificationCode,
        expectedCode,
        carData,
        userData,
        sellerData.countryCode,
        undefined,
        0,
        () => {
          // Update the sellerData with verification timestamp
          const updatedSellerData = {
            ...sellerData,
            lastVerified: new Date().toISOString()
          };
          sessionStorage.setItem('sellerData', JSON.stringify(updatedSellerData));
          
          // Navigate to the next page
          navigate('/seller/valuation/results'); // We'll create this page later
        }
      );

      if (!success) {
        setVerificationError('El código ingresado no es válido. Por favor revisa e intenta nuevamente.');
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setVerificationError('Ocurrió un error al verificar el código. Por favor intenta nuevamente.');
    } finally {
      setVerifying(false);
    }
  };

  if (!sellerData || !vehicleData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="bg-red-50 border-b">
            <CardTitle className="flex items-center text-red-800">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Error
            </CardTitle>
            <CardDescription className="text-red-700">
              No se encontraron los datos necesarios para la verificación
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-gray-700 mb-4">
              Es necesario completar los pasos anteriores para poder continuar con la verificación.
            </p>
            <Button 
              onClick={() => navigate('/seller')}
              className="w-full"
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/seller/register')}
              disabled={isLoading || verifying}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver al registro
            </Button>

            <Card className="w-full shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center text-blue-800">
                  <ShieldCheck className="mr-2 h-5 w-5" />
                  Verificación de Teléfono
                </CardTitle>
                <CardDescription>
                  Ingresa el código enviado a tu teléfono {sellerData.countryCode}{sellerData.phone}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-6">
                  <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-800">
                    <p>
                      Hemos enviado un código de verificación de 6 dígitos a tu teléfono.
                      Por favor revisa tus mensajes e ingresa el código a continuación.
                    </p>
                  </div>

                  <VerificationCodeInput
                    value={verificationCode}
                    onChange={handleInputChange}
                    error={verificationError || error}
                  />

                  <VerificationActions
                    onVerify={handleVerify}
                    onResend={sendCode}
                    onBack={() => navigate('/seller/register')}
                    canVerify={verificationCode.length === 6}
                    canResend={canResend}
                    isLoading={verifying}
                    isSendingSMS={isSendingSMS}
                    countdown={countdown}
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t p-4 bg-gray-50 text-xs text-gray-500 text-center">
                <p>
                  Si no recibes el código después de unos minutos, verifica el número 
                  proporcionado o intenta enviar el código nuevamente.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhone;
