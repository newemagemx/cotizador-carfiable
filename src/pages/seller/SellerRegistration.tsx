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
import { Button } from "@/components/ui/button";
import { ChevronLeft, User } from "lucide-react";
import { User as UserType } from "@/types/seller";
import { checkIfPhoneVerified } from "@/components/verification/VerificationService";
import { COUNTRY_CODES } from "@/components/verification/CountryCodeSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import SellerForm from './components/SellerForm';

const SellerRegistration: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (data: { name: string; email: string; phone: string }, countryCode: string) => {
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
        navigate('/seller/valuation-results');
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
                <SellerForm onSubmit={handleSubmit} isChecking={isChecking} />
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
