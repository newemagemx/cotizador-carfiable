
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, User, Mail, Phone } from "lucide-react";
import { User as UserType } from "@/types/seller";
import { checkIfPhoneVerified } from "@/components/verification/VerificationService";
import CountryCodeSelector, { COUNTRY_CODES } from "@/components/verification/CountryCodeSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Form schema for user data
const sellerSchema = z.object({
  name: z.string().min(3, "Nombre completo es requerido"),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(8, "Número telefónico inválido"),
});

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);
  const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].value);

  const form = useForm<z.infer<typeof sellerSchema>>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof sellerSchema>) => {
    setIsChecking(true);

    try {
      // Check if phone has been verified in the last 30 days
      const isVerified = await checkIfPhoneVerified(data.phone, countryCode);
      
      // Normalize the phone to keep only digits
      const normalizedPhone = data.phone.replace(/\D/g, '');
      
      // Check if the user already exists in our database
      const { data: existingUsers, error: queryError } = await supabase
        .from('users')
        .select('id')
        .eq('phone', normalizedPhone)
        .eq('country_code', countryCode)
        .limit(1);
      
      if (queryError) {
        console.error("Error checking existing user:", queryError);
        toast({
          title: "Error",
          description: "No se pudo verificar si el usuario ya existe",
          variant: "destructive",
        });
        setIsChecking(false);
        return;
      }
      
      let userId;
      
      // If user doesn't exist, create a new one
      if (!existingUsers || existingUsers.length === 0) {
        // Create a new user
        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert({
            name: data.name,
            email: data.email,
            phone: normalizedPhone,
            country_code: countryCode,
            role: 'seller',
            last_verified: isVerified ? new Date().toISOString() : null
          })
          .select('id')
          .single();
          
        if (insertError) {
          console.error("Error creating user:", insertError);
          toast({
            title: "Error",
            description: "No se pudo crear el usuario",
            variant: "destructive",
          });
          setIsChecking(false);
          return;
        }
        
        userId = newUser.id;
      } else {
        // Use existing user
        userId = existingUsers[0].id;
        
        // Update user data
        const { error: updateError } = await supabase
          .from('users')
          .update({
            name: data.name,
            email: data.email,
            role: 'seller',
            last_verified: isVerified ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
          
        if (updateError) {
          console.error("Error updating user:", updateError);
          toast({
            title: "Error",
            description: "No se pudo actualizar los datos del usuario",
            variant: "destructive",
          });
          setIsChecking(false);
          return;
        }
      }
      
      // Create the user data object
      const userData: UserType = {
        id: userId,
        name: data.name,
        email: data.email,
        phone: normalizedPhone,
        countryCode: countryCode,
        role: 'seller',
        lastVerified: isVerified ? new Date().toISOString() : undefined,
      };
      
      // Save the user data to session storage
      sessionStorage.setItem('userData', JSON.stringify(userData));
      
      if (isVerified) {
        // If the phone is already verified, skip verification step
        navigate('/seller/valuation/results'); // This page doesn't exist yet, we'll create it later
      } else {
        // Phone needs verification
        navigate('/seller/verify');
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast({
        title: "Error",
        description: "Ocurrió un error durante el registro",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <Button
              variant="ghost"
              className="mb-6"
              onClick={() => navigate('/seller/valuation')}
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Volver a la valoración
            </Button>

            <Card className="w-full shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center text-blue-800">
                  <User className="mr-2 h-5 w-5" />
                  Registro de Vendedor
                </CardTitle>
                <CardDescription>
                  Ingresa tus datos para continuar con la valoración
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              </CardContent>
              <CardFooter className="flex justify-center border-t px-6 py-4">
                <p className="text-xs text-gray-500 text-center">
                  Al continuar, aceptas nuestros Términos y Condiciones y 
                  Política de Privacidad para el procesamiento de tus datos.
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerRegistration;
