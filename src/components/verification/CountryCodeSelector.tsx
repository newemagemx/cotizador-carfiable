
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

// Country code options
export const COUNTRY_CODES = [
  { label: 'México (+52)', value: '+52' },
  { label: 'USA (+1)', value: '+1' },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({ 
  value, 
  onChange, 
  disabled 
}) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="countryCode">Código de país</Label>
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger id="countryCode" className="w-full">
          <SelectValue placeholder="Selecciona un código de país" />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((code) => (
            <SelectItem key={code.value} value={code.value}>
              {code.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground mt-1">
        Selecciona el código de país correcto antes de reenviar el código
      </p>
    </div>
  );
};

export default CountryCodeSelector;
