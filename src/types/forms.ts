
export interface CarData {
  brand: string;
  model: string;
  year: string;
  price: string;
  downPaymentPercentage: number;
  carId?: string; // Added for car selection
  version?: string;
  mileage?: number;
  condition?: string;
  location?: string;
  features?: string[];
}

export interface UserData {
  name: string;
  email: string;
  phone: string;
  countryCode?: string; // Added for country code selection
}

export interface CarDetails {
  id: string;
  brand: string;
  model: string;
  version: string;
  year: string;
  price: string;
  image_url: string;
  title: string;
  url: string;
  registration_type: string;
}
