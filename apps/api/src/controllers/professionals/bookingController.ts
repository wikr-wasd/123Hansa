import { Request, Response, NextFunction } from 'express';
import { BookingService } from '../../services/professionals/bookingService';
import { BookingStatus, ServiceType, ConsultationFormat } from '@prisma/client';
import { createError } from '../../utils/customError';
import { z } from 'zod';

// Validation schemas
const createBookingSchema = z.object({
  professionalId: z.string().min(1, 'Professional ID is required'),
  serviceListingId: z.string().optional(),
  bookingType: z.nativeEnum(ServiceType),
  consultationFormat: z.nativeEnum(ConsultationFormat),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required').max(2000),
  requirements: z.array(z.string()).default([]),
  deliverables: z.array(z.string()).default([]),
  requestedStartDate: z.string().datetime().transform(str => new Date(str)).optional(),
  agreedPrice: z.number().min(0, 'Agreed price must be non-negative'),
  hourlyRate: z.number().min(0).optional(),
  estimatedHours: z.number().min(0).optional(),
  clientNotes: z.string().max(1000).optional(),
  depositRequired: z.boolean().default(false),
  depositAmount: z.number().min(0).optional()
});

const updateBookingSchema = z.object({
  status: z.nativeEnum(BookingStatus).optional(),
  confirmedStartDate: z.string().datetime().transform(str => new Date(str)).optional(),
  estimatedEndDate: z.string().datetime().transform(str => new Date(str)).optional(),
  professionalNotes: z.string().max(1000).optional(),
  meetingLink: z.string().url().optional(),
  meetingPassword: z.string().optional(),
  meetingLocation: z.string().max(500).optional(),
  contractSigned: z.boolean().optional(),
  ndaSigned: z.boolean().optional()
});

const cancelBookingSchema = z.object({
  reason: z.string().min(1, 'Cancellation reason is required').max(500)
});

