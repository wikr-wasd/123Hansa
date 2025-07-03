import { Router } from 'express';
import { ProfessionalController } from '../controllers/professionals/professionalController';
import { ServiceListingController } from '../controllers/professionals/serviceListingController';
import { BookingController } from '../controllers/professionals/bookingController';
import { requireAuth, requireRole } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
// import { UserRole } from '@prisma/client'; // TODO: Add UserRole enum to schema

const router = Router();

// Professional Profiles Routes
router.get('/search', 
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }), // 100 requests per 15 minutes
  ProfessionalController.searchProfessionals
);

router.get('/categories',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ProfessionalController.getServiceCategories
);

router.get('/by-expertise/:category',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  ProfessionalController.getProfessionalsByExpertise
);

router.get('/profile/me',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ProfessionalController.getMyProfessionalProfile
);

router.post('/profile',
  requireAuth,
  requireRole([
    'LEGAL_ADVISOR',
    'BUSINESS_BROKER', 
    'ACCOUNTANT',
    'FINANCIAL_ADVISOR',
    'CONSULTANT',
    'VALUATION_EXPERT'
  ]),
  rateLimit({ maxRequests: 5, windowMs: 60 * 60 * 1000 }), // 5 requests per hour
  ProfessionalController.createProfessionalProfile
);

router.put('/profile/:id',
  requireAuth,
  rateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000 }),
  ProfessionalController.updateProfessionalProfile
);

router.post('/profile/:id/verify',
  requireAuth,
  rateLimit({ maxRequests: 3, windowMs: 24 * 60 * 60 * 1000 }), // 3 requests per day
  ProfessionalController.submitForVerification
);

router.get('/:id',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  ProfessionalController.getProfessionalById
);

router.get('/:id/availability',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ProfessionalController.getProfessionalAvailability
);

router.get('/:id/stats',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ProfessionalController.getProfessionalStats
);

// Service Listings Routes
router.get('/services/search',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.searchServiceListings
);

router.get('/services/categories',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getServiceCategories
);

router.get('/services/featured',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getFeaturedServices
);

router.get('/services/category/:category',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getServicesByCategory
);

router.get('/services/my-services',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getMyServices
);

router.post('/services',
  requireAuth,
  rateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }), // 10 services per hour
  ServiceListingController.createServiceListing
);

router.get('/services/professional/:professionalId',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getProfessionalServices
);

router.get('/services/:id',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getServiceListingById
);

router.put('/services/:id',
  requireAuth,
  rateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000 }),
  ServiceListingController.updateServiceListing
);

router.delete('/services/:id',
  requireAuth,
  rateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }),
  ServiceListingController.deleteServiceListing
);

router.patch('/services/:id/toggle-active',
  requireAuth,
  rateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000 }),
  ServiceListingController.toggleServiceActive
);

router.get('/services/:id/similar',
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getSimilarServices
);

router.get('/services/:id/pricing',
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  ServiceListingController.getServicePricing
);

// Bookings Routes
router.post('/bookings',
  requireAuth,
  rateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000 }), // 20 bookings per hour
  BookingController.createBooking
);

router.get('/bookings/my-bookings',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  BookingController.getMyBookings
);

router.get('/bookings/professional-bookings',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  BookingController.getProfessionalBookings
);

router.get('/bookings/stats',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 15 * 60 * 1000 }),
  BookingController.getBookingStats
);

router.post('/bookings/check-conflicts',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  BookingController.checkBookingConflicts
);

router.get('/bookings/professional/:professionalId/schedule',
  requireAuth,
  rateLimit({ maxRequests: 50, windowMs: 15 * 60 * 1000 }),
  BookingController.getProfessionalSchedule
);

router.get('/bookings/:id',
  requireAuth,
  rateLimit({ maxRequests: 100, windowMs: 15 * 60 * 1000 }),
  BookingController.getBookingById
);

router.put('/bookings/:id',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 60 * 60 * 1000 }),
  BookingController.updateBooking
);

router.post('/bookings/:id/cancel',
  requireAuth,
  rateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }),
  BookingController.cancelBooking
);

router.post('/bookings/:id/confirm',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 60 * 60 * 1000 }),
  BookingController.confirmBooking
);

router.post('/bookings/:id/start',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 60 * 60 * 1000 }),
  BookingController.startBooking
);

router.post('/bookings/:id/complete',
  requireAuth,
  rateLimit({ maxRequests: 30, windowMs: 60 * 60 * 1000 }),
  BookingController.completeBooking
);

router.post('/bookings/:id/reschedule',
  requireAuth,
  rateLimit({ maxRequests: 10, windowMs: 60 * 60 * 1000 }),
  BookingController.rescheduleBooking
);

router.post('/bookings/:id/documents',
  requireAuth,
  rateLimit({ maxRequests: 20, windowMs: 60 * 60 * 1000 }),
  BookingController.uploadBookingDocuments
);

export default router;