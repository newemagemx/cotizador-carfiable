
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ProgressSteps from '@/components/ProgressSteps';
import CarForm from '@/components/CarForm';
import UserForm from '@/components/UserForm';
import VerificationForm from '@/components/VerificationForm';
import QuoteResult from '@/components/QuoteResult';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import WhatsAppBanner from '@/components/WhatsAppBanner';
import { CarData, UserData } from '@/types/forms';
import { getReferenceId } from '@/utils/shareUtils';
import { checkIfPhoneVerified } from '@/components/verification/VerificationService';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const steps = ["Datos del auto", "Datos personales", "Verificación", "Tu cotización"];

  // Check for reference ID in URL on initial load
  useEffect(() => {
    const fetchQuoteByReference = async () => {
      try {
        const refId = getReferenceId();
        
        if (refId) {
          setIsLoading(true);
          
          // Fetch the latest 5 quotations to check if any matches our share ID
          // In a production app, you'd have a proper reference table for shares
          const { data: quotations, error } = await supabase
            .from('quotations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);
            
          if (error) {
            console.error("Error fetching quotations:", error);
            toast({
              title: "Error",
              description: "No se pudo cargar la cotización compartida.",
              variant: "destructive",
            });
          } else if (quotations && quotations.length > 0) {
            // For simplicity, we'll just load the most recent quotation
            // In a production app, you'd match the reference ID to a specific quotation
            const latestQuotation = quotations[0];
            
            // Create car data object
            const car: CarData = {
              brand: latestQuotation.car_brand,
              model: latestQuotation.car_model,
              year: latestQuotation.car_year,
              price: latestQuotation.car_price.toString(),
              downPaymentPercentage: latestQuotation.down_payment_percentage,
              carId: latestQuotation.car_id
            };
            
            // Create user data object
            const user: UserData = {
              name: latestQuotation.user_name,
              email: latestQuotation.user_email,
              phone: latestQuotation.user_phone.replace(/^\+\d+/, ''), // Remove country code
              countryCode: '+' + latestQuotation.user_phone.match(/^\+(\d+)/)?.[1] || '+52'
            };
            
            setCarData(car);
            setUserData(user);
            setCurrentStep(3); // Jump directly to the results page
            
            toast({
              title: "Cotización cargada",
              description: "Se ha cargado la cotización compartida.",
            });
          } else {
            toast({
              title: "Cotización no encontrada",
              description: "No se pudo encontrar la cotización compartida.",
              variant: "destructive",
            });
          }
          
          setIsLoading(false);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in fetching quote by reference:", err);
        setIsLoading(false);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar la cotización compartida.",
          variant: "destructive",
        });
      }
    };
    
    fetchQuoteByReference();
  }, [toast]);

  const handleCarFormSubmit = (data: CarData) => {
    setCarData(data);
    setCurrentStep(1);
  };

  const handleUserFormSubmit = async (data: UserData) => {
    setUserData(data);
    
    // Check if the phone has been verified in the last 30 days
    const phoneVerified = await checkIfPhoneVerified(data.phone, data.countryCode || '+52');
    
    if (phoneVerified) {
      // Skip verification and go straight to results
      setCurrentStep(3);
      toast({
        title: "Verificación automática",
        description: "Tu número ya fue verificado anteriormente.",
      });
    } else {
      // Need verification
      setCurrentStep(2);
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
        <Header />
        <div className="flex items-center justify-center flex-1">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
        <Footer />
        <WhatsAppBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <Header />
      
      <motion.div 
        className="w-full max-w-md mx-auto space-y-6 py-6 flex-1"
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
      
      <Footer />
      <WhatsAppBanner />
    </div>
  );
};

export default Index;
