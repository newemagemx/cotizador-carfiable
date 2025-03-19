
import { supabase } from '@/integrations/supabase/client';
import { CarData, UserData } from '@/types/forms';

// Fixed webhook endpoint for testing
const FIXED_WEBHOOK_ENDPOINT = 'https://webhook.site/your-uuid';

// Generate a random 6-digit verification code
export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Check if a phone number has been verified in the last 30 days
export const checkIfPhoneVerified = async (
  phone: string,
  countryCode: string
): Promise<boolean> => {
  try {
    // Normalize the phone number
    const normalizedPhone = phone.replace(/\D/g, '');
    
    // Query the database for the user with the given phone number
    const { data, error } = await supabase
      .from('users')
      .select('last_verified')
      .eq('phone', normalizedPhone)
      .eq('country_code', countryCode)
      .single();
    
    if (error || !data) {
      console.log('User not found or error:', error);
      return false;
    }
    
    // If last_verified is null, the user has never been verified
    if (!data.last_verified) {
      return false;
    }
    
    // Check if the last verification was within the last 30 days
    const lastVerified = new Date(data.last_verified);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    return lastVerified > thirtyDaysAgo;
  } catch (err) {
    console.error('Error checking verification status:', err);
    return false;
  }
};

// Send verification code via SMS
export const sendVerificationCode = async (
  userData: UserData,
  countryCode: string,
  code: string,
  onSuccess: () => void,
  onError: (error: string) => void
): Promise<void> => {
  try {
    // Normalize the phone number
    const phone = userData.phone.replace(/\D/g, '');
    const fullPhone = countryCode + phone;
    
    // Skip actual SMS for test phone numbers
    if (fullPhone === '+521234567890') {
      console.log('Test phone detected, skipping actual SMS send');
      onSuccess();
      return;
    }
    
    // Call the Supabase Edge Function to send the SMS
    const { data, error } = await supabase.functions.invoke('send-verification-sms', {
      method: 'POST',
      body: JSON.stringify({
        phone: fullPhone,
        verificationCode: code,
      }),
    });
    
    if (error) {
      console.error('Error sending verification SMS:', error);
      onError(error.message || 'Failed to send verification code');
      return;
    }
    
    console.log('SMS sent successfully:', data);
    onSuccess();
  } catch (err) {
    console.error('Exception sending verification SMS:', err);
    onError('An unexpected error occurred');
  }
};

export const verifyCodeAndSaveData = async (
  inputCode: string,
  expectedCode: string,
  carData: CarData,
  userData: UserData,
  countryCode: string,
  term: number,
  monthlyPayment: number,
  onVerified: () => void
): Promise<boolean> => {
  // Check if the code matches
  if (inputCode !== expectedCode) {
    console.log("Verification failed: codes don't match", { inputCode, expectedCode });
    return false;
  }

  // The code matches, proceed with saving the data
  try {
    console.log("Verification successful! Saving data...");
    
    // Check if user exists in the database
    const { data: userOperationsResponse } = await supabase.functions.invoke('user-operations', {
      method: 'POST',
      body: JSON.stringify({
        action: 'getUserByPhone',
        phone: userData.phone,
        countryCode: countryCode,
      }),
    });
    
    let userId: string;
    
    if (userOperationsResponse?.data) {
      console.log('User exists, updating last verified timestamp');
      // User exists, update the last_verified timestamp
      userId = userOperationsResponse.data.id;
      
      await supabase.functions.invoke('user-operations', {
        method: 'POST',
        body: JSON.stringify({
          action: 'updateUser',
          id: userId,
          userData: {
            lastVerified: new Date().toISOString(),
          },
        }),
      });
    } else {
      console.log('User does not exist, creating new user record');
      // User doesn't exist, create a new user record
      const { data: newUserResponse } = await supabase.functions.invoke('user-operations', {
        method: 'POST',
        body: JSON.stringify({
          action: 'createUser',
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          countryCode: countryCode,
          role: 'both', // Default role
          lastVerified: new Date().toISOString(),
        }),
      });
      
      if (!newUserResponse?.data) {
        console.error('Failed to create user record');
        return false;
      }
      
      userId = newUserResponse.data.id;
    }
    
    // Save the quotation data (we'll keep this for backward compatibility)
    const { error: quotationError } = await supabase
      .from('quotations')
      .insert({
        user_name: userData.name,
        user_email: userData.email,
        user_phone: countryCode + userData.phone,
        car_brand: carData.brand,
        car_model: carData.model,
        car_year: carData.year,
        car_price: carData.price,
        down_payment_percentage: carData.downPaymentPercentage,
        selected_term: term,
        is_verified: true,
      });
    
    if (quotationError) {
      console.error("Error saving quotation data:", quotationError);
      return false;
    }
    
    // Call the webhook to handle external services notification
    try {
      const webhookUrl = FIXED_WEBHOOK_ENDPOINT || 'https://webhook.site/your-uuid';
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          carData,
          paymentInfo: {
            term,
            monthlyPayment,
            downPayment: Number(carData.price) * (carData.downPaymentPercentage / 100),
          },
          verificationTime: new Date().toISOString(),
        }),
      });
      
      if (!webhookResponse.ok) {
        console.warn('Webhook notification failed:', await webhookResponse.text());
      }
    } catch (err) {
      console.warn('Webhook error (non-fatal):', err);
    }
    
    // Success! Call the onVerified callback with the userId
    setTimeout(() => {
      window.location.href = '/seller/valuation-results?success=true';
      // Navigate to ValuationResults with the user and car data
      localStorage.setItem('valuationData', JSON.stringify({
        userId,
        userData,
        carData
      }));
    }, 500);
    
    return true;
  } catch (error) {
    console.error("Error during verification process:", error);
    return false;
  }
};
