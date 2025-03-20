
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import SellerDashboard from './pages/seller/SellerDashboard';
import VehicleValuation from './pages/seller/VehicleValuation';
import SellerRegistration from './pages/seller/SellerRegistration';
import VerifyPhone from './pages/seller/VerifyPhone';
import ValuationResults from './pages/seller/ValuationResults';
import CreateAccount from './pages/auth/CreateAccount';
import ValuationDecision from './pages/seller/ValuationDecision';
import VehiclePhotos from './pages/seller/VehiclePhotos';
import VehicleDetails from './pages/seller/VehicleDetails';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Seller Routes */}
      <Route path="/seller/dashboard" element={<SellerDashboard />} />
      <Route path="/seller/valuation" element={<VehicleValuation />} />
      <Route path="/seller/register" element={<SellerRegistration />} />
      <Route path="/seller/verify" element={<VerifyPhone />} />
      <Route path="/seller/valuation-results" element={<ValuationResults />} />
      <Route path="/seller/vehicle-photos" element={<VehiclePhotos />} />
      <Route path="/seller/vehicle-details" element={<VehicleDetails />} />

      {/* Nuevas rutas de vendedor - Fase 1 */}
      <Route path="/auth/create-account" element={<CreateAccount />} />
      <Route path="/seller/valuation-decision" element={<ValuationDecision />} />
    </Routes>
  );
}

export default App;
