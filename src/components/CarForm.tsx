import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronRight, Search, RefreshCw } from "lucide-react";
import { CarIcon } from "lucide-react"; // Import as CarIcon to avoid conflict
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarData, CarDetails } from '@/types/forms';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CarFormProps {
  onNext: (data: CarData) => void;
}

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 20 }, (_, i) => currentYear - i);

const brands = [
  "Audi", "BMW", "Chevrolet", "Ford", "Honda", 
  "Hyundai", "Kia", "Mazda", "Mercedes-Benz", 
  "Nissan", "Tesla", "Toyota", "Volkswagen"
];

const models: Record<string, string[]> = {
  "Audi": ["A3", "A4", "A6", "Q3", "Q5", "Q7"],
  "BMW": ["Serie 1", "Serie 3", "Serie 5", "X1", "X3", "X5"],
  "Chevrolet": ["Aveo", "Camaro", "Cruze", "Malibu", "Spark", "Suburban"],
  "Ford": ["EcoSport", "Escape", "Explorer", "F-150", "Fiesta", "Focus", "Mustang"],
  "Honda": ["Accord", "Civic", "CR-V", "HR-V", "Odyssey", "Pilot"],
  "Hyundai": ["Accent", "Elantra", "Kona", "Santa Fe", "Sonata", "Tucson"],
  "Kia": ["Forte", "Optima", "Rio", "Seltos", "Sorento", "Sportage"],
  "Mazda": ["CX-3", "CX-5", "CX-9", "Mazda3", "Mazda6", "MX-5"],
  "Mercedes-Benz": ["Clase A", "Clase C", "Clase E", "GLA", "GLC", "GLE"],
  "Nissan": ["Altima", "Juke", "Kicks", "Sentra", "Versa", "X-Trail"],
  "Tesla": ["Model 3", "Model S", "Model X", "Model Y"],
  "Toyota": ["Camry", "Corolla", "Highlander", "RAV4", "Tacoma", "Yaris"],
  "Volkswagen": ["Golf", "Jetta", "Passat", "Polo", "T-Cross", "Tiguan"]
};

