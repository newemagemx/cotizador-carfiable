
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import VerificationForm from '@/components/VerificationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressSteps from '@/components/ProgressSteps';
import { CarData, UserData } from '@/types/forms';

const VerifyPhone: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [carData, setCarData] = useState<CarData | null>(null);

  useEffect(() => {
    // Get data from location state or localStorage
    const state = location.state as { userData: UserData; carData: CarData } | null;
    
    if (state?.userData && state?.carData) {
      setUserData(state.userData);
      setCarData(state.carData);
    } else {
      // Try to get from localStorage as fallback
      const storedUserData = localStorage.getItem('userData');
      const storedCarData = localStorage.getItem('carData');
      
      if (storedUserData && storedCarData) {
        setUserData(JSON.parse(storedUserData));
        setCarData(JSON.parse(storedCarData));
      } else {
        // No data available, redirect back to the beginning
        navigate('/seller/valuation');
      }
    }
  }, [location, navigate]);

  const handleVerified = () => {
    // This is now handled in the VerificationService.ts with redirection
    console.log('Verification successful!');
  };

  const handleBack = () => {
    navigate('/seller/valuation');
  };

  if (!userData || !carData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p>Cargando información...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Verificación</CardTitle>
          </CardHeader>
          <CardContent>
            <ProgressSteps currentStep={2} />
            
            <div className="mt-6">
              <VerificationForm
                onVerified={handleVerified}
                onBack={handleBack}
                userData={userData}
                carData={carData}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyPhone;
