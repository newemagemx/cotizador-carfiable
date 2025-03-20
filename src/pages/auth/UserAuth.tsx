
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
import { User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User as UserType } from "@/types/seller";
import LoginForm, { LoginFormData } from './components/LoginForm';
import RegisterForm, { RegisterFormData } from './components/RegisterForm';

type FormMode = 'login' | 'register';

const UserAuth: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<FormMode>('login');

  // Handle login form submission
  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Inicio de sesión exitoso",
        description: "Has iniciado sesión correctamente",
      });

      // Redirect to dashboard or home page
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error de inicio de sesión",
        description: error.message || "Ocurrió un error al iniciar sesión",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle registration form submission
  const onRegisterSubmit = async (data: RegisterFormData, countryCode: string) => {
    setIsLoading(true);

    try {
      // Normalize the phone to keep only digits
      const normalizedPhone = data.phone.replace(/\D/g, '');
      
      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: normalizedPhone,
            country_code: countryCode,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      // If auth was successful, we can proceed to store user data in our custom users table
      if (authData?.user) {
        // Check if the user already exists in our database (by phone and country code)
        const { data: existingUsers, error: queryError } = await supabase
          .from('quotations')  // Use a table that exists in the Supabase schema
          .select('user_phone')
          .eq('user_phone', countryCode + normalizedPhone)
          .limit(1);
        
        if (queryError) {
          console.error("Error checking existing user:", queryError);
        }
        
        // Store custom user data in our database using a custom RPC function or edge function
        // For now, we'll use session storage for the user data
        const userData: UserType = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: normalizedPhone,
          countryCode: countryCode,
          role: 'both',
        };
        
        // Store in sessionStorage for the verification process
        sessionStorage.setItem('userData', JSON.stringify(userData));
        
        // Also store in a separate key for the auth flow specifically
        sessionStorage.setItem('authUserData', JSON.stringify({
          name: data.name,
          email: data.email,
          phone: normalizedPhone,
          countryCode: countryCode
        }));
      }

      toast({
        title: "Registro exitoso",
        description: "Tu cuenta ha sido creada correctamente",
      });

      // Redirect to the correct verification page path with state to indicate it came from auth
      navigate('/seller/verify', { 
        state: { 
          fromAuth: true,
          userData: {
            name: data.name,
            email: data.email,
            phone: normalizedPhone,
            countryCode: countryCode
          }
        } 
      });
    } catch (error: any) {
      toast({
        title: "Error de registro",
        description: error.message || "Ocurrió un error al crear la cuenta",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle between login and registration forms
  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <Card className="w-full shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle className="flex items-center text-blue-800">
                  <User className="mr-2 h-5 w-5" />
                  {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
                </CardTitle>
                <CardDescription>
                  {mode === 'login' 
                    ? 'Ingresa tus credenciales para acceder a tu cuenta' 
                    : 'Completa los siguientes campos para crear tu cuenta'}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {mode === 'login' ? (
                  <LoginForm onSubmit={onLoginSubmit} isLoading={isLoading} />
                ) : (
                  <RegisterForm onSubmit={onRegisterSubmit} isLoading={isLoading} />
                )}
              </CardContent>
              <CardFooter className="flex flex-col border-t px-6 py-4 space-y-4">
                <div className="text-center w-full">
                  <Button
                    variant="link"
                    onClick={toggleMode}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    {mode === 'login' 
                      ? '¿No tienes cuenta? Regístrate aquí' 
                      : '¿Ya tienes cuenta? Inicia sesión'}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 text-center">
                  Al {mode === 'login' ? 'iniciar sesión' : 'registrarte'}, aceptas nuestros Términos y Condiciones y 
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

export default UserAuth;
