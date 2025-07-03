import { Router } from 'express';
import { ConsultationService } from '../services/professionals/consultationService';
import { ReviewService } from '../services/professionals/reviewService';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
import { createError } from '../utils/customError';
import { ServiceCategory, ConsultationFormat } from '@prisma/client';

const router = Router();

// Validation schemas
const createConsultationRequestSchema = z.object({
  professionalId: z.string().optional(),
  serviceListingId: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  urgency: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).default('NORMAL'),
  budget: z.number().min(0).optional(),
  preferredFormat: z.nativeEnum(ConsultationFormat),
  preferredDates: z.array(z.object({
    date: z.string().datetime(),
    timeSlots: z.array(z.string())
  })).min(1, 'At least one preferred date is required'),
  estimatedDuration: z.string().optional(),
  requiredExpertise: z.array(z.nativeEnum(ServiceCategory)).min(1, 'At least one area of expertise is required'),
  specificRequirements: z.array(z.string()).default([]),
  confidentiality: z.boolean().default(true),
  preferredLocation: z.string().optional(),
  canTravel: z.boolean().default(false)
});

const respondToConsultationSchema = z.object({
  professionalResponse: z.string().min(1, 'Professional response is required').max(1000),
  quotedPrice: z.number().min(0, 'Quoted price must be non-negative'),
  quotedDuration: z.string().min(1, 'Quoted duration is required'),
  proposedDates: z.array(z.object({
    date: z.string().datetime(),
    timeSlots: z.array(z.string())
  })).min(1, 'At least one proposed date is required')
});

const updateConsultationStatusSchema = z.object({
  status: z.enum(['ACCEPTED', 'DECLINED']),
  declineReason: z.string().optional()
});

const createReviewSchema = z.object({
  bookingId: z.string().min(1, 'Booking ID is required'),
  professionalId: z.string().min(1, 'Professional ID is required'),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
  communicationRating: z.number().int().min(1).max(5).optional(),
  expertiseRating: z.number().int().min(1).max(5).optional(),
  timelinessRating: z.number().int().min(1).max(5).optional(),
  valueRating: z.number().int().min(1).max(5).optional(),
  wouldRecommend: z.boolean().default(true),
  isAnonymous: z.boolean().default(false)
});

const professionalResponseSchema = z.object({
  professionalResponse: z.string().min(1, 'Professional response is required').max(1000)
});

// Consultation Request Routes

/**
 * Create consultation request
 * POST /api/consultations/requests
 */
router.post('/requests',
  requireAuth,
  rateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }), // 10 requests per hour
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = createConsultationRequestSchema.parse(req.body);
      
      const consultationRequest = await ConsultationService.createConsultationRequest({
        ...validatedData,
        clientId
      });
      
      res.status(201).json({
        success: true,
        data: consultationRequest,
        message: 'Consultation request created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Respond to consultation request (professional)
 * POST /api/consultations/requests/:id/respond
 */
router.post('/requests/:id/respond',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 60 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = respondToConsultationSchema.parse(req.body);
      
      const consultationRequest = await ConsultationService.respondToConsultationRequest(
        id, 
        professionalId, 
        validatedData
      );
      
      res.json({
        success: true,
        data: consultationRequest,
        message: 'Response sent successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Update consultation status (client)
 * PUT /api/consultations/requests/:id/status
 */
router.put('/requests/:id/status',
  requireAuth,
  rateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const clientId = req.user?.id;
      
      if (!clientId) {
        throw createError.unauthorized('Authentication required');
      }

      const { status, declineReason } = updateConsultationStatusSchema.parse(req.body);
      
      const consultationRequest = await ConsultationService.updateConsultationStatus(
        id, 
        clientId, 
        status,
        declineReason
      );
      
      res.json({
        success: true,
        data: consultationRequest,
        message: `Consultation ${status.toLowerCase()} successfully`
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get client's consultation requests
 * GET /api/consultations/requests/my-requests
 */
router.get('/requests/my-requests',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        throw createError.unauthorized('Authentication required');
      }

      const { status } = req.query;
      
      const requests = await ConsultationService.getClientConsultationRequests(
        clientId, 
        status as string
      );
      
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get professional's consultation requests
 * GET /api/consultations/requests/professional-requests
 */
router.get('/requests/professional-requests',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const professionalId = req.user?.id;
      if (!professionalId) {
        throw createError.unauthorized('Authentication required');
      }

      const { status } = req.query;
      
      const requests = await ConsultationService.getProfessionalConsultationRequests(
        professionalId, 
        status as string
      );
      
      res.json({
        success: true,
        data: requests
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get consultation request by ID
 * GET /api/consultations/requests/:id
 */
router.get('/requests/:id',
  requireAuth,
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }
      
      const request = await ConsultationService.getConsultationRequestById(id, userId);
      
      res.json({
        success: true,
        data: request
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get consultation statistics
 * GET /api/consultations/stats
 */
router.get('/stats',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { role = 'client' } = req.query;
      
      const stats = await ConsultationService.getConsultationStats(
        userId, 
        role as 'client' | 'professional'
      );
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

// Review Routes

/**
 * Create review
 * POST /api/consultations/reviews
 */
router.post('/reviews',
  requireAuth,
  rateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }), // 5 reviews per hour
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = createReviewSchema.parse(req.body);
      
      const review = await ReviewService.createReview({
        ...validatedData,
        clientId
      });
      
      res.status(201).json({
        success: true,
        data: review,
        message: 'Review created successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Professional responds to review
 * POST /api/consultations/reviews/:id/respond
 */
router.post('/reviews/:id/respond',
  requireAuth,
  rateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const professionalId = req.user?.id;
      
      if (!professionalId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = professionalResponseSchema.parse(req.body);
      
      const review = await ReviewService.respondToReview(id, professionalId, validatedData);
      
      res.json({
        success: true,
        data: review,
        message: 'Response added successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get professional's reviews
 * GET /api/consultations/reviews/professional/:professionalId
 */
router.get('/reviews/professional/:professionalId',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { professionalId } = req.params;
      const { 
        limit = 20, 
        offset = 0, 
        rating, 
        includeAnonymous = true, 
        sortBy = 'date' 
      } = req.query;
      
      const result = await ReviewService.getProfessionalReviews(professionalId, {
        limit: Number(limit),
        offset: Number(offset),
        rating: rating ? Number(rating) : undefined,
        includeAnonymous: includeAnonymous === 'true',
        sortBy: sortBy as 'date' | 'rating'
      });
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get professional's review statistics
 * GET /api/consultations/reviews/professional/:professionalId/stats
 */
router.get('/reviews/professional/:professionalId/stats',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { professionalId } = req.params;
      
      const stats = await ReviewService.getProfessionalReviewStats(professionalId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get client's reviews
 * GET /api/consultations/reviews/my-reviews
 */
router.get('/reviews/my-reviews',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        throw createError.unauthorized('Authentication required');
      }
      
      const reviews = await ReviewService.getClientReviews(clientId);
      
      res.json({
        success: true,
        data: reviews
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get review by ID
 * GET /api/consultations/reviews/:id
 */
router.get('/reviews/:id',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      
      const review = await ReviewService.getReviewById(id);
      
      res.json({
        success: true,
        data: review
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Flag review for moderation
 * POST /api/consultations/reviews/:id/flag
 */
router.post('/reviews/:id/flag',
  requireAuth,
  rateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      const { reason } = req.body;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      if (!reason) {
        throw createError.badRequest('Reason for flagging is required');
      }
      
      const result = await ReviewService.flagReview(id, reason, userId);
      
      res.json({
        success: true,
        data: result,
        message: 'Review flagged for moderation'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;