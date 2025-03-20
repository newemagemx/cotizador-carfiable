
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserData } from '@/types/forms';
import { motion } from 'framer-motion';

// Form schema for password setup
const passwordSchema = z.object({
  password: z.string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .regex(/[A-Z]/, "Debe incluir al menos una mayúscula")
    .regex(/\d/, "Debe incluir al menos un número")
    .regex(/[!@#$%^&*(),.?":{}|<>]/, "Debe incluir al menos un carácter especial"),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

const PasswordSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false
  });

  useEffect(() => {
    // Get user data from location state or sessionStorage
    const state = location.state as { userData: UserData } | null;
    
    if (state?.userData) {
      setUserData(state.userData);
    } else {
      // Try to get from sessionStorage as fallback
      const storedUserData = sessionStorage.getItem('userData');
      
      if (storedUserData) {
        try {
          setUserData(JSON.parse(storedUserData));
        } catch (e) {
          console.error("Error parsing userData", e);
          navigate('/auth');
        }
      } else {
        // No data available, redirect back to the beginning
        navigate('/auth');
      }
    }
  }, [location, navigate]);

  const form = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Check password strength as user types
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPasswordStrength({
      length: value.length >= 8,
      uppercase: /[A-Z]/.test(value),
      number: /\d/.test(value),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(value)
    });
    form.setValue("password", value);
  };

  const onSubmit = async (data: PasswordFormData) => {
    if (!userData) return;
    
    setIsLoading(true);

    try {
      console.log("Creating user account with email:", userData.email);
      
      // Create user account with Supabase
      const { data: authData, error } = await supabase.auth.signUp({
        email: userData.email,
        password: data.password,
        options: {
          data: {
            full_name: userData.name,
            phone: userData.phone,
            country_code: userData.countryCode || '+52',
          },
          emailRedirectTo: `${window.location.origin}/seller/valuation-results`
        },
      });

      if (error) {
        console.error("Signup error:", error);
        throw error;
      }

      if (authData.user) {
        console.log("User created successfully:", authData.user.id);
        
        toast({
          title: "Cuenta creada exitosamente",
          description: "Tu cuenta ha sido configurada correctamente",
        });

        // Navigate to valuation results or next step
        navigate('/seller/valuation-results');
      } else {
        // This should not happen but just in case
        throw new Error("No se pudo crear la cuenta de usuario");
      }
    } catch (error: any) {
      console.error("Full error details:", error);
      
      // Handle specific error cases
      let errorMessage = "Ocurrió un error al configurar tu cuenta";
      
      if (error.message.includes("Password should be at least") || 
          error.message.includes("contraseña")) {
        errorMessage = "La contraseña no cumple con los requisitos mínimos de seguridad";
      } else if (error.message.includes("User already registered")) {
        errorMessage = "Este correo electrónico ya está registrado";
      } else if (error.message.includes("rate limited")) {
        errorMessage = "Demasiados intentos. Por favor, intenta más tarde";
      }
      
      toast({
        title: "Error al crear la cuenta",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/seller/valuation-results`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Ocurrió un error al iniciar sesión con Google",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="w-full shadow-lg">
                <CardHeader className="bg-blue-50 border-b">
                  <CardTitle className="flex items-center text-blue-800">
                    <Lock className="mr-2 h-5 w-5" />
                    Configura tu Contraseña
                  </CardTitle>
                  <CardDescription>
                    Crea una contraseña segura para tu cuenta
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="password"
                                  {...field}
                                  onChange={handlePasswordChange}
                                  className="pl-10"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Password strength indicator */}
                      <div className="space-y-2 text-sm">
                        <p className="font-medium">Fortaleza de la contraseña:</p>
                        <ul className="space-y-1">
                          <li className="flex items-center">
                            {passwordStrength.length ? 
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : 
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                            Al menos 8 caracteres
                          </li>
                          <li className="flex items-center">
                            {passwordStrength.uppercase ? 
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : 
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                            Al menos una mayúscula
                          </li>
                          <li className="flex items-center">
                            {passwordStrength.number ? 
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : 
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                            Al menos un número
                          </li>
                          <li className="flex items-center">
                            {passwordStrength.special ? 
                              <CheckCircle className="mr-2 h-4 w-4 text-green-500" /> : 
                              <XCircle className="mr-2 h-4 w-4 text-red-500" />}
                            Al menos un carácter especial
                          </li>
                        </ul>
                      </div>

                      <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirmar Contraseña</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input
                                  type="password"
                                  {...field}
                                  className="pl-10"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? "Creando cuenta..." : "Crear cuenta"}
                      </Button>
                    </form>
                  </Form>

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-2 text-gray-500">O continúa con</span>
                    </div>
                  </div>

                  <Button 
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleGoogleSignUp}
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Continuar con Google
                  </Button>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                  <p className="text-xs text-gray-500 text-center w-full">
                    Al crear tu cuenta, aceptas nuestros Términos y Condiciones y 
                    Política de Privacidad para el procesamiento de tus datos.
                  </p>
                </CardFooter>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordSetup;
