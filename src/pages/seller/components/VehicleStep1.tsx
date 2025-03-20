
import React from 'react';
import { 
  FormField, 
  FormItem, 
  FormLabel, 
  FormControl, 
  FormMessage 
} from "@/components/ui/form";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useFormContext } from "react-hook-form";
import { ValuationFormValues } from '../utils/vehicleValuationSchema';

// Importing mock data
import { carBrands, carModels, years, carVersions } from "../data/vehicleData";

/**
 * First step of the vehicle valuation form
 * Collects basic vehicle information (brand, model, year, version)
 */
const VehicleStep1: React.FC = () => {
  const form = useFormContext<ValuationFormValues>();
  
  // Watch form values for conditional rendering
  const watchBrand = form.watch("brand");
  const watchModel = form.watch("model");

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la marca" />
                </SelectTrigger>
                <SelectContent>
                  {carBrands.map((brand) => (
                    <SelectItem key={brand.value} value={brand.value}>
                      {brand.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="model"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Modelo</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!watchBrand}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!watchBrand ? "Selecciona una marca primero" : "Selecciona el modelo"} />
                </SelectTrigger>
                <SelectContent>
                  {watchBrand && 
                    carModels[watchBrand as keyof typeof carModels]?.map((model) => (
                      <SelectItem key={model.value} value={model.value}>
                        {model.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="year"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Año</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el año" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year.value} value={year.value}>
                      {year.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="version"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Versión</FormLabel>
            <FormControl>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={!watchModel}
              >
                <SelectTrigger>
                  <SelectValue placeholder={!watchModel ? "Selecciona un modelo primero" : "Selecciona la versión"} />
                </SelectTrigger>
                <SelectContent>
                  {watchModel && 
                    carVersions[watchModel as keyof typeof carVersions]?.map((version) => (
                      <SelectItem key={version.value} value={version.value}>
                        {version.label}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default VehicleStep1;
