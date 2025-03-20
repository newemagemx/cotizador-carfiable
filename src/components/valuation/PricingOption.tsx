
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Clock, Sparkles } from 'lucide-react';
import { formatCurrency } from '@/utils/shareUtils';
import { cn } from '@/lib/utils';

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
          colorClasses: {
            badge: 'bg-orange-100 text-orange-800 border-orange-200',
            border: 'border-orange-500',
            bg: 'bg-orange-50',
            checkIcon: 'text-orange-500'
          }
        };
      
      case 'balanced':
        return {
          title: 'Equilibrado',
          description: 'Mejor relación entre precio y tiempo de venta (15-30 días).',
          icon: <Check className="h-3 w-3 mr-1" />,
          colorClasses: {
            badge: 'bg-blue-100 text-blue-800 border-blue-200',
            border: 'border-blue-500',
            bg: 'bg-blue-50',
            checkIcon: 'text-blue-500'
          }
        };
      
      case 'premium':
        return {
          title: 'Premium',
          description: 'El mejor precio posible, pero requiere más tiempo (30-45 días).',
          icon: <Sparkles className="h-3 w-3 mr-1" />,
          colorClasses: {
            badge: 'bg-purple-100 text-purple-800 border-purple-200',
            border: 'border-purple-500',
            bg: 'bg-purple-50',
            checkIcon: 'text-purple-500'
          }
        };
    }
  };

  const details = getOptionDetails();

  return (
    <div className={cn(
      "relative rounded-lg border-2", 
      isSelected ? 
        `${details.colorClasses.border} ${details.colorClasses.bg}` : 
        'border-gray-200',
      "p-4 transition-all"
    )}>
      <RadioGroupItem
        value={type}
        id={type}
        className={isSelected ? details.colorClasses.border : ''}
      />
      <div className="mb-2">
        <Badge variant="outline" className={details.colorClasses.badge}>
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
        {getOptionDetails().features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <Check className={cn("h-3 w-3 mr-1", details.colorClasses.checkIcon)} /> 
            {feature}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PricingOption;
