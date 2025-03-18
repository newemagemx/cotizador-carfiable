
import { useState, useEffect } from 'react';
import { generateVerificationCode, sendVerificationCode } from '@/components/verification/VerificationService';
import { UserData } from '@/types/forms';
import { getFullPhoneNumber } from '@/utils/phoneUtils';

// Test bypass credentials
const TEST_PHONE = "+521234567890";

interface UseVerificationCodeProps {
  userData: UserData;
  countryCode: string;
}

export const useVerificationCode = ({ userData, countryCode }: UseVerificationCodeProps) => {
  const [verificationCode, setVerificationCode] = useState("");
  const [expectedCode, setExpectedCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isSendingSMS, setIsSendingSMS] = useState(false);

  // Check if using test phone
  const fullPhoneNumber = getFullPhoneNumber(userData.phone, countryCode);
  const isTestPhone = fullPhoneNumber === TEST_PHONE;

  // Handle verification code input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
      setError("");
    }
  };

  // Send verification code
  const sendCode = async () => {
    setIsLoading(true);
    setIsSendingSMS(true);
    setError("");
    
    try {
      // Generate a verification code first
      const code = isTestPhone ? "000000" : generateVerificationCode();
      console.log("Generated verification code:", code);
      setExpectedCode(code);
      
      // Then send it via SMS
      await sendVerificationCode(
        userData,
        countryCode,
        code,
        () => {
          // Start countdown for resend button
          setCountdown(60);
          setCanResend(false);
        },
        () => {
          // Error handling is done in the service
        }
      );
    } catch (err) {
      console.error("Error in sendCode:", err);
    } finally {
      setIsLoading(false);
      setIsSendingSMS(false);
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

  // Initial code sending on mount
  useEffect(() => {
    sendCode();
  }, []);

  return {
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
  };
};
