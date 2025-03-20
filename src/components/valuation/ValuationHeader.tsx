
import React from 'react';
import { motion } from 'framer-motion';

interface ValuationHeaderProps {
  carBrand?: string;
  carModel?: string;
  carYear?: string;
}

const ValuationHeader: React.FC<ValuationHeaderProps> = ({ carBrand, carModel, carYear }) => {
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
      <h1 className="text-3xl font-bold text-center mb-2">Resultado de la Valuación</h1>
      <p className="text-center text-muted-foreground mb-8">
        Hemos calculado el valor de tu {carBrand} {carModel} {carYear}.
        Selecciona la opción que mejor se adapte a tus necesidades.
      </p>
    </motion.div>
  );
};

export default ValuationHeader;
