
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Car, Calendar, DollarSign, Percent, Download, Send } from "lucide-react";
import { CarData, UserData } from '@/types/forms';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface QuoteResultProps {
  onBack: () => void;
  onRestart: () => void;
  carData: CarData;
  userData: UserData;
}

// Loan term options in months
const loanTerms = [12, 24, 36, 48];

const QuoteResult: React.FC<QuoteResultProps> = ({ 
  onBack, 
  onRestart, 
  carData, 
  userData 
}) => {
  const [selectedTerm, setSelectedTerm] = useState<number>(36);
  const { toast } = useToast();
  
  useEffect(() => {
    // Update the quotation with the selected term
    const updateQuotation = async () => {
      try {
        const { data, error } = await supabase
          .from('quotations')
          .update({ selected_term: selectedTerm })
          .eq('user_email', userData.email)
          .eq('is_verified', true)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) {
          console.error("Error updating selected term:", error);
        }
      } catch (err) {
        console.error("Error in updating quotation:", err);
      }
    };
    
    updateQuotation();
  }, [selectedTerm, userData.email]);
  
  // Calculate loan details
  const carPrice = parseInt(carData.price);
  const downPaymentPercentage = carData.downPaymentPercentage;
  const downPaymentAmount = carPrice * (downPaymentPercentage / 100);
  const loanAmount = carPrice - downPaymentAmount;
  const annualInterestRate = 12.99; // Fixed interest rate as per requirements
  const monthlyInterestRate = annualInterestRate / 100 / 12;
  
  // Calculate monthly payment using the formula for amortization
  const calculateMonthlyPayment = (term: number) => {
    const n = term; // Number of months
    const r = monthlyInterestRate; // Monthly interest rate
    
    // Formula: P = L[r(1+r)^n]/[(1+r)^n-1]
    const monthlyPayment = loanAmount * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    
    return Math.round(monthlyPayment);
  };
  
  // Calculate total cost
  const calculateTotalCost = (term: number) => {
    const monthlyPayment = calculateMonthlyPayment(term);
    return monthlyPayment * term + downPaymentAmount;
  };
  
  // Calculate total interest
  const calculateTotalInterest = (term: number) => {
    const totalCost = calculateTotalCost(term);
    return totalCost - carPrice;
  };
  
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleSendQuote = () => {
    toast({
      title: "Cotización enviada",
      description: `Se ha enviado la cotización a ${userData.email}`,
    });
  };

  const handleDownloadQuote = () => {
    toast({
      title: "Descarga iniciada",
      description: "Tu cotización se está descargando",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      <Card className="w-full border bg-card/50 backdrop-blur">
        <CardContent className="pt-6">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center rounded-full bg-primary/10 p-2 mb-2">
                <Car className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">Tu cotización de crédito</h3>
              <p className="text-sm text-muted-foreground">
                {carData.brand} {carData.model} {carData.year}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center">
                  <Car className="h-3 w-3 mr-1" /> Precio del auto
                </p>
                <p className="text-lg font-medium">{formatCurrency(carPrice)}</p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center">
                  <DollarSign className="h-3 w-3 mr-1" /> Enganche
                </p>
                <p className="text-lg font-medium">{formatCurrency(downPaymentAmount)} <span className="text-xs">({downPaymentPercentage}%)</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center">
                  <Percent className="h-3 w-3 mr-1" /> Tasa de interés
                </p>
                <p className="text-lg font-medium">{annualInterestRate}% <span className="text-xs">anual</span></p>
              </div>
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center">
                  <Calendar className="h-3 w-3 mr-1" /> Monto a financiar
                </p>
                <p className="text-lg font-medium">{formatCurrency(loanAmount)}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Tabs 
                defaultValue={selectedTerm.toString()} 
                onValueChange={(value) => setSelectedTerm(parseInt(value))}
                className="w-full"
              >
                <TabsList className="grid grid-cols-4 mb-4">
                  {loanTerms.map(term => (
                    <TabsTrigger
                      key={term}
                      value={term.toString()}
                      className="text-sm"
                    >
                      {term} meses
                    </TabsTrigger>
                  ))}
                </TabsList>

                {loanTerms.map(term => (
                  <TabsContent key={term} value={term.toString()} className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-lg bg-primary/5 border border-primary/10 p-4"
                    >
                      <h4 className="text-sm font-medium mb-2">Pago mensual estimado</h4>
                      <p className="text-3xl font-bold text-primary">
                        {formatCurrency(calculateMonthlyPayment(term))}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        durante {term} meses
                      </p>
                    </motion.div>

                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm">Enganche</span>
                        <span className="text-sm font-medium">{formatCurrency(downPaymentAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Total a financiar</span>
                        <span className="text-sm font-medium">{formatCurrency(loanAmount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Interés total</span>
                        <span className="text-sm font-medium">{formatCurrency(calculateTotalInterest(term))}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t">
                        <span className="text-sm font-medium">Costo total del crédito</span>
                        <span className="text-sm font-medium">{formatCurrency(calculateTotalCost(term))}</span>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleDownloadQuote}
                className="w-full"
              >
                <Download className="mr-2 h-4 w-4" />
                Descargar
              </Button>
              <Button
                onClick={handleSendQuote}
                className="w-full"
              >
                <Send className="mr-2 h-4 w-4" />
                Enviar por correo
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onBack}
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Atrás
              </Button>
              <Button 
                type="button" 
                variant="ghost" 
                onClick={onRestart}
                className="w-full"
              >
                Nueva cotización
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuoteResult;
