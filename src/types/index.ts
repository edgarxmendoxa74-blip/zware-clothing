export interface Variation {
  id: string;
  name: string;
  price: number;
  image?: string;
  stock?: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  popular?: boolean;
  available?: boolean;
  variations?: Variation[];
  addOns?: AddOn[];
  // Discount pricing fields
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountActive?: boolean;
  // Computed effective price (calculated in the app)
  effectivePrice?: number;
  isOnDiscount?: boolean;
  // Multi-variation support
  maxVariations?: number; // How many variations customer can pick (parsed from description)
  weight?: number;
  // Multi-image support
  images?: string[];
  stock?: number;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariation?: Variation;
  selectedVariations?: Variation[]; // Support multiple variations
  selectedAddOns?: AddOn[];
  totalPrice: number;
}

export interface OrderData {
  items: CartItem[];
  customerName: string;
  contactNumber: string;
  serviceType: 'regular' | 'cod';
  address: string;
  location: 'LUZON' | 'VISAYAS' | 'MINDANAO' | 'ISLANDER' | '';
  landmark?: string;
  paymentMethod: 'gcash' | 'cod';
  referenceNumber?: string;
  total: number;
  subtotal: number;
  shippingFee: number;
  discountTotal: number;
  couponCode?: string;
  notes?: string;
}

export interface Coupon {
  id: string;
  code: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minSpend: number;
  active: boolean;
  expiresAt?: string;
  created_at?: string;
  updated_at?: string;
}

export type PaymentMethod = 'gcash' | 'cod';
export type ServiceType = 'regular' | 'cod';

// Site Settings Types
export interface SiteSetting {
  id: string;
  value: string;
  type: 'text' | 'image' | 'boolean' | 'number';
  description?: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_description: string;
  currency: string;
  currency_code: string;
  hero_subtitle?: string;
  hero_images?: string[];
}