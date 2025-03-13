
import { supabase } from "@/integrations/supabase/client";
import { UserData, CarData } from "@/types/forms";
import { getFullPhoneNumber } from "@/utils/phoneUtils";
import { toast } from "@/hooks/use-toast";
import { sendQuotationToWebhook } from "@/utils/webhookUtils";

// Test bypass credentials
const TEST_PHONE = "+521234567890";
const TEST_CODE = "000000";

export const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Check if a phone has been verified in the last 30 days
 */
export const checkIfPhoneVerified = async (phone: string, countryCode: string): Promise<boolean> => {
  try {
    const fullPhoneNumber = getFullPhoneNumber(phone, countryCode);
    
    // Always return true for test phone
    if (fullPhoneNumber === TEST_PHONE) {
      return true;
    }
    
    // Get the date from 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Check if the phone has been verified in the last 30 days
    const { data, error } = await supabase
      .from('quotations')
      .select('created_at')
      .eq('user_phone', fullPhoneNumber)
      .eq('is_verified', true)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (error) {
      console.error("Error checking phone verification:", error);
      return false;
    }
    
    // If we have data, the phone has been verified in the last 30 days
    return data && data.length > 0;
  } catch (err) {
    console.error("Error during phone verification check:", err);
    return false;
  }
};

export const sendVerificationCode = async (
  userData: UserData,
  countryCode: string,
  code: string,
  onSuccess?: () => void,
  onError?: () => void
): Promise<void> => {
  try {
    // Handle test bypass phone number
    const fullPhoneNumber = getFullPhoneNumber(userData.phone, countryCode);
    if (fullPhoneNumber === TEST_PHONE) {
      console.log("Using test phone number - bypassing SMS sending");
      console.log("Verification code for test:", TEST_CODE);
      toast({
        title: "Modo de prueba detectado",
        description: `Usando teléfono de prueba. Código: ${TEST_CODE}`,
      });
      if (onSuccess) onSuccess();
      return;
    }
    
    console.log("Calling send-verification-sms Edge Function");
    // Call the Edge Function to send SMS
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
      if (onError) onError();
    } else {
      console.log("SMS sent successfully:", data);
      toast({
        title: "Código enviado",
        description: `Se ha enviado un código de verificación a ${fullPhoneNumber}`,
      });
      if (onSuccess) onSuccess();
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
    if (onError) onError();
  }
};

export const verifyCodeAndSaveData = async (
  verificationCode: string, 
  expectedCode: string,
  carData: CarData,
  userData: UserData,
  countryCode: string,
  selectedTerm: number = 36,
  monthlyPayment: number = 0,
  onSuccess: () => void
): Promise<boolean> => {
  // Handle test bypass scenario
  const fullPhoneNumber = getFullPhoneNumber(userData.phone, countryCode);
  if (fullPhoneNumber === TEST_PHONE && verificationCode === TEST_CODE) {
    console.log("Using test credentials - bypassing verification check");
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
          user_phone: fullPhoneNumber,
          verification_code: verificationCode,
          is_verified: true,
          car_id: carData.carId || null,
          selected_term: selectedTerm
        });
        
      if (saveError) {
        console.error("Error saving data:", saveError);
        toast({
          title: "Error",
          description: "No se pudo guardar la cotización",
          variant: "destructive",
        });
        return false;
      } else {
        // Send quotation data to the webhook for N8N processing
        await sendQuotationToWebhook(
          carData, 
          userData, 
          countryCode, 
          verificationCode,
          monthlyPayment,
          selectedTerm
        );
        
        toast({
          title: "Verificación exitosa (Modo prueba)",
          description: "Se ha verificado usando las credenciales de prueba.",
        });
        onSuccess();
        return true;
      }
    } catch (err) {
      console.error("Error during test verification process:", err);
      return false;
    }
  }

  // Regular verification process
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
          user_phone: fullPhoneNumber,
          verification_code: verificationCode,
          is_verified: true,
          car_id: carData.carId || null,
          selected_term: selectedTerm
        });
        
      if (saveError) {
        console.error("Error saving data:", saveError);
        toast({
          title: "Error",
          description: "No se pudo guardar la cotización",
          variant: "destructive",
        });
        return false;
      } else {
        // Send quotation data to the webhook for N8N processing
        await sendQuotationToWebhook(
          carData, 
          userData, 
          countryCode, 
          verificationCode,
          monthlyPayment,
          selectedTerm
        );
        
        toast({
          title: "Verificación exitosa",
          description: "Tu identidad ha sido verificada correctamente.",
        });
        onSuccess();
        return true;
      }
    } catch (err) {
      console.error("Error during verification process:", err);
      return false;
    }
  }
  return false;
};
