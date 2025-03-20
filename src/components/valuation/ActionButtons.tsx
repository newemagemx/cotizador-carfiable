import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface ActionButtonsProps {
  selectedOption: string;
  isLoading: boolean;
  onProceed: () => Promise<void>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ selectedOption, isLoading, onProceed }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

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

  const handleProceed = async () => {
    if (!selectedOption) {
      toast({
        title: "Selecciona una opción",
        description: "Por favor selecciona un rango de precio para continuar.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (onProceed) {
        await onProceed();
      }
      
      // Después de guardar la opción seleccionada, redirigir a la pantalla de decisión
      navigate('/seller/valuation-decision');
    } catch (error) {
      console.error("Error al proceder con la selección:", error);
      toast({
        title: "Error",
        description: "No se pudo procesar tu selección. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div variants={containerVariants} className="flex justify-center mt-6">
      <motion.div variants={itemVariants}>
        <Button 
          onClick={handleProceed} 
          disabled={isLoading || isSubmitting}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Continuar"
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};

export default ActionButtons;
