
export interface VehicleListing {
  id: string;
  user_id: string;
  brand: string;
  model: string;
  year: string;
  version?: string;
  mileage: number;
  condition: string;
  location?: string;
  features: string[];
  estimated_price_quick: number;
  estimated_price_balanced: number;
  estimated_price_premium: number;
  currency: string;
  photos: string[];
  documents: string[];
  status: 'draft' | 'published' | 'sold' | 'archived';
  selected_price_type?: 'quick' | 'balanced' | 'premium';
  created_at: string;
  updated_at: string;
}

export interface ValuationResponse {
  quickSellPrice: number;
  balancedPrice: number;
  premiumPrice: number;
  currency: string;
  id?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  countryCode?: string;
  role: 'seller' | 'buyer' | 'both';
  lastVerified?: string;
}

export interface VehicleData {
  brand: string;
  model: string;
  year: string;
  version: string;
  mileage: number;
  condition: string;
  location: string;
  features: string[];
}
