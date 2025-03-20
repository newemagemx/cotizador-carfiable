
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { CarData } from '@/types/forms';
import { Car } from 'lucide-react';

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

  // Make sure we're safely displaying the car data by checking for nulls/undefined
  const displayValue = (value: any) => value || 'No especificado';

  return (
    <motion.div variants={itemVariants}>
      <Card className="mb-6 shadow-md border-blue-100 overflow-hidden">
        <div className="absolute -right-8 -top-8 w-24 h-24 bg-blue-50 rounded-full flex items-end justify-start p-2 opacity-50">
          <Car className="w-8 h-8 text-blue-500" />
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center">
            <span>Tu Vehículo</span>
          </CardTitle>
          <CardDescription>
            <span className="font-semibold">
              {displayValue(carData.brand)} {displayValue(carData.model)} {displayValue(carData.year)}
            </span>
            {carData.version && <span> - {displayValue(carData.version)}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Kilometraje:</span> {displayValue(carData.mileage)} km
            </div>
            <div>
              <span className="text-muted-foreground">Condición:</span> {
                carData.condition === 'excellent' 
                  ? 'Excelente' 
                  : carData.condition === 'good' 
                    ? 'Buena' 
                    : carData.condition === 'fair' 
                      ? 'Regular' 
                      : 'No especificado'
              }
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CarDetailsCard;
