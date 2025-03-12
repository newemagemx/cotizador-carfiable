
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, RefreshCw } from "lucide-react";

interface VerificationActionsProps {
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  canVerify: boolean;
  canResend: boolean;
  isLoading: boolean;
  isSendingSMS: boolean;
  countdown: number;
}

const VerificationActions: React.FC<VerificationActionsProps> = ({
  onVerify,
  onResend,
  onBack,
  canVerify,
  canResend,
  isLoading,
  isSendingSMS,
  countdown
}) => {
  return (
    <div className="space-y-4">
      <Button 
        type="button" 
        onClick={onVerify} 
        className="w-full"
        disabled={!canVerify || isLoading}
      >
        {isLoading ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Verificando...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Verificar código
          </>
        )}
      </Button>
      
      <div className="flex justify-center">
        <Button 
          variant="link" 
          size="sm" 
          onClick={onResend} 
          disabled={!canResend || isLoading || isSendingSMS}
          className="text-sm"
        >
          {isSendingSMS ? (
            <>
              <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
              Enviando...
            </>
          ) : canResend ? (
            'Reenviar código'
          ) : (
            `Reenviar en ${countdown}s`
          )}
        </Button>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        onClick={onBack}
        className="w-full"
        disabled={isLoading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>
    </div>
  );
};

export default VerificationActions;
