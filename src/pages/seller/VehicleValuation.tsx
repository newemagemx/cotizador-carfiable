import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form,
  FormProvider
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { VehicleData } from "@/types/seller";

// Import component steps
import VehicleStep1 from './components/VehicleStep1';
import VehicleStep2 from './components/VehicleStep2';
import VehicleStep3 from './components/VehicleStep3';
import StepProgress from './components/StepProgress';

// Import mock data
import { carBrands, carModels, carVersions, mexicanStates, carFeatures } from './data/vehicleData';

// Form schema
const valuationSchema = z.object({
  brand: z.string().min(1, "Selecciona una marca"),
  model: z.string().min(1, "Selecciona un modelo"),
  year: z.string().min(1, "Selecciona un año"),
  version: z.string().min(1, "Selecciona una versión"),
  mileage: z.string().min(1, "Ingresa el kilometraje").refine(
    (val) => !isNaN(Number(val)) && Number(val) >= 0,
    { message: "El kilometraje debe ser un número positivo" }
  ),
  condition: z.enum(["excellent", "good", "fair"], {
    required_error: "Selecciona una condición",
  }),
  location: z.string().min(1, "Selecciona una ubicación"),
  features: z.array(z.string()).optional(),
});

const VehicleValuation: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

  const form = useForm<z.infer<typeof valuationSchema>>({
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

  const onSubmit = (data: z.infer<typeof valuationSchema>) => {
    // Convert form data to VehicleData type
    const vehicleData: VehicleData = {
      brand: carBrands.find(b => b.value === data.brand)?.label || data.brand,
      model: carModels[data.brand as keyof typeof carModels]?.find(m => m.value === data.model)?.label || data.model,
      year: data.year,
      version: carVersions[data.model as keyof typeof carVersions]?.find(v => v.value === data.version)?.label || data.version,
      mileage: Number(data.mileage),
      condition: data.condition,
      location: mexicanStates.find(s => s.value === data.location)?.label || data.location,
      features: data.features?.map(id => 
        carFeatures.find(f => f.id === id)?.label || id
      ) || [],
    };
    
    // Store data in sessionStorage or context/state management
    sessionStorage.setItem('vehicleData', JSON.stringify(vehicleData));
    
    // Navigate to the next step
    navigate('/seller/register');
  };

  // Watch form values for conditional rendering
  const watchBrand = form.watch("brand");
  const watchModel = form.watch("model");

  // Update dependent dropdowns when primary selections change
  useEffect(() => {
    if (watchBrand !== selectedBrand) {
      setSelectedBrand(watchBrand);
      form.setValue("model", "");
      form.setValue("version", "");
    }
  }, [watchBrand, selectedBrand, form]);

  useEffect(() => {
    if (watchModel !== selectedModel) {
      setSelectedModel(watchModel);
      form.setValue("version", "");
    }
  }, [watchModel, selectedModel, form]);

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/seller');
    }
  };

  const handleNext = () => {
    // Basic validation before moving to next step
    if (step === 1) {
      const { brand, model, year, version } = form.getValues();
      if (!brand || !model || !year || !version) {
        form.trigger(["brand", "model", "year", "version"]);
        return;
      }
    } else if (step === 2) {
      const { mileage, condition, location } = form.getValues();
      if (!mileage || !condition || !location) {
        form.trigger(["mileage", "condition", "location"]);
        return;
      }
    }
    setStep(step + 1);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={handleBack}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              {step > 1 ? 'Anterior' : 'Volver'}
            </Button>

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
                <StepProgress currentStep={step} totalSteps={3} />

                <FormProvider {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {renderStepContent()}
                    
                    {step === 3 && (
                      <Button type="submit" className="w-full">
                        Obtener Valoración
                      </Button>
                    )}
                  </form>
                </FormProvider>
              </CardContent>
              <CardFooter className="flex justify-between border-t bg-gray-50 px-6 py-4">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Anterior
                  </Button>
                )}
                {step < 3 && (
                  <Button
                    className="ml-auto"
                    onClick={handleNext}
                  >
                    Siguiente
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleValuation;
