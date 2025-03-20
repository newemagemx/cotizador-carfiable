
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Home, ArrowLeft, RefreshCw } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message }) => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="space-y-6">
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="mt-2">{message}</AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button onClick={handleGoBack} variant="outline" className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" /> Volver
        </Button>
        <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" /> Reintentar
        </Button>
        <Button onClick={handleGoHome} className="flex items-center gap-2">
          <Home className="h-4 w-4" /> Ir al inicio
        </Button>
      </div>
      
      <p className="text-sm text-muted-foreground text-center mt-4">
        Si el problema persiste, por favor contacta a soporte o vuelve a iniciar el proceso.
      </p>
    </div>
  );
};

export default ErrorState;
