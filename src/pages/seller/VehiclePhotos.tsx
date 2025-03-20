
import React, { useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dropzone, FileWithPreview } from '@/components/ui/dropzone';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Image, UploadCloud, AlertTriangle } from 'lucide-react';
import ErrorState from '@/components/valuation/ErrorState';

const VehiclePhotos: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Recuperar datos del state
  const locationState = location.state as { 
    userData: any;
    carData: any;
    listingId: string;
    priceType: string;
    valuationData: any;
  } | null;

  const onDrop = useCallback((acceptedFiles: FileWithPreview[]) => {
    const newFiles = acceptedFiles.map(file => 
      Object.assign(file, {
        preview: URL.createObjectURL(file)
      })
    );
    
    // Limit to max 10 files total
    setFiles(current => {
      const updated = [...current, ...newFiles];
      return updated.slice(0, 10);
    });
  }, []);

  const handleRemove = useCallback((file: FileWithPreview) => {
    setFiles(current => current.filter(f => f !== file));
  }, []);

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "No hay imágenes",
        description: "Por favor, sube al menos una imagen o selecciona 'Omitir'",
        variant: "destructive"
      });
      return;
    }

    if (!locationState?.listingId) {
      setError("No se encontró el ID del vehículo. Por favor, inicia el proceso nuevamente.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${locationState.listingId}_${Date.now()}_${index}.${fileExt}`;
        const filePath = `${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('vehicle_images')
          .upload(filePath, file);
          
        if (uploadError) {
          console.error('Error uploading file:', uploadError);
          throw uploadError;
        }
        
        // Get public URL
        const { data: publicURL } = supabase.storage
          .from('vehicle_images')
          .getPublicUrl(filePath);
          
        // Update progress
        setUploadProgress(prevProgress => {
          const newProgress = prevProgress + (100 / files.length);
          return Math.min(newProgress, 95); // Cap at 95% until final update
        });
        
        return publicURL.publicUrl;
      });
      
      // Wait for all uploads to complete
      const photoUrls = await Promise.all(uploadPromises);
      
      // Update vehicle listing with photo URLs
      const { error: updateError } = await supabase
        .from('vehicle_listings')
        .update({ 
          photos: photoUrls,
          updated_at: new Date().toISOString()
        })
        .eq('id', locationState.listingId);
      
      if (updateError) {
        throw updateError;
      }
      
      // Set progress to 100% when complete
      setUploadProgress(100);
      
      toast({
        title: "Imágenes subidas",
        description: "Tus imágenes se han guardado correctamente."
      });
      
      // Navigate to next step
      setTimeout(() => {
        navigate('/seller/vehicle-details', { 
          state: { 
            ...locationState,
            photos: photoUrls
          } 
        });
      }, 1000);
      
    } catch (error: any) {
      console.error('Error en el proceso de subida:', error);
      toast({
        title: "Error al subir imágenes",
        description: error.message || "Ocurrió un error al subir tus imágenes",
        variant: "destructive"
      });
      setIsUploading(false);
    }
  };

  const handleSkip = () => {
    navigate('/seller/vehicle-details', { 
      state: locationState
    });
  };

  // Error handling
  if (error) {
    return <ErrorState message={error} />;
  }

  return (
    <div className="container max-w-xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto my-4 h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Image className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Fotos del vehículo</CardTitle>
            <CardDescription>
              Sube fotos de tu vehículo para que los compradores puedan verlo.
              Se recomienda incluir fotos del exterior, interior y cualquier detalle importante.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Dropzone 
              onDrop={onDrop}
              files={files}
              onRemove={handleRemove}
              maxFiles={10}
              disabled={isUploading}
              accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.webp'] }}
            />
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Puedes subir hasta 10 imágenes (max. 5MB cada una)</p>
              {files.length > 0 && (
                <p className="mt-1 font-medium text-foreground">
                  {files.length} {files.length === 1 ? 'imagen seleccionada' : 'imágenes seleccionadas'}
                </p>
              )}
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-center text-sm text-muted-foreground">
                  Subiendo imágenes... {Math.round(uploadProgress)}%
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full sm:w-auto" disabled={isUploading}>
                  Omitir
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Las publicaciones con fotos tienen 10 veces más posibilidades de recibir ofertas. Puedes añadir fotos más adelante desde tu panel de control.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={handleSkip}>
                    Continuar sin fotos
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            
            <Button 
              className="w-full sm:w-auto flex items-center gap-2"
              onClick={handleUpload}
              disabled={isUploading}
            >
              <UploadCloud className="h-4 w-4" />
              {isUploading ? 'Subiendo...' : 'Subir imágenes'}
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VehiclePhotos;
