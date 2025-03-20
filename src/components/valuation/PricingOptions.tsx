
import React from 'react';
import { motion } from 'framer-motion';
import { RadioGroup } from '@/components/ui/radio-group';
import PricingOption from './PricingOption';
import { ValuationResponse } from '@/types/seller';

interface PricingOptionsProps {
  valuationData: ValuationResponse;
  selectedOption: string;
  onOptionSelect: (value: string) => void;
}

const PricingOptions: React.FC<PricingOptionsProps> = ({ 
  valuationData, 
  selectedOption, 
  onOptionSelect 
}) => {
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div variants={itemVariants}>
      <RadioGroup
        value={selectedOption}
        onValueChange={onOptionSelect}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
      >
        <PricingOption
          type="quick"
          price={valuationData.quickSellPrice}
          currency={valuationData.currency}
          isSelected={selectedOption === 'quick'}
        />
        
        <PricingOption
          type="balanced"
          price={valuationData.balancedPrice}
          currency={valuationData.currency}
          isSelected={selectedOption === 'balanced'}
        />
        
        <PricingOption
          type="premium"
          price={valuationData.premiumPrice}
          currency={valuationData.currency}
          isSelected={selectedOption === 'premium'}
        />
      </RadioGroup>
    </motion.div>
  );
};

export default PricingOptions;
