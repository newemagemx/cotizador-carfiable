
// Format phone for display
export const formatPhoneDisplay = (phone: string, countryCode: string): string => {
  // Remove any non-digit characters from the phone
  const digitsOnly = phone.replace(/\D/g, '');
  
  if (digitsOnly.length === 10) {
    // Format like (XXX) XXX-XXXX for 10-digit US/MX numbers
    return `(${digitsOnly.substring(0, 3)}) ${digitsOnly.substring(3, 6)}-${digitsOnly.substring(6)}`;
  } else {
    // Just return the digits grouped in threes
    return digitsOnly.replace(/(\d{3})(?=\d)/g, '$1 ').trim();
  }
};

// Get the full phone number with country code
export const getFullPhoneNumber = (phone: string, countryCode: string): string => {
  // Remove any non-digit characters from the phone
  const digitsOnly = phone.replace(/\D/g, '');
  
  // Combine the country code with the phone number
  return `${countryCode}${digitsOnly}`;
};
