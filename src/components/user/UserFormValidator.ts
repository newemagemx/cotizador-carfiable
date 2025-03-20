
import { UserData } from '@/types/forms';

export const validateUserForm = (formData: UserData): Partial<Record<keyof UserData, string>> => {
  const errors: Partial<Record<keyof UserData, string>> = {};
  
  // Name validation
  if (!formData.name.trim()) {
    errors.name = "Ingresa tu nombre completo";
  } else if (formData.name.trim().split(' ').length < 2) {
    errors.name = "Ingresa nombre y apellido";
  }
  
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!formData.email) {
    errors.email = "Ingresa tu correo electrónico";
  } else if (!emailRegex.test(formData.email)) {
    errors.email = "Ingresa un correo electrónico válido";
  }
  
  // Phone validation
  if (!formData.phone) {
    errors.phone = "Ingresa tu número telefónico";
  } else if (formData.phone.length !== 10) {
    errors.phone = "El número debe tener 10 dígitos";
  }
  
  return errors;
};

// Format phone number for display
export const formatPhoneForDisplay = (phone: string): string => {
  if (!phone) return '';
  const match = phone.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
  if (!match) return phone;
  
  return !match[2] ? match[1] 
        : !match[3] ? `${match[1]} ${match[2]}`
        : `${match[1]} ${match[2]} ${match[3]}`;
};
