
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VerificationCodeInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const VerificationCodeInput: React.FC<VerificationCodeInputProps> = ({
  value,
  onChange,
  error
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="verificationCode">Código de verificación</Label>
      <Input
        id="verificationCode"
        value={value}
        onChange={onChange}
        placeholder="Ingresa el código de 6 dígitos"
        maxLength={6}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </div>
  );
};

export default VerificationCodeInput;
