
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
import { User, VehicleData } from "@/types/seller";
import { verifyCodeAndSaveData } from "@/components/verification/VerificationService";

const VerifyPhone: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<User | null>(null);
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [verificationError, setVerificationError] = useState('');
  const [verifying, setVerifying] = useState(false);

  // Load data from sessionStorage
  useEffect(() => {
    const storedUserData = sessionStorage.getItem('userData');
    const storedVehicleData = sessionStorage.getItem('vehicleData');
    
    if (!storedUserData) {
      toast({
        title: "Error",
        description: "No se encontraron los datos de usuario. Por favor vuelve a empezar el proceso.",
        variant: "destructive",
      });
      navigate('/seller');
      return;
    }

    try {
      setUserData(JSON.parse(storedUserData));
      
      if (storedVehicleData) {
        setVehicleData(JSON.parse(storedVehicleData));
      }
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
    userData: userData as any,
    countryCode: userData?.countryCode || '+52'
  });

  // Handle verification code submission
  const handleVerify = async () => {
    if (!verificationCode) {
      setVerificationError('Por favor ingresa el código de verificación');
      return;
    }

    if (!userData) {
      toast({
        title: "Error",
        description: "No se encontraron los datos de usuario. Por favor vuelve a empezar el proceso.",
        variant: "destructive",
      });
      return;
    }

    setVerifying(true);
    setVerificationError('');

    try {
      // Convert to the expected format for the verification service
      const userDataForVerification = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        countryCode: userData.countryCode
      };

      // Create minimal car data if vehicle data isn't available
      const carData = vehicleData ? {
        brand: vehicleData.brand,
        model: vehicleData.model,
        year: vehicleData.year,
        price: '0', // This will be updated after valuation
        downPaymentPercentage: 0, // Not applicable for seller flow
        carId: '', // Will be created later
      } : {
        brand: '',
        model: '',
        year: '',
        price: '0',
        downPaymentPercentage: 0,
        carId: '',
      };

      const success = await verifyCodeAndSaveData(
        verificationCode,
        expectedCode,
        carData,
        userDataForVerification,
        userData.countryCode,
        undefined,
        0,
        () => {
          // Update the userData with verification timestamp
          const updatedUserData = {
            ...userData,
            lastVerified: new Date().toISOString()
          };
          sessionStorage.setItem('userData', JSON.stringify(updatedUserData));
          
          // Navigate to the next page
          if (vehicleData) {
            navigate('/seller/valuation/results'); // Navigate to valuation results if we have vehicle data
          } else {
            navigate('/seller'); // Navigate to seller home if no vehicle data
          }
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

  if (!userData) {
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
                  Ingresa el código enviado a tu teléfono {userData.countryCode}{userData.phone}
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
