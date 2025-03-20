
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CarData, UserData } from '@/types/forms';
import { Car, Check, ArrowRight, Save, X } from 'lucide-react';

const ValuationDecision: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  // Recuperar datos del state o storage
  const locationState = location.state as { 
    userData: UserData;
    carData: CarData;
    listingId: string;
    priceType: string;
    valuationData: any;
  } | null;

  // Asegurarnos de que tenemos un listingId
  const listingId = locationState?.listingId;

  const handlePublish = async () => {
    setIsUpdating(true);
    try {
      // Si tenemos un ID de listing, actualizamos su estado a "published"
      if (listingId) {
        const { error } = await supabase
          .from('vehicle_listings')
          .update({ status: 'published' })
          .eq('id', listingId);

        if (error) {
          console.error('Error actualizando estado del listing:', error);
          toast({
            title: 'Error',
            description: 'No se pudo actualizar el estado de la publicación',
            variant: 'destructive'
          });
          setIsUpdating(false);
          return;
        }
        
        // Save listingId to localStorage as backup
        if (locationState) {
          localStorage.setItem('valuationData', JSON.stringify({
            ...locationState,
            listingId
          }));
        }
      } else {
        console.error('No se encontró listingId en el state');
        toast({
          title: 'Error',
          description: 'Información de vehículo incompleta',
          variant: 'destructive'
        });
        setIsUpdating(false);
        return;
      }

      toast({
        title: '¡Perfecto!',
        description: 'Vamos a continuar con la publicación de tu vehículo',
      });

      // Navegar a la fase 2 - carga de fotos del vehículo primero
      navigate('/seller/vehicle-photos', { 
        state: { 
          ...locationState,
          listingId
        } 
      });
    } catch (error) {
      console.error('Error en proceso de publicación:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al procesar tu solicitud',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveAndExit = async () => {
    setIsUpdating(true);
    try {
      // Guardar estado pero no cambiar a "published"
      toast({
        title: 'Valoración guardada',
        description: 'Puedes continuar el proceso cuando lo desees desde tu panel',
      });

      // Navegar al dashboard
      navigate('/seller/dashboard');
    } catch (error) {
      console.error('Error guardando proceso:', error);
      toast({
        title: 'Error inesperado',
        description: 'Ocurrió un error al guardar tu progreso',
        variant: 'destructive'
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto my-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>¡Valoración completada!</CardTitle>
            <CardDescription>
              Has completado la valoración inicial de tu vehículo. ¿Qué te gustaría hacer ahora?
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-start gap-3">
                <Car className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-800">Información de tu vehículo</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    {locationState?.carData?.brand} {locationState?.carData?.model} {locationState?.carData?.year}
                    {locationState?.carData?.version ? ` - ${locationState?.carData?.version}` : ''}
                  </p>
                  {locationState?.priceType && (
                    <div className="mt-3 text-sm">
                      <span className="text-blue-700">Opción seleccionada: </span>
                      <span className="font-medium">
                        {locationState.priceType === 'quick' ? 'Venta Rápida' : 
                         locationState.priceType === 'balanced' ? 'Precio Equilibrado' : 
                         'Precio Premium'}
                      </span>
                    </div>
                  )}
                  {listingId && (
                    <div className="mt-1 text-xs text-blue-600">
                      ID: {listingId}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <h3 className="font-medium">Opciones disponibles:</h3>
              <div className="grid gap-3">
                <Button 
                  onClick={handlePublish}
                  disabled={isUpdating || !listingId}
                  className="w-full justify-start gap-3"
                >
                  <ArrowRight className="h-4 w-4" />
                  <div className="flex flex-col items-start text-left">
                    <span>Continuar con el proceso</span>
                    <span className="text-xs font-normal opacity-80">Añadir fotos y detalles del vehículo</span>
                  </div>
                </Button>
                <Button 
                  onClick={handleSaveAndExit}
                  disabled={isUpdating}
                  variant="outline"
                  className="w-full justify-start gap-3"
                >
                  <Save className="h-4 w-4" />
                  <div className="flex flex-col items-start text-left">
                    <span>Guardar y salir</span>
                    <span className="text-xs font-normal opacity-80">Puedes continuar después desde tu panel</span>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center pt-0">
            <p className="text-xs text-muted-foreground text-center">
              Recibirás un correo electrónico con el resumen de tu valoración.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default ValuationDecision;
