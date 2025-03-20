
import { useState, useEffect } from 'react';
import { UseFormReturn } from "react-hook-form";
import { VehicleData } from "@/types/seller";
import { carBrands, carModels, carVersions, mexicanStates, carFeatures } from '../data/vehicleData';

export function useVehicleForm(form: UseFormReturn<any>) {
  const [step, setStep] = useState(1);
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");

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

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const convertFormToVehicleData = (data: any): VehicleData => {
    return {
      brand: carBrands.find(b => b.value === data.brand)?.label || data.brand,
      model: carModels[data.brand as keyof typeof carModels]?.find(m => m.value === data.model)?.label || data.model,
      year: data.year,
      version: carVersions[data.model as keyof typeof carVersions]?.find(v => v.value === data.version)?.label || data.version,
      mileage: Number(data.mileage),
      condition: data.condition,
      location: mexicanStates.find(s => s.value === data.location)?.label || data.location,
      features: data.features?.map((id: string) => 
        carFeatures.find(f => f.id === id)?.label || id
      ) || [],
    };
  };

  return {
    step,
    setStep,
    handleNext,
    handleBack,
    convertFormToVehicleData
  };
}
