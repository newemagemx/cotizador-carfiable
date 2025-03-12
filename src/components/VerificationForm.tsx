
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CarData, UserData } from '@/types/forms';
import { supabase } from "@/integrations/supabase/client";

interface VerificationFormProps {
  onVerified: () => void;
  onBack: () => void;
  carData: CarData;
  userData: UserData;
}

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
  
  const { toast } = useToast();

  // Generate a random 6-digit code
  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Simulate sending verification code
  const sendVerificationCode = () => {
    setIsLoading(true);
    setError("");
    const code = generateCode();
    setExpectedCode(code);
    
    // Simulate API call to send SMS/email
    setTimeout(() => {
      setIsLoading(false);
      console.log("Verification code sent:", code);
      toast({
        title: "Código enviado",
        description: `Se ha enviado un código de verificación a ${userData.email}`,
      });
      // For demo purposes, we'll display the code in the console
      // In a real app, this would be sent via SMS or email
      toast({
        title: "Demo mode",
        description: `Código para uso en demo: ${code}`,
        variant: "destructive",
      });
      
      // Start countdown for resend button
      setCountdown(60);
      setCanResend(false);
    }, 1500);
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
              user_phone: userData.phone,
              verification_code: verificationCode,
              is_verified: true
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
              <h3 className="text-xl font-semibold tracking-tight">Verificación</h3>
              <p className="text-sm text-muted-foreground">
                Te hemos enviado un código de verificación a <span className="font-medium">{userData.email}</span>
              </p>
            </div>

            <div className="space-y-4">
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
                  disabled={!canResend || isLoading}
                  className="text-sm"
                >
                  {canResend ? 'Reenviar código' : `Reenviar en ${countdown}s`}
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
