
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressSteps from '@/components/ProgressSteps';
import CarForm from '@/components/CarForm';
import UserForm from '@/components/UserForm';
import VerificationForm from '@/components/VerificationForm';
import QuoteResult from '@/components/QuoteResult';
import { CarData, UserData } from '@/types/forms';

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);

  const steps = ["Datos del auto", "Datos personales", "Verificación", "Tu cotización"];

  const handleCarFormSubmit = (data: CarData) => {
    setCarData(data);
    setCurrentStep(1);
  };

  const handleUserFormSubmit = (data: UserData) => {
    setUserData(data);
    setCurrentStep(2);
  };

  const handleVerified = () => {
    setCurrentStep(3);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleRestart = () => {
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <motion.div 
        className="w-full max-w-md mx-auto space-y-6 py-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold tracking-tight mb-1">Cotiza tu crédito automotriz</h1>
          <p className="text-muted-foreground">
            Obtén tu cotización personalizada en minutos
          </p>
        </div>

        <ProgressSteps currentStep={currentStep} steps={steps} />

        <AnimatePresence mode="wait">
          {currentStep === 0 && (
            <CarForm key="car-form" onNext={handleCarFormSubmit} />
          )}
          
          {currentStep === 1 && (
            <UserForm 
              key="user-form"
              onNext={handleUserFormSubmit} 
              onBack={handleBack} 
            />
          )}
          
          {currentStep === 2 && carData && userData && (
            <VerificationForm 
              key="verification-form"
              onVerified={handleVerified} 
              onBack={handleBack}
              carData={carData}
              userData={userData} 
            />
          )}
          
          {currentStep === 3 && carData && userData && (
            <QuoteResult 
              key="quote-result"
              onBack={handleBack} 
              onRestart={handleRestart}
              carData={carData}
              userData={userData} 
            />
          )}
        </AnimatePresence>
      </motion.div>
      
      <footer className="mt-auto mb-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Auto Quote Ninja. Todos los derechos reservados.
      </footer>
    </div>
  );
};

export default Index;
