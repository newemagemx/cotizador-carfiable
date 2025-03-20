
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
  const displayValue = (value: any) => value ? String(value) : 'No especificado';

  // Map condition values to Spanish text
  const getConditionText = (condition: string | undefined) => {
    switch (condition) {
      case 'excellent':
        return 'Excelente';
      case 'good':
        return 'Buena';
      case 'fair':
        return 'Regular';
      default:
        return 'No especificado';
    }
  };

  // Log the actual carData being received
  console.log("CarDetailsCard received carData:", carData);
  
  // Ensure carData exists and has necessary properties
  const brand = displayValue(carData?.brand);
  const model = displayValue(carData?.model);
  const year = displayValue(carData?.year);
  const version = carData?.version ? carData.version : '';
  const mileage = carData?.mileage !== undefined ? carData.mileage : 'No especificado';
  const condition = getConditionText(carData?.condition);

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
              {brand} {model} {year}
            </span>
            {version && <span> - {version}</span>}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Kilometraje:</span> {mileage !== 'No especificado' ? `${mileage} km` : mileage}
            </div>
            <div>
              <span className="text-muted-foreground">Condición:</span> {condition}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CarDetailsCard;
