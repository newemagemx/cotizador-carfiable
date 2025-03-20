
import { z } from "zod";

// Form validation schema
export const valuationSchema = z.object({
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

export type ValuationFormValues = z.infer<typeof valuationSchema>;

// Export condition labels for consistency
export const conditionOptions = [
  { value: "excellent", label: "Excelente" },
  { value: "good", label: "Bueno" },
  { value: "fair", label: "Regular" },
];
