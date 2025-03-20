
import React from "react";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import SellerIndex from "./pages/seller/SellerIndex";
import NotFound from "./pages/NotFound";
import "./App.css";
import VehicleValuation from "./pages/seller/VehicleValuation";
import VerifyPhone from "./pages/seller/VerifyPhone";
import UserAuth from "./pages/auth/UserAuth";
import ValuationResults from "./pages/seller/ValuationResults";
import SellerRegistration from "./pages/seller/SellerRegistration";
import PasswordSetup from "./pages/auth/PasswordSetup";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/seller" element={<SellerIndex />} />
        <Route path="/seller/valuation" element={<VehicleValuation />} />
        <Route path="/seller/valuation-results" element={<ValuationResults />} />
        <Route path="/seller/verify" element={<VerifyPhone />} />
        <Route path="/seller/register" element={<SellerRegistration />} />
        <Route path="/auth" element={<UserAuth />} />
        <Route path="/auth/password-setup" element={<PasswordSetup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
