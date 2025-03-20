
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { useFormContext } from "react-hook-form";
import { ValuationFormValues } from '../utils/vehicleValuationSchema';

// Importing mock data
import { carFeatures } from "../data/vehicleData";

/**
 * Third step of the vehicle valuation form
 * Collects optional vehicle features
 */
const VehicleStep3: React.FC = () => {
  const form = useFormContext<ValuationFormValues>();
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="features"
        render={() => (
          <FormItem>
            <div className="mb-4">
              <FormLabel>Características del vehículo</FormLabel>
              <p className="text-sm text-gray-500">
                Selecciona las características que tiene tu vehículo
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {carFeatures.map((feature) => (
                <FormField
                  key={feature.id}
                  control={form.control}
                  name="features"
                  render={({ field }) => {
                    // Check if the current feature is selected
                    const isSelected = field.value?.includes(feature.id);
                    
                    return (
                      <FormItem
                        key={feature.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              const currentValue = field.value || [];
                              return checked
                                ? field.onChange([...currentValue, feature.id])
                                : field.onChange(
                                    currentValue.filter(
                                      (value) => value !== feature.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          {feature.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleStep3;
