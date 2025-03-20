import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Car } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import StepProgress from './StepProgress';

interface ValuationLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  showBackButton?: boolean;
  showNextButton?: boolean;
}

const ValuationLayout: React.FC<ValuationLayoutProps> = ({ 
  children, 
  currentStep, 
  totalSteps, 
  onBack,
  onNext,
  showBackButton = true,
  showNextButton = true
}) => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl">
            {showBackButton && (
              <Button
                variant="ghost"
                className="mb-6"
                onClick={onBack}
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                {currentStep > 1 ? 'Anterior' : 'Volver'}
              </Button>
            )}

            <Card className="w-full shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center text-blue-800">
                  <Car className="mr-2 h-5 w-5" />
                  Valoración de tu Vehículo
                </CardTitle>
                <CardDescription>
                  Completa la información para obtener una valoración precisa
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <StepProgress currentStep={currentStep} totalSteps={totalSteps} />
                {children}
              </CardContent>
              {(showBackButton || showNextButton) && (
                <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
                  {showBackButton && currentStep > 1 && (
                    <Button
                      variant="outline"
                      onClick={onBack}
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Anterior
                    </Button>
                  )}
                  {showNextButton && currentStep < totalSteps && (
                    <Button
                      className="ml-auto"
                      onClick={onNext}
                    >
                      Siguiente
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ValuationLayout;
