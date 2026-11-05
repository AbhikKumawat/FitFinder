export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  currency: string;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  recommendedSize: string;
  fitMatch: number;
  fitExplanation: string;
  rating: number;
  reviewCount: number;
  description: string;
  specs: Record<string, string>;
  storeUrl: string;
  source: string;
  isWishlisted?: boolean;
}

export interface UserMeasurements {
  height: number;
  chest: number;
  waist: number;
  hips: number;
  shoulders: number;
  footLength: number;
  unit: 'cm' | 'in';
}

export interface FitPreference {
  value: 'slim' | 'regular' | 'relaxed' | 'oversized';
  label: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
  measurements: UserMeasurements;
  fitPreference: FitPreference['value'];
  favoriteBrands: string[];
  profileCompletion: number;
}

export interface AgentStatus {
  id: string;
  name: string;
  icon: string;
  status: 'idle' | 'running' | 'done' | 'error';
  message: string;
}

export type NavItem = 'discover' | 'search' | 'categories' | 'wishlist' | 'profile';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  count: number;
}
