
import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";

const WhatsAppBanner: React.FC = () => {
  return (
    <motion.div
      className="fixed bottom-8 right-8 z-50"
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
    >
      <a 
        href="https://api.whatsapp.com/send/?phone=526561210910&text=Hola+necesito+asesoría+con+una+cotización" 
        target="_blank" 
        rel="noopener noreferrer"
      >
        <Button 
          className="rounded-full shadow-lg bg-green-500 hover:bg-green-600 text-white px-4 h-12"
        >
          <MessageCircle className="mr-2 h-5 w-5" />
          Solicitar asesoría por WhatsApp
        </Button>
      </a>
    </motion.div>
  );
};

export default WhatsAppBanner;
