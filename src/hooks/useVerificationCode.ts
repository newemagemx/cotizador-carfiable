
import { useState, useEffect } from 'react';
import { generateVerificationCode, sendVerificationCode } from '@/components/verification/VerificationService';
import { UserData } from '@/types/forms';

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
  const isTestPhone = getFullPhoneNumber(userData.phone, countryCode) === TEST_PHONE;

  // Handle verification code input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
      setError("");
    }
  };

  // Get the full phone number with country code
  function getFullPhoneNumber(phone: string, countryCode: string): string {
    // Remove any non-digit characters from the phone
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Combine the country code with the phone number
    return `${countryCode}${digitsOnly}`;
  }

  // Send verification code
  const sendCode = async () => {
    setIsLoading(true);
    setIsSendingSMS(true);
    setError("");
    
    // For test number, use fixed test code
    if (isTestPhone) {
      setExpectedCode("0000");
    } else {
      // Generate a random code for real numbers
      const code = generateVerificationCode();
      setExpectedCode(code);
    }
    
    await sendVerificationCode(
      userData,
      countryCode,
      expectedCode,
      () => {
        // Start countdown for resend button
        setCountdown(60);
        setCanResend(false);
      },
      () => {
        // Error handling is done in the service
      }
    );
    
    setIsLoading(false);
    setIsSendingSMS(false);
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