export class BookingController {
  /**
   * Create a new booking
   * POST /api/bookings
   */
  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const clientId = req.user?.id;
      if (!clientId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = createBookingSchema.parse(req.body);
      
      const booking = await BookingService.createBooking({
        ...validatedData,
        clientId
      });
      
      res.status(201).json({
        success: true,
        data: booking,
        message: 'Booking created successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update booking
   * PUT /api/bookings/:id
   */
  static async updateBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const validatedData = updateBookingSchema.parse(req.body);
      
      const booking = await BookingService.updateBooking(id, userId, validatedData);
      
      res.json({
        success: true,
        data: booking,
        message: 'Booking updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking by ID
   * GET /api/bookings/:id
   */
  static async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      const booking = await BookingService.getBookingById(id, userId);
      
      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user's bookings (as client)
   * GET /api/bookings/my-bookings
   */
  static async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { status } = req.query;
      
      const bookings = await BookingService.getUserBookings(
        userId, 
        'client', 
        status as BookingStatus
      );
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get professional's bookings
   * GET /api/bookings/professional-bookings
   */
  static async getProfessionalBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { status } = req.query;
      
      const bookings = await BookingService.getUserBookings(
        userId, 
        'professional', 
        status as BookingStatus
      );
      
      res.json({
        success: true,
        data: bookings
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel booking
   * POST /api/bookings/:id/cancel
   */
  static async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { reason } = cancelBookingSchema.parse(req.body);
      
      const booking = await BookingService.cancelBooking(id, userId, reason);
      
      res.json({
        success: true,
        data: booking,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get professional's schedule
   * GET /api/bookings/professional/:professionalId/schedule
   */
  static async getProfessionalSchedule(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const { fromDate, toDate } = req.query;
      
      if (!fromDate || !toDate) {
        throw createError.badRequest('fromDate and toDate are required');
      }
      
      const schedule = await BookingService.getProfessionalSchedule(
        professionalId,
        new Date(fromDate as string),
        new Date(toDate as string)
      );
      
      res.json({
        success: true,
        data: schedule
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Confirm booking (professional only)
   * POST /api/bookings/:id/confirm
   */
  static async confirmBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { confirmedStartDate, estimatedEndDate, meetingLink, professionalNotes } = req.body;
      
      const booking = await BookingService.updateBooking(id, userId, {
        status: BookingStatus.CONFIRMED,
        confirmedStartDate: confirmedStartDate ? new Date(confirmedStartDate) : undefined,
        estimatedEndDate: estimatedEndDate ? new Date(estimatedEndDate) : undefined,
        meetingLink,
        professionalNotes
      });
      
      res.json({
        success: true,
        data: booking,
        message: 'Booking confirmed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Start booking (professional only)
   * POST /api/bookings/:id/start
   */
  static async startBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }
      
      const booking = await BookingService.updateBooking(id, userId, {
        status: BookingStatus.IN_PROGRESS
      });
      
      res.json({
        success: true,
        data: booking,
        message: 'Booking started successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Complete booking (professional only)
   * POST /api/bookings/:id/complete
   */
  static async completeBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { actualHours, professionalNotes } = req.body;
      
      const updateData: any = {
        status: BookingStatus.COMPLETED
      };
      
      if (actualHours !== undefined) {
        updateData.actualHours = actualHours;
      }
      
      if (professionalNotes) {
        updateData.professionalNotes = professionalNotes;
      }
      
      const booking = await BookingService.updateBooking(id, userId, updateData);
      
      res.json({
        success: true,
        data: booking,
        message: 'Booking completed successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reschedule booking
   * POST /api/bookings/:id/reschedule
   */
  static async rescheduleBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { newStartDate, newEndDate, reason } = req.body;
      
      if (!newStartDate) {
        throw createError.badRequest('New start date is required');
      }
      
      const booking = await BookingService.updateBooking(id, userId, {
        status: BookingStatus.RESCHEDULED,
        confirmedStartDate: new Date(newStartDate),
        estimatedEndDate: newEndDate ? new Date(newEndDate) : undefined,
        professionalNotes: reason || 'Booking rescheduled'
      });
      
      res.json({
        success: true,
        data: booking,
        message: 'Booking rescheduled successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check booking conflicts
   * POST /api/bookings/check-conflicts
   */
  static async checkBookingConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId, startDate, endDate, excludeBookingId } = req.body;
      
      if (!professionalId || !startDate || !endDate) {
        throw createError.badRequest('Professional ID, start date, and end date are required');
      }
      
      const conflicts = await BookingService.checkBookingConflicts(
        professionalId,
        new Date(startDate),
        new Date(endDate),
        excludeBookingId
      );
      
      res.json({
        success: true,
        data: {
          hasConflicts: conflicts.length > 0,
          conflicts
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get booking statistics
   * GET /api/bookings/stats
   */
  static async getBookingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { role = 'client' } = req.query;
      
      const bookings = await BookingService.getUserBookings(userId, role as 'client' | 'professional');
      
      const stats = {
        total: bookings.length,
        pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
        confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
        inProgress: bookings.filter(b => b.status === BookingStatus.IN_PROGRESS).length,
        completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
        cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
        totalValue: bookings.reduce((sum, b) => sum + Number(b.agreedPrice), 0),
        averageValue: bookings.length > 0 
          ? bookings.reduce((sum, b) => sum + Number(b.agreedPrice), 0) / bookings.length 
          : 0
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
   * Upload booking documents
   * POST /api/bookings/:id/documents
   */
  static async uploadBookingDocuments(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const userId = req.user?.id;
      
      if (!userId) {
        throw createError.unauthorized('Authentication required');
      }

      const { documents } = req.body;
      
      if (!documents || !Array.isArray(documents)) {
        throw createError.badRequest('Documents array is required');
      }
      
      // Get current booking and add documents
      const currentBooking = await BookingService.getBookingById(id, userId);
      const updatedDocuments = [...(currentBooking.documents || []), ...documents];
      
      const booking = await BookingService.updateBooking(id, userId, {
        documents: updatedDocuments
      });
      
      res.json({
        success: true,
        data: booking,
        message: 'Documents uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}