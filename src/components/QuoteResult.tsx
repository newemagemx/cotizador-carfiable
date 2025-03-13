import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Calendar, DollarSign, Percent, Send, RefreshCw, Whatsapp } from "lucide-react";
import { CarIcon } from "lucide-react"; // Import as CarIcon to avoid conflict
import { CarData, UserData, CarDetails } from '@/types/forms';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Disclaimer from './Disclaimer';
import { createWhatsAppShareLink } from '@/utils/shareUtils';

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
  const [carDetails, setCarDetails] = useState<CarDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
  
  // Fetch car details if a car_id is available
  useEffect(() => {
    const fetchCarDetails = async () => {
      if (!carData.carId) return;
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('cars')
          .select('*')
          .eq('id', carData.carId)
          .single();
          
        if (error) {
          console.error("Error fetching car details:", error);
        } else if (data) {
          setCarDetails(data as CarDetails);
        }
      } catch (err) {
        console.error("Error in fetching car details:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCarDetails();
  }, [carData.carId]);
  
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

  const handleSendQuote = async () => {
    try {
      setIsLoading(true);
      
      // Create HTML template for email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px 0;">
            <img src="https://carfiable.mx/wp-content/uploads/2023/10/Asset-1.png" alt="Carfiable Logo" style="max-height: 60px;">
          </div>
          <h1 style="color: #0066ff; font-size: 24px; margin-bottom: 20px;">Tu Cotización de Crédito Automotriz</h1>
          <p>Hola ${userData.name},</p>
          <p>Gracias por utilizar el cotizador de Carfiable. Aquí está el detalle de tu cotización:</p>
          
          <div style="background-color: #f7f9fc; border-radius: 8px; padding: 20px; margin: 20px 0;">
            <h2 style="font-size: 18px; margin-top: 0;">${carData.brand} ${carData.model} ${carData.year}</h2>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Precio del auto:</span>
              <strong>${formatCurrency(parseInt(carData.price))}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Enganche (${carData.downPaymentPercentage}%):</span>
              <strong>${formatCurrency(carPrice * (carData.downPaymentPercentage / 100))}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Monto a financiar:</span>
              <strong>${formatCurrency(loanAmount)}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Tasa de interés:</span>
              <strong>${annualInterestRate}% anual</strong>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span>Plazo:</span>
              <strong>${selectedTerm} meses</strong>
            </div>
            <div style="background-color: #0066ff; color: white; border-radius: 6px; padding: 15px; margin-top: 15px;">
              <div style="display: flex; justify-content: space-between; font-size: 20px;">
                <span>Pago mensual:</span>
                <strong>${formatCurrency(calculateMonthlyPayment(selectedTerm))}</strong>
              </div>
            </div>
          </div>
          
          <p style="font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px;">
            Esta cotización es únicamente informativa y no representa una oferta vinculante de crédito. 
            La aprobación final, tasa de interés y condiciones están sujetas a verificación de buró de crédito 
            y políticas vigentes de Carfiable al momento de la solicitud formal. Los montos pueden variar.
          </p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://carfiable.mx" style="background-color: #0066ff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Visitar Carfiable
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Carfiable. Todos los derechos reservados.</p>
            <p><a href="https://carfiable.mx/aviso-de-privacidad/" style="color: #0066ff;">Aviso de Privacidad</a></p>
          </div>
        </div>
      `;
      
      // Call the edge function to send email
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: userData.email,
          toName: userData.name,
          subject: 'Tu cotización de crédito automotriz - Carfiable',
          htmlContent
        }
      });
      
      if (error) {
        console.error("Error sending email:", error);
        toast({
          title: "Error",
          description: "No se pudo enviar el correo. Intenta nuevamente.",
          variant: "destructive",
        });
      } else {
        console.log("Email sent successfully:", data);
        toast({
          title: "Cotización enviada",
          description: `Se ha enviado la cotización a ${userData.email}`,
        });
      }
    } catch (err) {
      console.error("Error in sending quote:", err);
      toast({
        title: "Error",
        description: "Ocurrió un error al enviar la cotización",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareWhatsApp = () => {
    const shareLink = createWhatsAppShareLink(
      carData.brand,
      carData.model,
      carData.year,
      formatCurrency(carPrice),
      carData.downPaymentPercentage,
      calculateMonthlyPayment(selectedTerm),
      selectedTerm
    );
    
    // Open the WhatsApp share link in a new tab
    window.open(shareLink, '_blank');
    
    toast({
      title: "Enviar a WhatsApp",
      description: "Abriendo WhatsApp para compartir tu cotización",
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
                <CarIcon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold tracking-tight">Tu cotización de crédito</h3>
              
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <p className="text-sm text-muted-foreground">Cargando detalles del auto...</p>
                </div>
              ) : carDetails ? (
                <div className="space-y-2">
                  <h4 className="text-base font-medium">{carDetails.title}</h4>
                  {carDetails.image_url && (
                    <div className="relative w-full h-40 mx-auto overflow-hidden rounded-md">
                      <img 
                        src={carDetails.image_url} 
                        alt={carDetails.title} 
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.svg';
                        }}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {carData.brand} {carData.model} {carData.year}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground mb-1 flex items-center">
                  <CarIcon className="h-3 w-3 mr-1" /> Precio del auto
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

            {/* Add disclaimer before buttons */}
            <Disclaimer />

            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={handleShareWhatsApp}
                className="w-full"
              >
                <Whatsapp className="mr-2 h-4 w-4" />
                Enviar a WhatsApp
              </Button>
              <Button
                onClick={handleSendQuote}
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar por correo
                  </>
                )}
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
