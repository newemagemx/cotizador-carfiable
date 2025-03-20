
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

const VehicleDetails: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Recuperar datos del state
  const locationState = location.state as { 
    userData: any;
    carData: any;
    listingId: string;
    priceType: string;
    valuationData: any;
    photos?: string[];
  } | null;

  return (
    <div className="container max-w-2xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <div className="mx-auto my-4 h-14 w-14 rounded-full bg-green-100 flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Detalles del vehículo</CardTitle>
            <CardDescription>
              Has llegado a la página de detalles del vehículo.
              {locationState?.photos && locationState.photos.length > 0 
                ? ` Has subido ${locationState.photos.length} fotos.` 
                : ' No has subido ninguna foto.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Esta es una página temporal que representa el siguiente paso del proceso.
              Aquí se implementará el formulario para detalles adicionales del vehículo.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => navigate('/seller/dashboard')}
              className="w-full sm:w-auto"
            >
              Ir al panel de control
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
};

export default VehicleDetails;
