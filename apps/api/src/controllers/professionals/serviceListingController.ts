import { Request, Response, NextFunction } from 'express';
import { ServiceListingService } from '../../services/professionals/serviceListingService';
import { ServiceCategory, ServiceType, ConsultationFormat } from '@prisma/client';
import { createError } from '../../utils/customError';
import { z } from 'zod';

// Validation schemas
const searchServiceListingsSchema = z.object({
  category: z.nativeEnum(ServiceCategory).optional(),
  serviceType: z.nativeEnum(ServiceType).optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  consultationFormat: z.nativeEnum(ConsultationFormat).optional(),
  location: z.string().optional(),
  keywords: z.string().optional(),
  verified: z.coerce.boolean().optional(),
  sortBy: z.enum(['price', 'rating', 'popularity', 'recent']).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  offset: z.coerce.number().min(0).optional()
});

const createServiceListingSchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(5000),
  shortDescription: z.string().max(500).optional(),
  category: z.nativeEnum(ServiceCategory),
  serviceType: z.nativeEnum(ServiceType),
  basePrice: z.number().min(0, 'Base price must be non-negative'),
  pricingModel: z.enum(['HOURLY', 'FIXED', 'CUSTOM']).optional(),
  minimumEngagement: z.number().min(0).optional(),
  estimatedDuration: z.string().optional(),
  deliverables: z.array(z.string()).min(1, 'At least one deliverable is required'),
  prerequisites: z.array(z.string()).default([]),
  consultationFormats: z.array(z.nativeEnum(ConsultationFormat)).min(1, 'At least one consultation format is required'),
  tags: z.array(z.string()).default([]),
  searchKeywords: z.array(z.string()).default([]),
  maxConcurrentJobs: z.number().min(1).optional(),
  leadTime: z.number().min(0).optional()
});

const updateServiceListingSchema = createServiceListingSchema.partial().omit(['professionalId']);

export class ServiceListingController {
  /**
   * Search service listings
   * GET /api/services/search
   */
  static async searchServiceListings(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = searchServiceListingsSchema.parse(req.query);
      
      const result = await ServiceListingService.searchServiceListings(validatedQuery);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service listing by ID
   * GET /api/services/:id
   */
  static async getServiceListingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const service = await ServiceListingService.getServiceListingById(id, userId);
      
      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create service listing
   * POST /api/services
   */
  static async createServiceListing(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = createServiceListingSchema.parse(req.body);
      
      const service = await ServiceListingService.createServiceListing({
        ...validatedData,
        userId
      });
      
      res.status(201).json({
        success: true,
        data: service,
        message: 'Service listing created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update service listing
   * PUT /api/services/:id
   */
  static async updateServiceListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = updateServiceListingSchema.parse(req.body);
      
      const service = await ServiceListingService.updateServiceListing(id, userId, validatedData);
      
      res.json({
        success: true,
        data: service,
        message: 'Service listing updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete service listing
   * DELETE /api/services/:id
   */
  static async deleteServiceListing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }
      
      const result = await ServiceListingService.deleteServiceListing(id, userId);
      
      res.json({
        success: true,
        data: result,
        message: 'Service listing deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get similar services
   * GET /api/services/:id/similar
   */
  static async getSimilarServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { limit = 5 } = req.query;
      
      const services = await ServiceListingService.getSimilarServices(id, Number(limit));
      
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get professional's service listings
   * GET /api/services/professional/:professionalId
   */
  static async getProfessionalServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const { includeInactive = false } = req.query;
      const userId = req.user?.id;
      
      // Only allow viewing inactive services if it's the owner
      const includeInactiveServices = includeInactive === 'true' && userId;
      
      const services = await ServiceListingService.getProfessionalServices(
        professionalId, 
        includeInactiveServices
      );
      
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get my service listings
   * GET /api/services/my-services
   */
  static async getMyServices(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      // First, find the user's professional profile
      const professionals = await ServiceListingService.searchServiceListings({
        limit: 1000 // High limit to find user's profile
      });
      
      const userProfessionalProfile = professionals.services.find(s => s.userId === userId)?.professionalId;
      
      if (!userProfessionalProfile) {
        return res.json({
          success: true,
          data: [],
          message: 'No professional profile found'
        });
      }
      
      const services = await ServiceListingService.getProfessionalServices(userProfessionalProfile, true);
      
      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service categories with counts
   * GET /api/services/categories
   */
  static async getServiceCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ServiceListingService.getServiceCategoriesWithCounts();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle service listing active status
   * PATCH /api/services/:id/toggle-active
   */
  static async toggleServiceActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      // Get current service to toggle its status
      const currentService = await ServiceListingService.getServiceListingById(id, userId);
      
      const service = await ServiceListingService.updateServiceListing(id, userId, {
        isActive: !currentService.isActive
      });
      
      res.json({
        success: true,
        data: service,
        message: `Service listing ${service.isActive ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get featured services
   * GET /api/services/featured
   */
  static async getFeaturedServices(req: Request, res: Response, next: NextFunction) {
    try {
      const { limit = 10 } = req.query;
      
      // For now, return top-rated services as "featured"
      const result = await ServiceListingService.searchServiceListings({
        verified: true,
        sortBy: 'rating',
        limit: Number(limit),
        offset: 0
      });
      
      res.json({
        success: true,
        data: result.services
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get services by category
   * GET /api/services/category/:category
   */
  static async getServicesByCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const { limit = 20, offset = 0, sortBy = 'rating' } = req.query;
      
      if (!Object.values(ServiceCategory).includes(category as ServiceCategory)) {
        throw createError.badRequest('Invalid service category');
      }
      
      const result = await ServiceListingService.searchServiceListings({
        category: category as ServiceCategory,
        sortBy: sortBy as any,
        limit: Number(limit),
        offset: Number(offset)
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service pricing information
   * GET /api/services/:id/pricing
   */
  static async getServicePricing(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { hours, additionalServices } = req.query;
      
      const service = await ServiceListingService.getServiceListingById(id);
      
      let totalPrice = service.basePrice;
      let breakdown = {
        basePrice: service.basePrice,
        currency: service.currency,
        pricingModel: service.pricingModel
      };
      
      // Calculate pricing based on hours if hourly model
      if (service.pricingModel === 'HOURLY' && hours) {
        totalPrice = service.basePrice * Number(hours);
        breakdown = {
          ...breakdown,
          hours: Number(hours),
          hourlyRate: service.basePrice,
          subtotal: totalPrice
        };
      }
      
      // Add platform commission (10%)
      const platformFee = totalPrice * 0.10;
      const finalPrice = totalPrice + platformFee;
      
      res.json({
        success: true,
        data: {
          ...breakdown,
          platformFee,
          totalPrice: finalPrice,
          minimumEngagement: service.minimumEngagement,
          estimatedDuration: service.estimatedDuration
        }
      });
    } catch (error) {
      next(error);
    }
  }
}