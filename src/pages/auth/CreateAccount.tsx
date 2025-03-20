
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { UserData } from '@/types/forms';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Lock, Eye, EyeOff, CheckCircle, XCircle, Info } from 'lucide-react';

const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ password?: string, confirm?: string }>({});

  useEffect(() => {
    // Recuperar datos del usuario de sessionStorage o location state
    const storedUserData = sessionStorage.getItem('userData');
    if (storedUserData) {
      try {
        setUserData(JSON.parse(storedUserData));
      } catch (e) {
        console.error('Error parsing userData from sessionStorage', e);
      }
    } else if (location.state?.userData) {
      setUserData(location.state.userData);
    } else {
      // Si no hay datos de usuario, redireccionar al registro
      navigate('/seller/register');
    }
  }, [location, navigate]);

  // Calcular fortaleza de la contraseña
  useEffect(() => {
    if (!password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    
    // Longitud mínima (8 caracteres)
    if (password.length >= 8) {
      strength += 25;
    }
    
    // Contiene al menos una letra mayúscula
    if (/[A-Z]/.test(password)) {
      strength += 25;
    }
    
    // Contiene al menos un número
    if (/\d/.test(password)) {
      strength += 25;
    }
    
    // Contiene al menos un carácter especial
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25;
    }
    
    setPasswordStrength(strength);
  }, [password]);

  const validateForm = () => {
    const newErrors: { password?: string, confirm?: string } = {};
    
    if (password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos una letra mayúscula';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos un número';
    } else if (!/[^A-Za-z0-9]/.test(password)) {
      newErrors.password = 'La contraseña debe contener al menos un carácter especial';
    }
    
    if (password !== confirmPassword) {
      newErrors.confirm = 'Las contraseñas no coinciden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !userData?.email) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Crear usuario con email y contraseña
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            country_code: userData.countryCode || '+52'
          }
        }
      });
      
      if (error) {
        toast({
          title: 'Error al crear cuenta',
          description: error.message,
          variant: 'destructive'
        });
        setIsLoading(false);
        return;
      }
      
      // Actualizar información en sessionStorage
      if (data.user) {
        sessionStorage.setItem('userData', JSON.stringify({
          ...userData,
          id: data.user.id
        }));
      }
      
      toast({
        title: '¡Cuenta creada con éxito!',
        description: 'Ahora puedes continuar con la valoración de tu vehículo.'
      });
      
      // Redireccionar a resultados de valoración
      navigate('/seller/valuation-results', { 
        state: { 
          userData, 
          fromAuth: true,
          success: true
        }
      });
    } catch (error) {
      console.error('Error creating account:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al crear la cuenta. Por favor intenta de nuevo.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 100) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto"
      >
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-center">Crea tu cuenta</CardTitle>
            <CardDescription className="text-center">
              Configura una contraseña segura para tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            {userData && (
              <div className="mb-6 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Nombre:</span> 
                  <span className="font-medium">{userData.name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Email:</span> 
                  <span className="font-medium">{userData.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-muted-foreground">Teléfono:</span> 
                  <span className="font-medium">{userData.countryCode || '+52'} {userData.phone}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`pl-10 pr-10 ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> {errors.password}
                    </p>
                  )}
                  
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span>Fortaleza:</span>
                      <span className={passwordStrength === 100 ? 'text-green-600' : 'text-muted-foreground'}>
                        {passwordStrength === 0 ? 'Débil' : 
                         passwordStrength < 50 ? 'Débil' : 
                         passwordStrength < 100 ? 'Media' : 'Fuerte'}
                      </span>
                    </div>
                    <Progress value={passwordStrength} className={`h-1 ${getStrengthColor()}`} />
                  </div>
                  
                  <div className="mt-2 text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      {password.length >= 8 ? 
                        <CheckCircle className="h-3 w-3 text-green-500" /> : 
                        <Info className="h-3 w-3 text-gray-400" />}
                      <span>Mínimo 8 caracteres</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/[A-Z]/.test(password) ? 
                        <CheckCircle className="h-3 w-3 text-green-500" /> : 
                        <Info className="h-3 w-3 text-gray-400" />}
                      <span>Al menos una mayúscula</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/\d/.test(password) ? 
                        <CheckCircle className="h-3 w-3 text-green-500" /> : 
                        <Info className="h-3 w-3 text-gray-400" />}
                      <span>Al menos un número</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {/[^A-Za-z0-9]/.test(password) ? 
                        <CheckCircle className="h-3 w-3 text-green-500" /> : 
                        <Info className="h-3 w-3 text-gray-400" />}
                      <span>Al menos un carácter especial</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 ${errors.confirm ? 'border-red-500' : ''}`}
                    />
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                  {errors.confirm && (
                    <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                      <XCircle className="h-3 w-3" /> {errors.confirm}
                    </p>
                  )}
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'Creando cuenta...' : 'Crear cuenta'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">
                    O continúa con
                  </span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" type="button" disabled={isLoading}>
                  Google
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="text-xs text-center text-muted-foreground">
            Al crear una cuenta aceptas nuestros <a href="/terms" className="text-primary hover:underline">Términos y Condiciones</a> y <a href="/privacy" className="text-primary hover:underline">Política de Privacidad</a>.
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default CreateAccount;
