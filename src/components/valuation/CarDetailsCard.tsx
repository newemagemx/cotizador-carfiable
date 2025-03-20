
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CarData } from '@/types/forms';

interface CarDetailsCardProps {
  carData: CarData;
}

const CarDetailsCard: React.FC<CarDetailsCardProps> = ({ carData }) => {
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
      <Card className="mb-6 shadow-md border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle>Tu Vehículo</CardTitle>
          <CardDescription>
            <span className="font-semibold">{carData.brand} {carData.model} {carData.year}</span>
            {carData.version && <span> - {carData.version}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Kilometraje:</span> {carData.mileage} km
            </div>
            <div>
              <span className="text-muted-foreground">Condición:</span> {carData.condition === 'excellent' ? 'Excelente' : carData.condition === 'good' ? 'Buena' : 'Regular'}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CarDetailsCard;
