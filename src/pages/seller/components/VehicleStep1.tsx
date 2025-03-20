
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

// Importing mock data
import { carBrands, carModels, years, carVersions } from "../data/vehicleData";

const VehicleStep1: React.FC = () => {
  const form = useFormContext();
  
  // Watch form values for conditional rendering
  const watchBrand = form.watch("brand");
  const watchModel = form.watch("model");

  return (
    <>
      <FormField
        control={form.control}
        name="brand"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Marca</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona la marca" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {carBrands.map((brand) => (
                  <SelectItem key={brand.value} value={brand.value}>
                    {brand.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!watchBrand}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={!watchBrand ? "Selecciona una marca primero" : "Selecciona el modelo"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {watchBrand && 
                  carModels[watchBrand as keyof typeof carModels]?.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      {model.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
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
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el año" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year.value} value={year.value}>
                    {year.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              disabled={!watchModel}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder={!watchModel ? "Selecciona un modelo primero" : "Selecciona la versión"} />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {watchModel && 
                  carVersions[watchModel as keyof typeof carVersions]?.map((version) => (
                    <SelectItem key={version.value} value={version.value}>
                      {version.label}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default VehicleStep1;
