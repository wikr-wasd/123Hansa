// User types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: 'SE' | 'NO' | 'DK';
  language: 'sv' | 'no' | 'da' | 'en';
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  verificationLevel: 'NONE' | 'EMAIL' | 'PHONE' | 'BANKID';
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isBankIdVerified: boolean;
  avatar?: string;
  bio?: string;
  website?: string;
  linkedinProfile?: string;
  companyName?: string;
  companyRegistration?: string;
  vatNumber?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Business Listing types
export interface BusinessListing {
  id: string;
  userId: string;
  title: string;
  description?: string;
  shortDescription?: string;
  category: ListingCategory;
  subcategory?: string;
  businessType?: BusinessType;
  askingPrice?: number;
  currency: string;
  isNegotiable: boolean;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  employees?: number;
  establishedYear?: number;
  website?: string;
  location?: string;
  isRemote: boolean;
  reasonForSale?: string;
  includedAssets: string[];
  status: ListingStatus;
  isActive: boolean;
  isFeatured: boolean;
  viewCount: number;
  inquiryCount: number;
  publishedAt?: Date;
  expiresAt?: Date;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  owner?: User;
  images?: ListingImage[];
  documents?: ListingDocument[];
}

export interface ListingImage {
  id: string;
  listingId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  isMain: boolean;
  order: number;
  createdAt: Date;
}

export interface ListingDocument {
  id: string;
  listingId: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  documentType: string;
  isPublic: boolean;
  createdAt: Date;
}

// Enums
export type ListingCategory = 
  | 'BUSINESS'
  | 'ECOMMERCE'
  | 'SAAS'
  | 'WEBSITE'
  | 'DOMAIN'
  | 'INVOICE'
  | 'REAL_ESTATE'
  | 'EQUIPMENT'
  | 'OTHER';

export type BusinessType = 
  | 'AB'        // Aktiebolag (Sweden)
  | 'AS'        // Aksjeselskap (Norway)
  | 'A_S'       // Aktieselskab (Denmark)
  | 'SOLE_PROP' // Sole Proprietorship
  | 'PARTNER'   // Partnership
  | 'OTHER';

export type ListingStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'SOLD'
  | 'EXPIRED'
  | 'REMOVED';

// Message types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  subject?: string;
  content: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  readAt?: Date;
  createdAt: Date;
  sender?: User;
  receiver?: User;
  listing?: BusinessListing;
}

// Transaction types
export interface Transaction {
  id: string;
  buyerId: string;
  listingId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: TransactionStatus;
  escrowReleaseAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
  refundedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  buyer?: User;
  listing?: BusinessListing;
}

export type PaymentMethod = 
  | 'STRIPE'
  | 'SWISH'
  | 'MOBILEPAY'
  | 'VIPPS'
  | 'BANK_TRANSFER';

export type TransactionStatus = 
  | 'PENDING'
  | 'ESCROW'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Search and Filter types
export interface SearchFilters {
  query?: string;
  category?: ListingCategory;
  businessType?: BusinessType;
  country?: 'SE' | 'NO' | 'DK';
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  isRemote?: boolean;
  sortBy?: 'createdAt' | 'price' | 'views' | 'inquiries';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: 'SE' | 'NO' | 'DK';
  language: 'sv' | 'no' | 'da' | 'en';
  companyName?: string;
  acceptTerms: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Form types
export interface CreateListingRequest {
  title: string;
  description?: string;
  shortDescription?: string;
  category: ListingCategory;
  subcategory?: string;
  businessType?: BusinessType;
  askingPrice?: number;
  currency: string;
  isNegotiable: boolean;
  monthlyRevenue?: number;
  monthlyProfit?: number;
  employees?: number;
  establishedYear?: number;
  website?: string;
  location?: string;
  isRemote: boolean;
  reasonForSale?: string;
  includedAssets: string[];
}

export interface UpdateListingRequest extends Partial<CreateListingRequest> {
  status?: ListingStatus;
}