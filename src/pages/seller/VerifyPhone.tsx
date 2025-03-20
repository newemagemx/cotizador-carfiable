
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import VerificationForm from '@/components/VerificationForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ProgressSteps from '@/components/ProgressSteps';
import { CarData, UserData } from '@/types/forms';
import { supabase } from "@/integrations/supabase/client";

const VerifyPhone: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [carData, setCarData] = useState<CarData | null>(null);

  useEffect(() => {
    // Get data from location state, localStorage, or sessionStorage
    const state = location.state as { userData: UserData; carData: CarData } | null;
    
    if (state?.userData && state?.carData) {
      setUserData(state.userData);
      setCarData(state.carData);
    } else {
      // Try to get from storage as fallback
      const storedUserData = sessionStorage.getItem('userData');
      let userDataObj = null;
      
      if (storedUserData) {
        try {
          userDataObj = JSON.parse(storedUserData);
          setUserData(userDataObj);
        } catch (e) {
          console.error("Error parsing userData", e);
        }
      }
      
      // Check for session storage from auth flow
      if (!userDataObj) {
        // Try to get from auth session data
        const authUserData = sessionStorage.getItem('authUserData');
        if (authUserData) {
          try {
            const authUser = JSON.parse(authUserData);
            setUserData({
              name: authUser.name || '',
              email: authUser.email || '',
              phone: authUser.phone || '',
              countryCode: authUser.countryCode || '+52'
            });
          } catch (e) {
            console.error("Error parsing authUserData", e);
          }
        }
      }
      
      // Get car data if available
      const storedCarData = sessionStorage.getItem('carData');
      if (storedCarData) {
        try {
          setCarData(JSON.parse(storedCarData));
        } catch (e) {
          console.error("Error parsing carData", e);
        }
      }
      
      // If still no data available, create empty objects to prevent errors
      if (!userData) {
        setUserData({
          name: '',
          email: '',
          phone: '',
          countryCode: '+52'
        });
      }
      
      if (!carData) {
        setCarData({
          brand: '',
          model: '',
          year: '',
          price: '',
          downPaymentPercentage: 20
        });
      }
    }
  }, [location]);

  const handleVerified = () => {
    // Navigate to the results page once verification is complete
    navigate('/seller/valuation-results', { 
      state: { userData, carData } 
    });
  };

  const handleBack = () => {
    // Go back to appropriate page (authentication or valuation)
    const comesFromAuth = location.state?.fromAuth;
    if (comesFromAuth) {
      navigate('/auth');
    } else {
      navigate('/seller/valuation');
    }
  };

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
              {userData && (
                <VerificationForm
                  onVerified={handleVerified}
                  onBack={handleBack}
                  userData={userData}
                  carData={carData || {
                    brand: '',
                    model: '',
                    year: '',
                    price: '',
                    downPaymentPercentage: 20
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyPhone;
