
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/shareUtils';

interface PricingOptionProps {
  type: 'quick' | 'balanced' | 'premium';
  price: number;
  currency: string;
  isSelected: boolean;
}

const PricingOption: React.FC<PricingOptionProps> = ({ 
  type, 
  price, 
  currency, 
  isSelected 
}) => {
  const getOptionDetails = () => {
    switch (type) {
      case 'quick':
        return {
          title: 'Venta Rápida',
          description: 'Precio más bajo pero con venta garantizada en 7-14 días.',
          icon: <Clock className="h-3 w-3 mr-1" />,
          color: 'orange',
          features: [
            'Proceso acelerado',
            'Menos trámites',
            'Pago inmediato'
          ]
        };
      
      case 'balanced':
        return {
          title: 'Equilibrado',
          description: 'Mejor relación entre precio y tiempo de venta (15-30 días).',
          icon: <Check className="h-3 w-3 mr-1" />,
          color: 'blue',
          features: [
            'Mejor precio que la venta rápida',
            'Tiempo razonable',
            'Mayor exposición'
          ]
        };
      
      case 'premium':
        return {
          title: 'Premium',
          description: 'El mejor precio posible, pero requiere más tiempo (30-45 días).',
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          color: 'purple',
          features: [
            'Precio máximo del mercado',
            'Marketing premium',
            'Atención personalizada'
          ]
        };
    }
  };

  const details = getOptionDetails();
  const color = details.color;

  return (
    <div className={`relative rounded-lg border-2 ${isSelected ? `border-${color}-500 bg-${color}-50` : 'border-gray-200'} p-4 transition-all`}>
      <RadioGroupItem
        value={type}
        id={type}
        className={`absolute right-4 top-4 border-${color}-500`}
      />
      <div className="mb-2">
        <Badge variant="outline" className={`bg-${color}-100 text-${color}-800 border-${color}-200`}>
          {details.icon} {details.title}
        </Badge>
      </div>
      <Label
        htmlFor={type}
        className="text-xl font-bold block mb-1 cursor-pointer"
      >
        {formatCurrency(price, currency)}
      </Label>
      <p className="text-sm text-muted-foreground mb-4">
        {details.description}
      </p>
      <ul className="text-xs space-y-1 text-gray-600">
        {details.features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className={`h-3 w-3 mr-1 text-${color}-500`} /> {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingOption;
