import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

// Types
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
  publishedAt?: string;
  expiresAt?: string;
  soldAt?: string;
  createdAt: string;
  updatedAt: string;
  owner?: ListingOwner;
  images?: ListingImage[];
  documents?: ListingDocument[];
  savedBy?: any[];
}

export interface ListingOwner {
  id: string;
  firstName: string;
  lastName: string;
  country: string;
  companyName?: string;
  avatar?: string;
  createdAt: string;
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
  createdAt: string;
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
  createdAt: string;
}

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
  | 'AB'
  | 'AS'
  | 'A_S'
  | 'SOLE_PROP'
  | 'PARTNER'
  | 'OTHER';

export type ListingStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'ACTIVE'
  | 'SOLD'
  | 'EXPIRED'
  | 'REMOVED';

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

export interface SearchListingsRequest {
  query?: string;
  category?: ListingCategory;
  businessType?: BusinessType;
  country?: 'SE' | 'NO' | 'DK';
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  isRemote?: boolean;
  sortBy?: 'createdAt' | 'askingPrice' | 'monthlyRevenue' | 'viewCount' | 'inquiryCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface SearchResponse {
  listings: BusinessListing[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const listingService = {
  /**
   * Create a new listing
   */
  async createListing(data: CreateListingRequest): Promise<BusinessListing> {
    try {
      const response: AxiosResponse<ApiResponse<{ listing: BusinessListing }>> = 
        await api.post('/listings', data);
      
      if (response.data.success && response.data.data) {
        return response.data.data.listing;
      }
      
      throw new Error(response.data.message || 'Failed to create listing');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create listing');
    }
  },

  /**
   * Get listing by ID
   */
  async getListingById(id: string): Promise<BusinessListing> {
    try {
      const response: AxiosResponse<ApiResponse<{ listing: BusinessListing }>> = 
        await api.get(`/listings/${id}`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.listing;
      }
      
      throw new Error(response.data.message || 'Listing not found');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get listing');
    }
  },

  /**
   * Update listing
   */
  async updateListing(id: string, data: Partial<CreateListingRequest>): Promise<BusinessListing> {
    try {
      const response: AxiosResponse<ApiResponse<{ listing: BusinessListing }>> = 
        await api.put(`/listings/${id}`, data);
      
      if (response.data.success && response.data.data) {
        return response.data.data.listing;
      }
      
      throw new Error(response.data.message || 'Failed to update listing');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update listing');
    }
  },

  /**
   * Delete listing
   */
  async deleteListing(id: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await api.delete(`/listings/${id}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete listing');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete listing');
    }
  },

  /**
   * Search listings
   */
  async searchListings(params: SearchListingsRequest): Promise<SearchResponse> {
    try {
      const response: AxiosResponse<ApiResponse<SearchResponse>> = 
        await api.get('/listings/search', { params });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to search listings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to search listings');
    }
  },

  /**
   * Get all listings
   */
  async getAllListings(params: SearchListingsRequest = {}): Promise<SearchResponse> {
    try {
      const response: AxiosResponse<ApiResponse<SearchResponse>> = 
        await api.get('/listings', { params });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get listings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get listings');
    }
  },

  /**
   * Get user's listings
   */
  async getMyListings(status?: string): Promise<BusinessListing[]> {
    try {
      const params = status ? { status } : {};
      const response: AxiosResponse<ApiResponse<{ listings: BusinessListing[] }>> = 
        await api.get('/listings/my-listings', { params });
      
      if (response.data.success && response.data.data) {
        return response.data.data.listings;
      }
      
      throw new Error(response.data.message || 'Failed to get your listings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get your listings');
    }
  },

  /**
   * Get saved listings
   */
  async getSavedListings(): Promise<BusinessListing[]> {
    try {
      const response: AxiosResponse<ApiResponse<{ listings: BusinessListing[] }>> = 
        await api.get('/listings/user/saved');
      
      if (response.data.success && response.data.data) {
        return response.data.data.listings;
      }
      
      throw new Error(response.data.message || 'Failed to get saved listings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get saved listings');
    }
  },

  /**
   * Publish listing
   */
  async publishListing(id: string): Promise<BusinessListing> {
    try {
      const response: AxiosResponse<ApiResponse<{ listing: BusinessListing }>> = 
        await api.post(`/listings/${id}/publish`);
      
      if (response.data.success && response.data.data) {
        return response.data.data.listing;
      }
      
      throw new Error(response.data.message || 'Failed to publish listing');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to publish listing');
    }
  },

  /**
   * Save/unsave listing
   */
  async toggleSaveListing(id: string): Promise<{ saved: boolean }> {
    try {
      const response: AxiosResponse<ApiResponse<{ saved: boolean }>> = 
        await api.post(`/listings/${id}/save`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to save listing');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to save listing');
    }
  },

  /**
   * Upload images
   */
  async uploadImages(listingId: string, files: File[]): Promise<ListingImage[]> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });

      const response: AxiosResponse<ApiResponse<{ images: ListingImage[] }>> = 
        await api.post(`/listings/${listingId}/images`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      
      if (response.data.success && response.data.data) {
        return response.data.data.images;
      }
      
      throw new Error(response.data.message || 'Failed to upload images');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload images');
    }
  },

  /**
   * Upload documents
   */
  async uploadDocuments(
    listingId: string, 
    files: File[], 
    documentType: string = 'general',
    isPublic: boolean = false
  ): Promise<ListingDocument[]> {
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('documents', file);
      });
      formData.append('documentType', documentType);
      formData.append('isPublic', isPublic.toString());

      const response: AxiosResponse<ApiResponse<{ documents: ListingDocument[] }>> = 
        await api.post(`/listings/${listingId}/documents`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      
      if (response.data.success && response.data.data) {
        return response.data.data.documents;
      }
      
      throw new Error(response.data.message || 'Failed to upload documents');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload documents');
    }
  },

  /**
   * Delete image
   */
  async deleteImage(imageId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.delete(`/listings/images/${imageId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete image');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete image');
    }
  },

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.delete(`/listings/documents/${documentId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete document');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete document');
    }
  },

  /**
   * Set main image
   */
  async setMainImage(imageId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.post(`/listings/images/${imageId}/set-main`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to set main image');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to set main image');
    }
  },

  /**
   * Reorder images
   */
  async reorderImages(listingId: string, imageIds: string[]): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.post(`/listings/${listingId}/images/reorder`, { imageIds });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to reorder images');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to reorder images');
    }
  },

  /**
   * Get categories
   */
  async getCategories(): Promise<Record<string, string[]>> {
    try {
      const response: AxiosResponse<ApiResponse<{ categories: Record<string, string[]> }>> = 
        await api.get('/listings/categories');
      
      if (response.data.success && response.data.data) {
        return response.data.data.categories;
      }
      
      throw new Error(response.data.message || 'Failed to get categories');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get categories');
    }
  },
};