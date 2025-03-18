export interface VehicleData {
  brand: string;
  model: string;
  year: string;
  version: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair';
  location: string;
  features: string[];
}

export interface User {
  id?: string;
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  role?: 'buyer' | 'seller' | 'both';
  lastVerified?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceEstimate {
  quick: number;
  balanced: number;
  premium: number;
  currency: string;
}

export interface VehicleListing {
  id: string;
  vehicleData: VehicleData;
  userId: string;
  priceEstimate: PriceEstimate;
  photos: string[];
  documents: string[];
  status: 'draft' | 'pending' | 'published' | 'sold';
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentSlot {
  date: string;
  time: string;
  location: string;
  available: boolean;
}

export interface Appointment {
  id: string;
  vehicleListingId: string;
  slot: AppointmentSlot;
  status: 'scheduled' | 'completed' | 'canceled';
  type: 'capture' | 'buyer';
  buyerId?: string;
  sellerId?: string;
  createdAt: string;
}

export interface PromotionPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

// For backward compatibility
export interface SellerData extends User {
  // Keep the same interface signature for existing code
}
