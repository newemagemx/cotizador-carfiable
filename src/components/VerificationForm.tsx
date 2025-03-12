
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, RefreshCw, Smartphone } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { CarData, UserData } from '@/types/forms';
import { supabase } from "@/integrations/supabase/client";

interface VerificationFormProps {
  onVerified: () => void;
  onBack: () => void;
  carData: CarData;
  userData: UserData;
}

// Country code options
const COUNTRY_CODES = [
  { label: 'México (+52)', value: '+52' },
  { label: 'USA (+1)', value: '+1' },
];

const VerificationForm: React.FC<VerificationFormProps> = ({ 
  onVerified, 
  onBack,
  carData,
  userData
}) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [expectedCode, setExpectedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value); // Default to Mexico
  
  const { toast } = useToast();

  // Generate a random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Get the full phone number with country code
  const getFullPhoneNumber = () => {
    // Remove any non-digit characters from the phone
    const digitsOnly = userData.phone.replace(/\D/g, '');
    
    // Combine the country code with the phone number
    return `${countryCode}${digitsOnly}`;
  };

  // Send verification code via SMS
  const sendVerificationCode = async () => {
    setIsLoading(true);
    setIsSendingSMS(true);
    setError("");
    const code = generateCode();
    setExpectedCode(code);
    
    try {
      console.log("Calling send-verification-sms Edge Function");
      // Call the Edge Function to send SMS
      const fullPhoneNumber = getFullPhoneNumber();
      console.log(`Sending SMS to: ${fullPhoneNumber}`);
      
      const { data, error } = await supabase.functions.invoke('send-verification-sms', {
        body: {
          phone: fullPhoneNumber,
          verificationCode: code
        }
      });
      
      if (error) {
        console.error("Error sending SMS:", error);
        toast({
          title: "Error",
          description: "No se pudo enviar el SMS. Intenta nuevamente.",
          variant: "destructive",
        });
        // For demo purposes, we'll display the code in the console and as a toast
        console.log("Verification code:", code);
        toast({
          title: "Código de verificación (demo)",
          description: `Código: ${code}`,
        });
      } else {
        console.log("SMS sent successfully:", data);
        toast({
          title: "Código enviado",
          description: `Se ha enviado un código de verificación a ${formatPhoneDisplay(userData.phone, countryCode)}`,
        });
      }
    } catch (err) {
      console.error("Error during SMS sending:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar el SMS",
        variant: "destructive",
      });
      // For demo purposes, we'll display the code in the console and as a toast
      console.log("Verification code:", code);
      toast({
        title: "Código de verificación (demo)",
        description: `Código: ${code}`,
      });
    } finally {
      setIsLoading(false);
      setIsSendingSMS(false);
      
      // Start countdown for resend button
      setCountdown(60);
      setCanResend(false);
    }
  };

  // Handle countdown for resend button
  useEffect(() => {
    if (!canResend && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setCanResend(true);
    }
  }, [countdown, canResend]);

  // Send verification code on component mount
  useEffect(() => {
    sendVerificationCode();
  }, []);

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");
    
    // Simulate verification process
    setTimeout(async () => {
      if (verificationCode === expectedCode) {
        try {
          // Save verification data to Supabase
          const { error: saveError } = await supabase
            .from('quotations')
            .insert({
              car_brand: carData.brand,
              car_model: carData.model,
              car_year: carData.year,
              car_price: carData.price,
              down_payment_percentage: carData.downPaymentPercentage,
              user_name: userData.name,
              user_email: userData.email,
              user_phone: getFullPhoneNumber(),
              verification_code: verificationCode,
              is_verified: true,
              car_id: carData.carId || null
            });
            
          if (saveError) {
            console.error("Error saving data:", saveError);
            toast({
              title: "Error",
              description: "No se pudo guardar la cotización",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Verificación exitosa",
              description: "Tu identidad ha sido verificada correctamente.",
            });
          }
        } catch (err) {
          console.error("Error during verification process:", err);
        }
        
        onVerified();
      } else {
        setError("El código ingresado no es válido. Inténtalo nuevamente.");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleResend = () => {
    if (canResend) {
      sendVerificationCode();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
      setError("");
    }
  };

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
  };

  // Format phone number display for UI
  const formatPhoneDisplay = (phone: string, code = countryCode) => {
    if (!phone) return '';
    // Ensure we're working with digits only
    const digitsOnly = phone.replace(/\D/g, '');
    
    if (code === '+52') {
      // Format for Mexico: +52 XXX XXX XXXX
      return `${code} ${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
    } else if (code === '+1') {
      // Format for USA: +1 XXX XXX XXXX
      return `${code} ${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
    }
    
    // Default format
    return `${code} ${digitsOnly}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <Card className="w-full border bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 mb-2">
                <Smartphone className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold tracking-tight">Verificación</h3>
              <p className="text-sm text-muted-foreground">
                Te hemos enviado un código de verificación por SMS a <span className="font-medium">{formatPhoneDisplay(userData.phone)}</span>
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="countryCode">Código de país</Label>
                <Select 
                  value={countryCode} 
                  onValueChange={handleCountryCodeChange}
                  disabled={isLoading || isSendingSMS}
                >
                  <SelectTrigger id="countryCode" className="w-full">
                    <SelectValue placeholder="Selecciona un código de país" />
                  </SelectTrigger>
                  <SelectContent>
                    {COUNTRY_CODES.map((code) => (
                      <SelectItem key={code.value} value={code.value}>
                        {code.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecciona el código de país correcto antes de reenviar el código
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationCode">Código de verificación</Label>
                <Input
                  id="verificationCode"
                  value={verificationCode}
                  onChange={handleInputChange}
                  placeholder="Ingresa el código de 6 dígitos"
                  maxLength={6}
                  className={error ? 'border-red-500' : ''}
                />
                {error && (
                  <p className="text-red-500 text-sm mt-1">{error}</p>
                )}
              </div>

              <Button 
                type="button" 
                onClick={handleVerify} 
                className="w-full"
                disabled={verificationCode.length !== 6 || isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Verificar código
                  </>
                )}
              </Button>
              
              <div className="flex justify-center">
                <Button 
                  variant="link" 
                  size="sm" 
                  onClick={handleResend} 
                  disabled={!canResend || isLoading || isSendingSMS}
                  className="text-sm"
                >
                  {isSendingSMS ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Enviando...
                    </>
                  ) : canResend ? (
                    'Reenviar código'
                  ) : (
                    `Reenviar en ${countdown}s`
                  )}
                </Button>
              </div>
            </div>

            <Button 
              type="button" 
              variant="outline" 
              onClick={onBack}
              className="w-full"
              disabled={isLoading}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationForm;