const CarForm: React.FC<CarFormProps> = ({ onNext }) => {
  const [formData, setFormData] = useState<CarData>({
    brand: "",
    model: "",
    year: currentYear.toString(),
    price: "300000",
    downPaymentPercentage: 20
  });

  const [activeTab, setActiveTab] = useState<string>("manual");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [priceFormatted, setPriceFormatted] = useState(formatCurrency(formData.price));
  const [errors, setErrors] = useState<Partial<Record<keyof CarData, string>>>({});
  
  // Car search functionality
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState<CarDetails[]>([]);
  const [selectedCar, setSelectedCar] = useState<CarDetails | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  const handleBrandChange = (value: string) => {
    setFormData({
      ...formData,
      brand: value,
      model: "" // Reset model when brand changes
    });
    setAvailableModels(models[value] || []);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setFormData({
      ...formData,
      price: value
    });
    setPriceFormatted(formatCurrency(value));
  };

  const handleDownPaymentChange = (value: number[]) => {
    setFormData({
      ...formData,
      downPaymentPercentage: value[0]
    });
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Clear selected car when switching to manual tab
    if (value === "manual") {
      setSelectedCar(null);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Error de búsqueda",
        description: "Por favor, ingresa un término de búsqueda",
        variant: "destructive",
      });
      return;
    }

    setIsSearching(true);
    
    try {
      const { data: cars, error } = await supabase
        .from('cars')
        .select('*')
        .or(`brand.ilike.%${searchTerm}%,model.ilike.%${searchTerm}%,title.ilike.%${searchTerm}%`)
        .order('year', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      setSearchResults(cars as CarDetails[]);
      
      if (cars.length === 0) {
        toast({
          title: "Sin resultados",
          description: "No se encontraron autos que coincidan con tu búsqueda",
        });
      }
    } catch (error) {
      console.error('Error searching cars:', error);
      toast({
        title: "Error",
        description: "No se pudieron buscar autos. Inténtalo de nuevo más tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCar = (car: CarDetails) => {
    setSelectedCar(car);
    // Update form data with car details
    setFormData({
      brand: car.brand,
      model: car.model,
      year: car.year,
      price: car.price.replace(/[^0-9]/g, ''),
      downPaymentPercentage: formData.downPaymentPercentage,
      carId: car.id
    });
    setPriceFormatted(formatCurrency(car.price.replace(/[^0-9]/g, '')));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const newErrors: Partial<Record<keyof CarData, string>> = {};
    
    if (activeTab === "manual") {
      if (!formData.brand) newErrors.brand = "Selecciona una marca";
      if (!formData.model) newErrors.model = "Selecciona un modelo";
      if (!formData.year) newErrors.year = "Selecciona un año";
    } else if (activeTab === "search" && !selectedCar) {
      newErrors.brand = "Selecciona un auto de los resultados de búsqueda";
    }
    
    if (!formData.price || parseInt(formData.price) < 50000) {
      newErrors.price = "El precio debe ser mayor a $50,000";
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onNext(formData);
    }
  };

  function formatCurrency(value: string): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);
  }

  const downPaymentAmount = parseInt(formData.price) * (formData.downPaymentPercentage / 100);

  return (
    
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <Card className="w-full border bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <Tabs defaultValue="manual" value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="manual">Ingreso manual</TabsTrigger>
              <TabsTrigger value="search">Buscar auto</TabsTrigger>
            </TabsList>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <TabsContent value="manual" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="brand">Marca</Label>
                  <Select 
                    value={formData.brand} 
                    onValueChange={handleBrandChange}
                  >
                    <SelectTrigger id="brand" className={errors.brand ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona una marca" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.brand && (
                    <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Modelo</Label>
                  <Select 
                    value={formData.model} 
                    onValueChange={(value) => setFormData({...formData, model: value})}
                    disabled={!formData.brand}
                  >
                    <SelectTrigger id="model" className={errors.model ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableModels.map((model) => (
                        <SelectItem key={model} value={model}>{model}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.model && (
                    <p className="text-red-500 text-sm mt-1">{errors.model}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="year">Año</Label>
                  <Select 
                    value={formData.year} 
                    onValueChange={(value) => setFormData({...formData, year: value})}
                  >
                    <SelectTrigger id="year" className={errors.year ? 'border-red-500' : ''}>
                      <SelectValue placeholder="Selecciona un año" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearOptions.map((year) => (
                        <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.year && (
                    <p className="text-red-500 text-sm mt-1">{errors.year}</p>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="search" className="space-y-4">
                <div className="flex space-x-2">
                  <div className="flex-1">
                    <Input 
                      type="text" 
                      placeholder="Buscar por marca, modelo o título" 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={handleSearch}
                    disabled={isSearching}
                  >
                    {isSearching ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  </Button>
                </div>
                
                {errors.brand && activeTab === "search" && (
                  <p className="text-red-500 text-sm mt-1">{errors.brand}</p>
                )}
                
                <div className="max-h-60 overflow-y-auto border rounded-md">
                  {searchResults.length > 0 ? (
                    <div className="divide-y">
                      {searchResults.map((car) => (
                        <div 
                          key={car.id} 
                          className={`p-3 flex items-center cursor-pointer hover:bg-muted ${selectedCar?.id === car.id ? 'bg-primary/10' : ''}`}
                          onClick={() => handleSelectCar(car)}
                        >
                          <div className="w-16 h-16 mr-3 flex-shrink-0">
                            {car.image_url ? (
                              <img 
                                src={car.image_url} 
                                alt={car.title} 
                                className="w-full h-full object-cover rounded-md"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center rounded-md">
                                <CarIcon className="w-8 h-8 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{car.brand} {car.model} {car.version}</p>
                            <p className="text-xs text-muted-foreground">{car.year} - {car.registration_type}</p>
                            <p className="text-sm font-semibold">{car.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      {isSearching ? (
                        <p>Buscando autos...</p>
                      ) : (
                        <p>Busca autos por marca, modelo o título</p>
                      )}
                    </div>
                  )}
                </div>
                
                {selectedCar && (
                  <div className="mt-4 p-4 border rounded-md bg-muted/30">
                    <h4 className="font-medium">{selectedCar.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedCar.brand} {selectedCar.model} {selectedCar.version} - {selectedCar.year}
                    </p>
                  </div>
                )}
              </TabsContent>
              
              <div className="space-y-2">
                <Label htmlFor="price">Precio del auto</Label>
                <Input
                  id="price"
                  type="text"
                  value={priceFormatted}
                  onChange={handlePriceChange}
                  className={errors.price ? 'border-red-500' : ''}
                  disabled={activeTab === "search" && !!selectedCar}
                />
                {errors.price && (
                  <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between">
                  <Label htmlFor="downPayment">Enganche ({formData.downPaymentPercentage}%)</Label>
                  <span className="text-sm font-medium">
                    {formatCurrency(downPaymentAmount.toString())}
                  </span>
                </div>
                <Slider
                  id="downPayment"
                  min={10}
                  max={50}
                  step={5}
                  value={[formData.downPaymentPercentage]}
                  onValueChange={handleDownPaymentChange}
                  className="py-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>10%</span>
                  <span>50%</span>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full group"
              >
                Continuar
                <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </form>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default CarForm;
