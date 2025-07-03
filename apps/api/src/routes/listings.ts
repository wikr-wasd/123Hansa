import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { ListingController } from '@/controllers/listingController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { uploadMultiple, handleUploadError } from '@/middleware/upload';

const router = Router();

// Rate limiting for listing operations
const listingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per window
  message: {
    error: 'Too many listing requests',
    message: 'Please try again later',
  },
});

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per window
  message: {
    error: 'Too many upload requests',
    message: 'Please try again later',
  },
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'listings',
    timestamp: new Date().toISOString()
  });
});

// Public routes (with optional auth for personalization)
router.get('/search', optionalAuth, ListingController.searchListings);
router.get('/categories', ListingController.getCategories);
router.get('/', optionalAuth, ListingController.getAllListings);
router.get('/:id', optionalAuth, ListingController.getListingById);

// Protected routes (require authentication)
router.use(authenticateToken);

// User's own listings
router.get('/user/my-listings', listingLimiter, ListingController.getMyListings);
router.get('/user/saved', listingLimiter, ListingController.getSavedListings);

// CRUD operations
router.post('/', listingLimiter, ListingController.createListing);
router.put('/:id', listingLimiter, ListingController.updateListing);
router.delete('/:id', listingLimiter, ListingController.deleteListing);

// Listing actions
router.post('/:id/publish', listingLimiter, ListingController.publishListing);
router.post('/:id/save', listingLimiter, ListingController.toggleSaveListing);

// File uploads
router.post(
  '/:id/images',
  uploadLimiter,
  uploadMultiple('images', 10),
  handleUploadError,
  ListingController.uploadImages
);

router.post(
  '/:id/documents',
  uploadLimiter,
  uploadMultiple('documents', 5),
  handleUploadError,
  ListingController.uploadDocuments
);

// File management
router.delete('/images/:imageId', listingLimiter, ListingController.deleteImage);
router.delete('/documents/:documentId', listingLimiter, ListingController.deleteDocument);
router.post('/images/:imageId/set-main', listingLimiter, ListingController.setMainImage);
router.post('/:id/images/reorder', listingLimiter, ListingController.reorderImages);

export default router;