
import React, { useState } from 'react';
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
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Car, ChevronLeft, ChevronRight } from "lucide-react";
import { VehicleData } from "@/types/seller";

// Mock data for dropdowns - in a real app, these would come from an API
const carBrands = [
  { value: "toyota", label: "Toyota" },
  { value: "honda", label: "Honda" },
  { value: "nissan", label: "Nissan" },
  { value: "volkswagen", label: "Volkswagen" },
  { value: "chevrolet", label: "Chevrolet" },
  { value: "ford", label: "Ford" },
  { value: "bmw", label: "BMW" },
  { value: "mercedes", label: "Mercedes-Benz" },
  { value: "audi", label: "Audi" },
];

const carModels = {
  toyota: [
    { value: "corolla", label: "Corolla" },
    { value: "camry", label: "Camry" },
    { value: "rav4", label: "RAV4" },
    { value: "highlander", label: "Highlander" },
    { value: "4runner", label: "4Runner" },
    { value: "sequoia", label: "Sequoia" },
  ],
  honda: [
    { value: "civic", label: "Civic" },
    { value: "accord", label: "Accord" },
    { value: "crv", label: "CR-V" },
    { value: "pilot", label: "Pilot" },
  ],
  // Add models for other brands as needed
};

const years = Array.from({ length: 22 }, (_, i) => {
  const year = 2024 - i;
  return { value: year.toString(), label: year.toString() };
});

const carVersions = {
  corolla: [
    { value: "le", label: "LE" },
    { value: "se", label: "SE" },
    { value: "xle", label: "XLE" },
    { value: "xse", label: "XSE" },
  ],
  civic: [
    { value: "lx", label: "LX" },
    { value: "sport", label: "Sport" },
    { value: "ex", label: "EX" },
    { value: "touring", label: "Touring" },
  ],
  // Add versions for other models as needed
};

const mexicanStates = [
  { value: "cdmx", label: "Ciudad de México" },
  { value: "jalisco", label: "Jalisco" },
  { value: "nuevo_leon", label: "Nuevo León" },
  { value: "estado_mexico", label: "Estado de México" },
  { value: "chihuahua", label: "Chihuahua" },
  { value: "guanajuato", label: "Guanajuato" },
  // Add more Mexican states as needed
];

const carFeatures = [
  { id: "sunroof", label: "Techo solar" },
  { id: "leather", label: "Asientos de piel" },
  { id: "navigation", label: "Sistema de navegación" },
  { id: "bluetooth", label: "Bluetooth" },
  { id: "camera", label: "Cámara de reversa" },
  { id: "sensors", label: "Sensores de estacionamiento" },
  { id: "keyless", label: "Entrada sin llave" },
  { id: "automatic", label: "Transmisión automática" },
  { id: "climate", label: "Control de clima automático" },
  { id: "alloy", label: "Rines de aleación" },
];

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
  React.useEffect(() => {
    if (watchBrand !== selectedBrand) {
      setSelectedBrand(watchBrand);
      form.setValue("model", "");
      form.setValue("version", "");
    }
  }, [watchBrand, selectedBrand, form]);

  React.useEffect(() => {
    if (watchModel !== selectedModel) {
      setSelectedModel(watchModel);
      form.setValue("version", "");
    }
  }, [watchModel, selectedModel, form]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-2xl">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => {
                if (step > 1) {
                  setStep(step - 1);
                } else {
                  navigate('/seller');
                }
              }}
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
                <div className="mb-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Paso {step} de 3</span>
                    <span className="text-sm text-gray-500">{step === 1 ? 'Información Básica' : step === 2 ? 'Condición y Ubicación' : 'Características'}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${(step / 3) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {step === 1 && (
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
                    )}

                    {step === 2 && (
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
                    )}

                    {step === 3 && (
                      <>
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
                                      return (
                                        <FormItem
                                          key={feature.id}
                                          className="flex flex-row items-start space-x-3 space-y-0"
                                        >
                                          <FormControl>
                                            <Checkbox
                                              checked={field.value?.includes(feature.id)}
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
                      </>
                    )}
                    
                    {step === 3 ? (
                      <Button type="submit" className="w-full">
                        Obtener Valoración
                      </Button>
                    ) : null}
                  </form>
                </Form>
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
                    onClick={() => {
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
                    }}
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
