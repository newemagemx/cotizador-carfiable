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

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/seller" element={<SellerIndex />} />
        <Route path="/seller/valuation" element={<VehicleValuation />} />
        <Route path="/seller/valuation-results" element={<ValuationResults />} />
        <Route path="/seller/verify" element={<VerifyPhone />} />
        <Route path="/auth" element={<UserAuth />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
