
import React from 'react';
import { motion } from 'framer-motion';

const ValuationFooter: React.FC = () => {
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
      <p className="text-center text-sm text-muted-foreground mt-6">
        Esta valuación es una estimación basada en los datos proporcionados y las condiciones actuales del mercado.
        El precio final puede variar según la inspección física del vehículo.
      </p>
    </motion.div>
  );
};

export default ValuationFooter;
