
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { UserData } from '@/types/forms';
import { COUNTRY_CODES } from '@/components/verification/CountryCodeSelector';
import UserFormFields from './user/UserFormFields';
import UserFormActions from './user/UserFormActions';
import { validateUserForm, formatPhoneForDisplay } from './user/UserFormValidator';

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationErrors = validateUserForm(formData);
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      onNext(formData);
    }
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
            <UserFormFields 
              formData={formData}
              errors={errors}
              handleInputChange={handleInputChange}
              handlePhoneChange={handlePhoneChange}
              handleCountryCodeChange={handleCountryCodeChange}
              formatPhoneForDisplay={formatPhoneForDisplay}
            />
            <UserFormActions onBack={onBack} />
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserForm;
