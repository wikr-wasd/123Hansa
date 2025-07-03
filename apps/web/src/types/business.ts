export interface BusinessListing {
  id: string;
  title: string;
  description: string;
  sector: string;
  location: {
    city: string;
    region: string;
    country: string;
  };
  price: {
    amount: number;
    currency: string;
    type: 'FIXED' | 'NEGOTIABLE' | 'AUCTION';
  };
  financials: {
    revenue: number;
    ebitda: number;
    employees: number;
    yearEstablished: number;
  };
  features: string[];
  images: string[];
  sellerId: string;
  seller: {
    name: string;
    verified: boolean;
    rating: number;
    totalTransactions: number;
  };
  status: 'ACTIVE' | 'PENDING' | 'SOLD' | 'WITHDRAWN';
  viewCount: number;
  favoriteCount: number;
  inquiryCount: number;
  listedAt: Date;
  updatedAt: Date;
  premium: boolean;
  featured: boolean;
}

export interface BusinessInquiry {
  id: string;
  listingId: string;
  buyerId: string;
  type: 'MESSAGE' | 'OFFER' | 'QUESTION';
  message: string;
  offerAmount?: number;
  status: 'PENDING' | 'REPLIED' | 'ACCEPTED' | 'DECLINED';
  createdAt: Date;
}

export interface SearchFilters {
  sector?: string[];
  location?: {
    cities?: string[];
    regions?: string[];
    maxDistance?: number;
  };
  priceRange?: {
    min?: number;
    max?: number;
  };
  revenueRange?: {
    min?: number;
    max?: number;
  };
  employeeRange?: {
    min?: number;
    max?: number;
  };
  features?: string[];
  listingAge?: number; // days
}