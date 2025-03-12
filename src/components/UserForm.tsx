import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft, User, Mail, Phone } from "lucide-react";
import { UserData } from '@/types/forms';
import CountryCodeSelector, { COUNTRY_CODES } from '@/components/verification/CountryCodeSelector';

interface UserFormProps {
  onNext: (data: UserData) => void;
  onBack: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ onNext, onBack }) => {
  const [formData, setFormData] = useState<UserData>({
    name: "",
    email: "",
    phone: "",
    countryCode: COUNTRY_CODES[0].value // Default to Mexico (+52)
  });

  const [errors, setErrors] = useState<Partial<Record<keyof UserData, string>>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 10) value = value.slice(0, 10);
    
    setFormData({
      ...formData,
      phone: value
    });
  };

  const handleCountryCodeChange = (value: string) => {
    setFormData({
      ...formData,
      countryCode: value
    });
  };

  const validateForm = () => {
    const newErrors: Partial<Record<keyof UserData, string>> = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Ingresa tu nombre completo";
    } else if (formData.name.trim().split(' ').length < 2) {
      newErrors.name = "Ingresa nombre y apellido";
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "Ingresa tu correo electrónico";
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Ingresa un correo electrónico válido";
    }
    
    // Phone validation
    if (!formData.phone) {
      newErrors.phone = "Ingresa tu número telefónico";
    } else if (formData.phone.length !== 10) {
      newErrors.phone = "El número debe tener 10 dígitos";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onNext(formData);
    }
  };

  // Format phone number for display
  const formatPhoneForDisplay = (phone: string) => {
    if (!phone) return '';
    const match = phone.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/);
    if (!match) return phone;
    
    return !match[2] ? match[1] 
         : !match[3] ? `${match[1]} ${match[2]}`
         : `${match[1]} ${match[2]} ${match[3]}`;
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
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ej. Juan Pérez García"
                  className={errors.name ? 'border-red-500' : ''}
                  autoComplete="name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Ej. ejemplo@correo.com"
                  className={errors.email ? 'border-red-500' : ''}
                  autoComplete="email"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Teléfono
                </Label>
                <div className="flex">
                  <div className="relative">
                    <CountryCodeSelector 
                      value={formData.countryCode}
                      onChange={handleCountryCodeChange}
                      compact={true}
                    />
                  </div>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    value={formatPhoneForDisplay(formData.phone)}
                    onChange={handlePhoneChange}
                    placeholder="Ej. 555 123 4567"
                    className={`flex-1 ${errors.phone ? 'border-red-500' : ''} rounded-l-none`}
                    autoComplete="tel"
                  />
                </div>
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>

            <div className="flex space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onBack}
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button 
                type="submit" 
                className="flex-1 group"
              >
                Continuar
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserForm;
