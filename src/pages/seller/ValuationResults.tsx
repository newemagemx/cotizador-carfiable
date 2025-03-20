
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

// Import custom hooks
import { useInitializeUserData } from '@/hooks/useInitializeUserData';
import { useValuation } from '@/hooks/useValuation';

// Import components
import ValuationHeader from '@/components/valuation/ValuationHeader';
import CarDetailsCard from '@/components/valuation/CarDetailsCard';
import PricingOptions from '@/components/valuation/PricingOptions';
import ActionButtons from '@/components/valuation/ActionButtons';
import ValuationFooter from '@/components/valuation/ValuationFooter';
import LoadingState from '@/components/valuation/LoadingState';
import ErrorState from '@/components/valuation/ErrorState';

const ValuationResults = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState<string>('balanced');
  
  // Initialize user data with custom hook
  const { 
    userData, 
    carData, 
    userId, 
    errorMessage: userDataError, 
    isLoading: isUserDataLoading 
  } = useInitializeUserData();
  
  // Calculate valuation with custom hook
  const { 
    valuationData, 
    isLoading: isValuationLoading, 
    savedListingId, 
    errorMessage: valuationError,
    updateSelectedOption
  } = useValuation(carData, userData, userId);
  
  const isLoading = isUserDataLoading || isValuationLoading;
  const errorMessage = userDataError || valuationError;

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const handleProceed = async () => {
    if (!valuationData) return;
    
    const result = await updateSelectedOption(selectedOption, savedListingId);
    
    if (result.success) {
      // Navigate to next step or dashboard
      navigate('/seller/dashboard', { 
        state: { 
          listingId: result.listingId,
          priceType: selectedOption,
          userData,
          carData,
          valuationData
        } 
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  if (errorMessage) {
    return <ErrorState message={errorMessage} />;
  }

  if (isLoading && !valuationData) {
    return <LoadingState type="calculation" carData={carData} />;
  }

  // Handle case where we have userData but not carData yet
  if (!carData || !userData) {
    return <LoadingState type="loading" />;
  }

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="space-y-6"
      >
        <ValuationHeader 
          carBrand={carData.brand} 
          carModel={carData.model} 
          carYear={carData.year} 
        />

        <CarDetailsCard carData={carData} />

        {valuationData && (
          <PricingOptions 
            valuationData={valuationData} 
            selectedOption={selectedOption} 
            onOptionSelect={handleOptionSelect} 
          />
        )}

        <ActionButtons 
          selectedOption={selectedOption} 
          isLoading={isLoading} 
          onProceed={handleProceed} 
        />

        <ValuationFooter />
      </motion.div>
    </div>
  );
};

export default ValuationResults;
