import { supabase } from '@/integrations/supabase/client';
import { CarData, UserData } from '@/types/forms';

// Get webhook endpoint from environment or use default test endpoint
const FIXED_WEBHOOK_ENDPOINT = "https://webhook-test.com/c9f525259444e849009b37884b2d0885";

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
    
    // For development/testing purposes, we'll simulate successful SMS send
    // In production, uncomment the Supabase Edge Function call
    console.log('Simulating SMS send to:', fullPhone, 'with code:', code);
    
    // Simulated successful SMS send
    setTimeout(() => {
      console.log('SMS sent successfully (simulated)');
      onSuccess();
    }, 1000);
    
    // In production, use the Edge Function:
    /*
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
    */
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
    
    // For testing/development, we'll create user data directly in the database
    // This bypasses the edge function which might not be available in all environments
    let userId: string;
    let isNewUser = false;
    
    // Check if user exists
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('phone', userData.phone)
      .eq('country_code', countryCode)
      .single();
    
    if (userError || !existingUser) {
      console.log('User does not exist, creating new user record');
      
      // Create a new user directly in the database
      const { data: newUser, error: createError } = await supabase
        .from('users')
        .insert({
          name: userData.name,
          email: userData.email,
          phone: userData.phone,
          country_code: countryCode,
          role: 'both',
          last_verified: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError || !newUser) {
        console.error('Failed to create user record:', createError);
        return false;
      }
      
      userId = newUser.id;
      isNewUser = true;
    } else {
      console.log('User exists, updating last verified timestamp');
      
      // Update existing user
      const { error: updateError } = await supabase
        .from('users')
        .update({
          last_verified: new Date().toISOString()
        })
        .eq('id', existingUser.id);
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        return false;
      }
      
      userId = existingUser.id;
    }
    
    // Save the quotation data
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
      const webhookUrl = FIXED_WEBHOOK_ENDPOINT;
      
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
    
    // Store the complete user data in sessionStorage
    sessionStorage.setItem('userData', JSON.stringify({
      ...userData,
      id: userId,
      lastVerified: new Date().toISOString()
    }));
    
    // Store car data
    if (carData) {
      sessionStorage.setItem('carData', JSON.stringify(carData));
    }
    
    // Store valuation data
    localStorage.setItem('valuationData', JSON.stringify({
      userId,
      userData,
      carData
    }));
    
    // Success! Now determine where to navigate based on user status and session
    setTimeout(() => {
      if (isNewUser) {
        // If this is a new user or no Supabase session exists, go to password setup
        supabase.auth.getSession().then(({ data }) => {
          if (!data.session) {
            // Navigate to password setup
            window.location.href = '/auth/password-setup';
          } else {
            // User already has a session, go to results
            window.location.href = '/seller/valuation-results?success=true';
          }
        });
      } else {
        // Existing user, go directly to results
        window.location.href = '/seller/valuation-results?success=true';
      }
      
      // Call the onVerified callback
      onVerified();
    }, 500);
    
    return true;
  } catch (error) {
    console.error("Error during verification process:", error);
    return false;
  }
};
