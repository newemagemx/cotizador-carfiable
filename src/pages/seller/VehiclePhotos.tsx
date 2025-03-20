
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from "sonner";
import { v4 as uuidv4 } from 'uuid';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Dropzone, FileWithPreview } from '@/components/ui/dropzone';
import { supabase } from '@/integrations/supabase/client';
import { Camera, Info, ArrowRight, Loader2 } from 'lucide-react';

const VehiclePhotos: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Recuperar datos del state o storage
  const locationState = location.state as { 
    userData: any;
    carData: any;
    listingId: string;
    priceType: string;
    valuationData: any;
  } | null;
  
  const handleDrop = (acceptedFiles: FileWithPreview[]) => {
    // Check if adding new files would exceed the limit
    if (files.length + acceptedFiles.length > 10) {
      toast.error("Solo puedes subir un máximo de 10 fotos");
      // If so, only add files up to the limit
      const remainingSlots = 10 - files.length;
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);
      setFiles((prev) => [...prev, ...filesToAdd]);
    } else {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    }
  };
  
  const handleRemove = (file: FileWithPreview) => {
    setFiles((prev) => prev.filter((f) => f !== file));
  };
  
  const handleSkip = () => {
    // Navigate to the next step without uploading photos
    toast.info("Has saltado la carga de fotos", {
      description: "Podrás añadirlas más tarde desde tu panel."
    });
    navigate('/seller/vehicle-details', { 
      state: { 
        ...locationState,
        photos: [] 
      } 
    });
  };
  
  const handleUpload = async () => {
    if (!locationState?.listingId || files.length === 0) {
      if (files.length === 0) {
        toast.error("Por favor, sube al menos una foto de tu vehículo");
      }
      return;
    }
    
    setIsUploading(true);
    setProgress(0);
    
    try {
      const totalFiles = files.length;
      const uploadedPhotos: string[] = [];
      
      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const filePath = `${locationState.listingId}/${uuidv4()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('vehicle_images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          toast.error(`Error al subir ${file.name}`);
        } else {
          // Get public URL
          const { data } = supabase.storage
            .from('vehicle_images')
            .getPublicUrl(filePath);
            
          if (data.publicUrl) {
            uploadedPhotos.push(data.publicUrl);
          }
        }
        
        // Update progress
        setProgress(Math.round(((i + 1) / totalFiles) * 100));
      }
      
      // Update listing with photo URLs
      if (uploadedPhotos.length > 0) {
        const { error: updateError } = await supabase
          .from('vehicle_listings')
          .update({ photos: uploadedPhotos })
          .eq('id', locationState.listingId);
          
        if (updateError) {
          console.error('Error updating listing with photos:', updateError);
          toast.error("Error al guardar las fotos en tu listado");
        } else {
          toast.success("Imágenes subidas correctamente", {
            description: `Se han subido ${uploadedPhotos.length} de ${totalFiles} fotos`
          });
        }
      }
      
      // Navigate to next step
      navigate('/seller/vehicle-details', { 
        state: { 
          ...locationState,
          photos: uploadedPhotos 
        } 
      });
      
    } catch (error) {
      console.error('Error in upload process:', error);
      toast.error("Ocurrió un error durante la carga de imágenes");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto my-4 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Camera className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Fotos de tu vehículo</CardTitle>
            <CardDescription>
              Sube fotos de alta calidad para mostrar tu vehículo y aumentar tus posibilidades de venta
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <Alert className="bg-amber-50 border-amber-200">
              <Info className="h-4 w-4 text-amber-600" />
              <AlertTitle>Consejos para mejores fotos</AlertTitle>
              <AlertDescription className="text-sm text-amber-800">
                <ul className="list-disc pl-5 space-y-1 mt-2">
                  <li>Toma fotos con buena iluminación natural</li>
                  <li>Captura todos los ángulos del vehículo</li>
                  <li>Incluye fotos del interior, motor y detalles importantes</li>
                  <li>Asegúrate que el vehículo esté limpio</li>
                </ul>
              </AlertDescription>
            </Alert>
            
            <Dropzone
              onDrop={handleDrop}
              maxFiles={10}
              maxSize={10485760} // 10MB
              files={files}
              onRemove={handleRemove}
              className="min-h-[200px]"
            />
            
            {isUploading && (
              <div className="space-y-2">
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary rounded-full transition-all duration-300 ease-in-out" 
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-sm text-center text-muted-foreground">
                  Subiendo {progress}% completado
                </p>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex flex-col gap-4 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isUploading}
              className="w-full sm:w-auto"
            >
              Saltar este paso
            </Button>
            <Button
              onClick={handleUpload}
              disabled={isUploading || files.length === 0}
              className="w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  Continuar
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VehiclePhotos;
