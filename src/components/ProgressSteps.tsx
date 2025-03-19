
import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

interface ProgressStepsProps {
  currentStep: number;
  steps?: string[];
}

const ProgressSteps: React.FC<ProgressStepsProps> = ({ 
  currentStep, 
  steps = ['Información', 'Verificación', 'Resultados'] 
}) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-1">
        {steps.map((step, index) => {
          const isActive = currentStep >= index + 1;
          const isComplete = currentStep > index + 1;
          
          return (
            <div key={index} className="flex flex-col items-center">
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300",
                  isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                  isComplete ? "bg-primary text-primary-foreground" : ""
                )}
              >
                {isComplete ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span 
                className={cn(
                  "text-xs mt-1.5 hidden sm:block",
                  isActive ? "text-foreground font-medium" : "text-muted-foreground"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
      
      <div className="w-full bg-muted h-1 rounded-full mt-2 mb-8 relative">
        <div 
          className="absolute top-0 left-0 h-1 bg-primary rounded-full step-progress"
          style={{ 
            width: `${(100 * (currentStep - 1)) / (steps.length - 1)}%` 
          }} 
        />
      </div>
    </div>
  );
};

export default ProgressSteps;
