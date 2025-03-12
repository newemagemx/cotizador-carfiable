
/**
 * Format phone number display for UI
 */
export const formatPhoneDisplay = (phone: string, code: string): string => {
  if (!phone) return '';
  // Ensure we're working with digits only
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (code === '+52') {
    // Format for Mexico: +52 XXX XXX XXXX
    return `${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
  } else if (code === '+1') {
    // Format for USA: +1 XXX XXX XXXX
    return `${digitsOnly.substring(0, 3)} ${digitsOnly.substring(3, 6)} ${digitsOnly.substring(6)}`;
  }
  
  // Default format
  return digitsOnly;
};

/**
 * Get the full phone number with country code
 */
export const getFullPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove any non-digit characters from the phone
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Combine the country code with the phone number
  return `${countryCode}${digitsOnly}`;
};
