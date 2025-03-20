
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
import { Input } from "@/components/ui/input";
import { useFormContext } from "react-hook-form";

// Importing mock data
import { mexicanStates } from "../data/vehicleData";

const VehicleStep2: React.FC = () => {
  const form = useFormContext();
  
  return (
    <>
      <FormField
        control={form.control}
        name="mileage"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Kilometraje</FormLabel>
            <FormControl>
              <Input
                type="number"
                placeholder="Ej: 45000"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="condition"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estado del vehículo</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="excellent">Excelente</SelectItem>
                <SelectItem value="good">Bueno</SelectItem>
                <SelectItem value="fair">Regular</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="location"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Ubicación</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tu estado" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {mexicanStates.map((state) => (
                  <SelectItem key={state.value} value={state.value}>
                    {state.label}
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

export default VehicleStep2;
