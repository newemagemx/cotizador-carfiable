
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronRight, ArrowLeft } from "lucide-react";

interface UserFormActionsProps {
  onBack: () => void;
}

const UserFormActions: React.FC<UserFormActionsProps> = ({ onBack }) => {
  return (
    <div className="flex space-x-4">
      <Button 
        type="button" 
        variant="outline" 
        onClick={onBack}
        className="flex-1"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Atrás
      </Button>
      <Button 
        type="submit" 
        className="flex-1 group"
      >
        Continuar
        <ChevronRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </Button>
    </div>
  );
};

export default UserFormActions;
