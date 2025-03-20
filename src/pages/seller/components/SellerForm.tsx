
import React, { useState } from 'react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, Phone } from "lucide-react";
import CountryCodeSelector from "@/components/verification/CountryCodeSelector";

// Form schema for user data
const sellerSchema = z.object({
  name: z.string().min(3, "Nombre completo es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(8, "Número telefónico inválido"),
});

interface SellerFormProps {
  onSubmit: (data: z.infer<typeof sellerSchema>, countryCode: string) => Promise<void>;
  isChecking: boolean;
}

const SellerForm: React.FC<SellerFormProps> = ({ onSubmit, isChecking }) => {
  const [countryCode, setCountryCode] = useState("+52"); // Default to Mexico

  const form = useForm<z.infer<typeof sellerSchema>>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof sellerSchema>) => {
    await onSubmit(data, countryCode);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre Completo</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Ej: Juan Pérez González"
                    {...field}
                    className="pl-10"
                  />
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Correo Electrónico</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="ejemplo@correo.com"
                    {...field}
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <FormLabel htmlFor="phone">Número Telefónico</FormLabel>
          <div className="flex">
            <CountryCodeSelector
              value={countryCode}
              onChange={setCountryCode}
              compact={true}
            />
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type="tel"
                        placeholder="6562762136"
                        {...field}
                        className="rounded-l-none pl-10"
                      />
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Usaremos este número para enviarte un código de verificación
          </p>
        </div>

        <Button type="submit" className="w-full" disabled={isChecking}>
          {isChecking ? "Verificando..." : "Continuar"}
        </Button>
      </form>
    </Form>
  );
};

export default SellerForm;
