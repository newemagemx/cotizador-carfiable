
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Share2 } from 'lucide-react';

interface ActionButtonsProps {
  selectedOption: string;
  isLoading: boolean;
  onProceed: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ 
  selectedOption, 
  isLoading, 
  onProceed 
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

  const getSelectedLabel = () => {
    switch (selectedOption) {
      case 'quick': return 'rápido';
      case 'premium': return 'premium';
      default: return 'equilibrado';
    }
  };

  return (
    <motion.div variants={itemVariants} className="flex flex-col space-y-4">
      <Button
        onClick={onProceed}
        className="w-full py-6 text-lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center">
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            Procesando...
          </span>
        ) : (
          <span className="flex items-center">
            Continuar con precio {getSelectedLabel()} 
            <ArrowRight className="ml-2 h-5 w-5" />
          </span>
        )}
      </Button>

      <Button
        variant="outline"
        className="w-full"
        disabled={isLoading}
      >
        <Share2 className="mr-2 h-4 w-4" /> Compartir valuación
      </Button>
    </motion.div>
  );
};

export default ActionButtons;
