
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroupItem } from '@/components/ui/radio-group';
import { Check, Clock, Sparkles, Scale, Rocket, Trophy, Medal, ShieldCheck, Zap } from 'lucide-react';
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
          icon: <Rocket className="h-4 w-4 mr-1" />,
          secondaryIcon: <Zap className="h-6 w-6" />,
          colorClasses: {
            badge: 'bg-orange-100 text-orange-800 border-orange-200',
            border: 'border-orange-500',
            bg: 'bg-orange-50',
            checkIcon: 'text-orange-500',
            iconBg: 'bg-orange-100'
          },
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
          icon: <Scale className="h-4 w-4 mr-1" />,
          secondaryIcon: <ShieldCheck className="h-6 w-6" />,
          colorClasses: {
            badge: 'bg-blue-100 text-blue-800 border-blue-200',
            border: 'border-blue-500',
            bg: 'bg-blue-50',
            checkIcon: 'text-blue-500',
            iconBg: 'bg-blue-100'
          },
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
          icon: <Sparkles className="h-4 w-4 mr-1" />,
          secondaryIcon: <Trophy className="h-6 w-6" />,
          colorClasses: {
            badge: 'bg-purple-100 text-purple-800 border-purple-200',
            border: 'border-purple-500',
            bg: 'bg-purple-50',
            checkIcon: 'text-purple-500',
            iconBg: 'bg-purple-100'
          },
          features: [
            'Precio máximo del mercado',
            'Marketing premium',
            'Atención personalizada'
          ]
        };
    }
  };

  const details = getOptionDetails();

  return (
    <div className="relative">
      <Label
        htmlFor={type}
        className="cursor-pointer block h-full"
      >
        <div 
          className={cn(
            "rounded-lg border-2 p-4 transition-all h-full",
            isSelected ? 
              `${details?.colorClasses.border} ${details?.colorClasses.bg}` : 
              'border-gray-200 hover:border-gray-300'
          )}
        >
          <div className="flex justify-between items-center">
            <div className="mb-2">
              <Badge variant="outline" className={details?.colorClasses.badge}>
                {details?.icon} {details?.title}
              </Badge>
            </div>
            <div className={cn(
              "rounded-full p-2",
              details?.colorClasses.iconBg,
              "transition-opacity",
              isSelected ? "opacity-100" : "opacity-50"
            )}>
              {details?.secondaryIcon}
            </div>
          </div>
          
          <div
            className="text-xl font-bold block mb-1"
          >
            {formatCurrency(price, currency)}
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {details?.description}
          </p>
          <ul className="text-xs space-y-1 text-gray-600">
            {details?.features.map((feature, index) => (
              <li key={index} className="flex items-center">
                <Check className={cn("h-3 w-3 mr-1", details?.colorClasses.checkIcon)} /> 
                {feature}
              </li>
            ))}
          </ul>
          
          {/* Hidden radio that gets checked when the card is clicked */}
          <div className="absolute top-4 left-4 opacity-0">
            <RadioGroupItem
              value={type}
              id={type}
            />
          </div>
        </div>
      </Label>
    </div>
  );
};

export default PricingOption;
