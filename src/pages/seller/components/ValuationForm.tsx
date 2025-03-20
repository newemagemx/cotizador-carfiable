
import React from 'react';
import { useFormContext } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { 
  FormProvider,
} from "@/components/ui/form";
import { ValuationFormValues } from '../utils/vehicleValuationSchema';

interface ValuationFormProps {
  children: React.ReactNode;
  onSubmit: (data: ValuationFormValues) => void;
  step: number;
  totalSteps: number;
  onNext?: () => void;
}

const ValuationForm: React.FC<ValuationFormProps> = ({ 
  children, 
  onSubmit, 
  step, 
  totalSteps,
  onNext 
}) => {
  const form = useFormContext<ValuationFormValues>();

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {children}
      
      {step === totalSteps ? (
        <Button type="submit" className="w-full">
          Obtener Valoración
        </Button>
      ) : (
        <Button
          type="button"
          className="w-full"
          onClick={onNext}
        >
          Siguiente
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </form>
  );
};

export default ValuationForm;
