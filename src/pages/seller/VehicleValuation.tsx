
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";

// Import hooks and utilities
import { useVehicleForm } from './hooks/useVehicleForm';
import { valuationSchema, ValuationFormValues } from './utils/vehicleValuationSchema';

// Import components
import ValuationLayout from './components/ValuationLayout';
import VehicleStep1 from './components/VehicleStep1';
import VehicleStep2 from './components/VehicleStep2';
import VehicleStep3 from './components/VehicleStep3';
import ValuationForm from './components/ValuationForm';

const VehicleValuation: React.FC = () => {
  const navigate = useNavigate();
  
  // Initialize form with validation schema
  const form = useForm<ValuationFormValues>({
    resolver: zodResolver(valuationSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: "",
      version: "",
      mileage: "",
      condition: "good",
      location: "",
      features: [],
    },
  });

  // Use custom hook for form state and validation
  const { step, handleNext, handleBack, convertFormToVehicleData } = useVehicleForm(form);

  const onSubmit = (data: ValuationFormValues) => {
    // Convert form data to VehicleData type
    const vehicleData = convertFormToVehicleData(data);
    
    // Store data in sessionStorage
    sessionStorage.setItem('vehicleData', JSON.stringify(vehicleData));
    
    // Navigate to the next step
    navigate('/seller/register');
  };

  const handleGoBack = () => {
    if (step > 1) {
      handleBack();
    } else {
      navigate('/seller');
    }
  };

  // Render the current step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <VehicleStep1 />;
      case 2:
        return <VehicleStep2 />;
      case 3:
        return <VehicleStep3 />;
      default:
        return null;
    }
  };

  return (
    <ValuationLayout 
      currentStep={step} 
      totalSteps={3} 
      onBack={handleGoBack} 
      onNext={handleNext}
      showNextButton={false}
    >
      <Form {...form}>
        <ValuationForm
          onSubmit={onSubmit}
          step={step}
          totalSteps={3}
          onNext={handleNext}
        >
          {renderStepContent()}
        </ValuationForm>
      </Form>
    </ValuationLayout>
  );
};

export default VehicleValuation;
