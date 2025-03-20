
import React from 'react';
import { CarData } from '@/types/forms';

interface LoadingStateProps {
  type: 'calculation' | 'loading';
  carData?: CarData | null;
}

const LoadingState: React.FC<LoadingStateProps> = ({ type, carData }) => {
  if (type === 'calculation') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">
            Calculando el valor de tu {carData?.brand} {carData?.model}
          </h2>
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-muted-foreground">
            Estamos analizando miles de datos para brindarte la mejor valoración...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Cargando información...</h2>
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
      </div>
    </div>
  );
};

export default LoadingState;
