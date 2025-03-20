
import React from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { User, Mail, Phone } from "lucide-react";
import CountryCodeSelector from '@/components/verification/CountryCodeSelector';
import { UserData } from '@/types/forms';

interface UserFormFieldsProps {
  formData: UserData;
  errors: Partial<Record<keyof UserData, string>>;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePhoneChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCountryCodeChange: (value: string) => void;
  formatPhoneForDisplay: (phone: string) => string;
}

const UserFormFields: React.FC<UserFormFieldsProps> = ({
  formData,
  errors,
  handleInputChange,
  handlePhoneChange,
  handleCountryCodeChange,
  formatPhoneForDisplay
}) => {
  return (
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
              value={formData.countryCode || '+52'}
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
  );
};

export default UserFormFields;
