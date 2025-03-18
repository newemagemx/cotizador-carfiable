
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

export interface SellerData {
  name: string;
  email: string;
  phone: string;
  countryCode: string;
  lastVerified?: string;
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
  sellerData: SellerData;
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
  createdAt: string;
}

export interface PromotionPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}
