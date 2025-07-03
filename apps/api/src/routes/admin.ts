import { Router } from 'express';
import { requireAuth, requireAdminAuth } from '../middleware/auth';
import adminController from '../controllers/admin/adminController';
import supportController from '../controllers/admin/supportController';

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// ===== ADMIN DASHBOARD =====
router.get('/dashboard/stats', requireAdminAuth(), adminController.getDashboardStats);
router.get('/dashboard/activity', requireAdminAuth(), adminController.getRecentActivity);
router.get('/dashboard/metrics', requireAdminAuth(), adminController.getPlatformMetrics);

// ===== LISTING MODERATION =====
router.get('/listings/pending', requireAdminAuth(['CONTENT_MODERATOR', 'SUPER_ADMIN']), adminController.getPendingListings);
router.post('/listings/:listingId/moderate', requireAdminAuth(['CONTENT_MODERATOR', 'SUPER_ADMIN']), adminController.moderateListing);

// ===== USER MANAGEMENT =====
router.get('/users', requireAdminAuth(['SUPER_ADMIN']), adminController.getAdminUsers);
router.post('/users', requireAdminAuth(['SUPER_ADMIN']), adminController.createAdminUser);

// ===== SUPPORT SYSTEM =====
router.get('/support/tickets', requireAdminAuth(['CUSTOMER_SUPPORT', 'SUPER_ADMIN']), supportController.getSupportTickets);
router.get('/support/tickets/:ticketId', requireAdminAuth(['CUSTOMER_SUPPORT', 'SUPER_ADMIN']), supportController.getSupportTicket);
router.put('/support/tickets/:ticketId', requireAdminAuth(['CUSTOMER_SUPPORT', 'SUPER_ADMIN']), supportController.updateSupportTicket);
router.post('/support/tickets/:ticketId/responses', requireAdminAuth(['CUSTOMER_SUPPORT', 'SUPER_ADMIN']), supportController.addTicketResponse);
router.get('/support/analytics', requireAdminAuth(['CUSTOMER_SUPPORT', 'SUPER_ADMIN']), supportController.getSupportAnalytics);

// ===== PUBLIC SUPPORT (for users to create tickets) =====
router.post('/support/tickets', supportController.createSupportTicket);

export default router;