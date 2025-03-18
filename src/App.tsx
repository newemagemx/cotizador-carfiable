
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SellerIndex from "./pages/seller/Index";
import VehicleValuation from "./pages/seller/VehicleValuation";
import SellerRegistration from "./pages/seller/SellerRegistration";
import VerifyPhone from "./pages/seller/VerifyPhone";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Seller Module Routes */}
          <Route path="/seller" element={<SellerIndex />} />
          <Route path="/seller/valuation" element={<VehicleValuation />} />
          <Route path="/seller/register" element={<SellerRegistration />} />
          <Route path="/seller/verify" element={<VerifyPhone />} />
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
