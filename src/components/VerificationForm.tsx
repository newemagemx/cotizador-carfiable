import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CarData, UserData } from '@/types/forms';
import { formatPhoneDisplay } from '@/utils/phoneUtils';
import { verifyCodeAndSaveData } from '@/components/verification/VerificationService';
import { useVerificationCode } from '@/hooks/useVerificationCode';
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
  const { toast } = useToast();
  
  // Calculate loan details for webhook usage
  const carPrice = parseInt(carData.price);
  const downPaymentPercentage = carData.downPaymentPercentage;
  const downPaymentAmount = carPrice * (downPaymentPercentage / 100);
  const loanAmount = carPrice - downPaymentAmount;
  const annualInterestRate = 12.99; // Fixed interest rate
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  const defaultTerm = 36; // Default term as 36 months
  
  // Calculate monthly payment
  const calculateMonthlyPayment = (term: number) => {
    const n = term; // Number of months
    const r = monthlyInterestRate; // Monthly interest rate
    
    // Formula: P = L[r(1+r)^n]/[(1+r)^n-1]
    const monthlyPayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    return Math.round(monthlyPayment);
  };
  
  // Pre-calculate monthly payment for default term
  const monthlyPayment = calculateMonthlyPayment(defaultTerm);
  
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
    countryCode: userData.countryCode || '+52' // Use country code from userData or default to +52
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
        userData.countryCode || '+52',
        defaultTerm,
        monthlyPayment,
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
                Te hemos enviado un código de verificación por SMS a <span className="font-medium">{userData.countryCode} {formatPhoneDisplay(userData.phone, userData.countryCode || '+52')}</span>
              </p>
            </div>

            <div className="space-y-4">
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
