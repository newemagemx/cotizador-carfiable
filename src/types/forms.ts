
export interface CarData {
  brand: string;
  model: string;
  year: string;
  price: string;
  downPaymentPercentage: number;
  carId?: string; // Added for car selection
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
