
import React from 'react';

interface StepProgressProps {
  currentStep: number;
  totalSteps: number;
  stepTitles?: string[];
}

const StepProgress: React.FC<StepProgressProps> = ({ 
  currentStep, 
  totalSteps,
  stepTitles = ['Información Básica', 'Condición y Ubicación', 'Características'] 
}) => {
  return (
    <div className="mb-6">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium">Paso {currentStep} de {totalSteps}</span>
        <span className="text-sm text-gray-500">
          {stepTitles[currentStep - 1] || `Paso ${currentStep}`}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepProgress;
