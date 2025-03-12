
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CarData, UserData } from '@/types/forms';
import { formatPhoneDisplay } from '@/utils/phoneUtils';
import { verifyCodeAndSaveData } from '@/components/verification/VerificationService';
import { useVerificationCode } from '@/hooks/useVerificationCode';
import CountryCodeSelector, { COUNTRY_CODES } from '@/components/verification/CountryCodeSelector';
import VerificationCodeInput from '@/components/verification/VerificationCodeInput';
import VerificationActions from '@/components/verification/VerificationActions';

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
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value); // Default to Mexico
  const { toast } = useToast();
  
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
    userData,
    countryCode
  });

  const handleVerify = async () => {
    setIsLoading(true);
    setError("");
    
    // Simulate verification process with a delay
    setTimeout(async () => {
      const success = await verifyCodeAndSaveData(
        verificationCode,
        expectedCode,
        carData,
        userData,
        countryCode,
        onVerified
      );
      
      if (!success) {
        setError("El código ingresado no es válido. Inténtalo nuevamente.");
        setIsLoading(false);
      }
    }, 1000);
  };

  const handleResend = () => {
    if (canResend) {
      sendCode();
    }
  };

  const handleCountryCodeChange = (value: string) => {
    setCountryCode(value);
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
                Te hemos enviado un código de verificación por SMS a <span className="font-medium">{formatPhoneDisplay(userData.phone, countryCode)}</span>
              </p>
            </div>

            <div className="space-y-4">
              {/* Country Code Selector */}
              <CountryCodeSelector 
                value={countryCode}
                onChange={handleCountryCodeChange}
                disabled={isLoading || isSendingSMS}
              />
              
              {/* Verification Code Input */}
              <VerificationCodeInput
                value={verificationCode}
                onChange={handleInputChange}
                error={error}
              />
              
              {/* Action Buttons */}
              <VerificationActions
                onVerify={handleVerify}
                onResend={handleResend}
                onBack={onBack}
                canVerify={verificationCode.length === 6}
                canResend={canResend}
                isLoading={isLoading}
                isSendingSMS={isSendingSMS}
                countdown={countdown}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default VerificationForm;
