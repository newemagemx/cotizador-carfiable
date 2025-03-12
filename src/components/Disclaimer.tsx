
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

const Disclaimer: React.FC = () => {
  return (
    <Alert variant="default" className="bg-muted/50 border border-muted text-xs">
      <AlertCircle className="h-4 w-4 mr-2" />
      <AlertDescription>
        Esta cotización es únicamente informativa y no representa una oferta vinculante de crédito. 
        La aprobación final, tasa de interés y condiciones están sujetas a verificación de buró de crédito 
        y políticas vigentes de Carfiable al momento de la solicitud formal. Los montos pueden variar.
      </AlertDescription>
    </Alert>
  );
};

export default Disclaimer;
