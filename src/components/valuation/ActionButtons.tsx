
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Share2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  // Create a handler that prevents multiple clicks
  const handleProceed = async () => {
    // Evitar múltiples clics o procesar durante carga
    if (isLoading || isSubmitting) {
      console.log("ActionButtons: Evitando múltiples envíos - isLoading:", isLoading, "isSubmitting:", isSubmitting);
      return;
    }
    
    try {
      setIsSubmitting(true);
      console.log("ActionButtons: Iniciando proceso de continuar con precio", getSelectedLabel());
      await onProceed();
    } catch (error) {
      console.error("ActionButtons: Error al procesar:", error);
      toast({
        title: "Error al procesar",
        description: "No se pudo procesar tu solicitud. Por favor intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Combinar estados para saber si está procesando
  const isProcessing = isLoading || isSubmitting;

  const handleShare = () => {
    toast({
      title: "Función en desarrollo",
      description: "La función de compartir estará disponible próximamente.",
    });
  };

  return (
    <motion.div variants={itemVariants} className="flex flex-col space-y-4">
      <Button
        onClick={handleProceed}
        className="w-full py-6 text-lg"
        disabled={isProcessing}
      >
        {isProcessing ? (
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
        disabled={isProcessing}
        onClick={handleShare}
      >
        <Share2 className="mr-2 h-4 w-4" /> Compartir valuación
      </Button>
    </motion.div>
  );
};

export default ActionButtons;
