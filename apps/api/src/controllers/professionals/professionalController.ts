import { Request, Response, NextFunction } from 'express';
import { ProfessionalService } from '../../services/professionals/professionalService';
import { ServiceCategory, ProfessionalVerificationStatus } from '@prisma/client';
import { createError } from '../../utils/customError';
import { z } from 'zod';

// Validation schemas
const searchProfessionalsSchema = z.object({
  category: z.nativeEnum(ServiceCategory).optional(),
  location: z.string().optional(),
  priceMin: z.coerce.number().min(0).optional(),
  priceMax: z.coerce.number().min(0).optional(),
  rating: z.coerce.number().min(1).max(5).optional(),
  verified: z.coerce.boolean().optional(),
  languages: z.string().transform(str => str.split(',')).optional(),
  availability: z.enum(['immediate', 'this_week', 'this_month']).optional(),
  sortBy: z.enum(['rating', 'price', 'experience', 'recent']).optional(),
  limit: z.coerce.number().min(1).max(50).optional(),
  offset: z.coerce.number().min(0).optional()
});

const createProfessionalProfileSchema = z.object({
  businessName: z.string().optional(),
  registrationNumber: z.string().optional(),
  vatNumber: z.string().optional(),
  professionalTitle: z.string().min(1, 'Professional title is required'),
  serviceCategories: z.array(z.nativeEnum(ServiceCategory)).min(1, 'At least one service category is required'),
  specializations: z.array(z.string()).min(1, 'At least one specialization is required'),
  languages: z.array(z.string()).min(1, 'At least one language is required'),
  credentials: z.object({
    education: z.array(z.object({
      degree: z.string(),
      institution: z.string(),
      year: z.number(),
      field: z.string()
    })).optional(),
    certifications: z.array(z.object({
      name: z.string(),
      issuer: z.string(),
      year: z.number(),
      expiryDate: z.string().optional()
    })).optional(),
    licenses: z.array(z.object({
      name: z.string(),
      number: z.string(),
      issuer: z.string(),
      expiryDate: z.string().optional()
    })).optional()
  }),
  experience: z.object({
    yearsOfExperience: z.number().min(0),
    notableCases: z.array(z.object({
      title: z.string(),
      description: z.string(),
      year: z.number(),
      outcome: z.string().optional()
    })).optional(),
    previousRoles: z.array(z.object({
      title: z.string(),
      company: z.string(),
      startYear: z.number(),
      endYear: z.number().optional(),
      description: z.string()
    })).optional()
  }),
  hourlyRate: z.number().min(0).optional(),
  consultationFee: z.number().min(0).optional(),
  bio: z.string().max(2000).optional(),
  workingHours: z.object({
    monday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional(),
    tuesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional(),
    wednesday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional(),
    thursday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional(),
    friday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional(),
    saturday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional(),
    sunday: z.object({ start: z.string(), end: z.string(), available: z.boolean() }).optional()
  }).optional()
});

const updateProfessionalProfileSchema = createProfessionalProfileSchema.partial();

export class ProfessionalController {
  /**
   * Search professionals
   * GET /api/professionals/search
   */
  static async searchProfessionals(req: Request, res: Response, next: NextFunction) {
    try {
      const validatedQuery = searchProfessionalsSchema.parse(req.query);
      
      const result = await ProfessionalService.searchProfessionals(validatedQuery);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get professional by ID
   * GET /api/professionals/:id
   */
  static async getProfessionalById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const professional = await ProfessionalService.getProfessionalById(id);
      
      res.json({
        success: true,
        data: professional
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create professional profile
   * POST /api/professionals/profile
   */
  static async createProfessionalProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = createProfessionalProfileSchema.parse(req.body);
      
      const profile = await ProfessionalService.createProfessionalProfile({
        ...validatedData,
        userId
      });
      
      res.status(201).json({
        success: true,
        data: profile,
        message: 'Professional profile created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update professional profile
   * PUT /api/professionals/profile/:id
   */
  static async updateProfessionalProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = updateProfessionalProfileSchema.parse(req.body);
      
      const profile = await ProfessionalService.updateProfessionalProfile(id, {
        ...validatedData,
        userId
      });
      
      res.json({
        success: true,
        data: profile,
        message: 'Professional profile updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get professional's availability
   * GET /api/professionals/:id/availability
   */
  static async getProfessionalAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { fromDate, toDate } = req.query;
      
      const from = fromDate ? new Date(fromDate as string) : undefined;
      const to = toDate ? new Date(toDate as string) : undefined;
      
      const availability = await ProfessionalService.getProfessionalAvailability(id, from, to);
      
      res.json({
        success: true,
        data: availability
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Submit professional for verification
   * POST /api/professionals/profile/:id/verify
   */
  static async submitForVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { documents } = req.body;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      if (!documents || !Array.isArray(documents)) {
        throw createError.badRequest('Verification documents are required');
      }
      
      const profile = await ProfessionalService.submitForVerification(id, documents);
      
      res.json({
        success: true,
        data: profile,
        message: 'Verification request submitted successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get service categories with professional counts
   * GET /api/professionals/categories
   */
  static async getServiceCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await ProfessionalService.getServiceCategoriesWithCounts();
      
      res.json({
        success: true,
        data: categories
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user's professional profile
   * GET /api/professionals/profile/me
   */
  static async getMyProfessionalProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      // Find professional profile by user ID
      const professionals = await ProfessionalService.searchProfessionals({
        limit: 1,
        offset: 0
      });
      
      const userProfile = professionals.professionals.find(p => p.userId === userId);
      
      if (!userProfile) {
        return res.json({
          success: true,
          data: null,
          message: 'No professional profile found'
        });
      }
      
      res.json({
        success: true,
        data: userProfile
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get professional profile statistics
   * GET /api/professionals/:id/stats
   */
  static async getProfessionalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      
      const professional = await ProfessionalService.getProfessionalById(id);
      
      const stats = {
        totalBookings: professional.totalBookings,
        completedBookings: professional.completedBookings,
        totalReviews: professional.totalReviews,
        averageRating: professional.averageRating,
        responseRate: 0.95, // Placeholder - calculate from consultation requests
        averageResponseTime: '2 hours', // Placeholder
        completionRate: professional.totalBookings > 0 
          ? (professional.completedBookings / professional.totalBookings) * 100 
          : 0,
        verificationStatus: professional.verificationStatus,
        joinedDate: professional.createdAt,
        activeListings: professional.serviceListings?.length || 0
      };
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search professionals by expertise (public endpoint)
   * GET /api/professionals/by-expertise/:category
   */
  static async getProfessionalsByExpertise(req: Request, res: Response, next: NextFunction) {
    try {
      const { category } = req.params;
      const { limit = 10, offset = 0 } = req.query;
      
      if (!Object.values(ServiceCategory).includes(category as ServiceCategory)) {
        throw createError.badRequest('Invalid service category');
      }
      
      const result = await ProfessionalService.searchProfessionals({
        category: category as ServiceCategory,
        verified: true,
        sortBy: 'rating',
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
}