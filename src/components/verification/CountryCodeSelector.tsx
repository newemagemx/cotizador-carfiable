
import React from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Flag } from 'lucide-react';

// Country code options
export const COUNTRY_CODES = [
  { label: 'México (+52)', value: '+52', icon: '🇲🇽' },
  { label: 'USA (+1)', value: '+1', icon: '🇺🇸' },
];

interface CountryCodeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
}

const CountryCodeSelector: React.FC<CountryCodeSelectorProps> = ({ 
  value, 
  onChange, 
  disabled,
  compact = false
}) => {
  // Find the selected country details
  const selectedCountry = COUNTRY_CODES.find(code => code.value === value) || COUNTRY_CODES[0];
  
  if (compact) {
    return (
      <Select 
        value={value} 
        onValueChange={onChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id="countryCode" 
          className="w-[100px] rounded-r-none border-r-0 focus:z-10"
        >
          <div className="flex items-center gap-1">
            <span className="text-base">{selectedCountry.icon}</span>
            <span className="text-sm font-medium">{selectedCountry.value}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((code) => (
            <SelectItem key={code.value} value={code.value}>
              <div className="flex items-center gap-2">
                <span>{code.icon}</span>
                <span>{code.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }
  
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
