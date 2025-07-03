import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { MessageController, NotificationController } from '@/controllers/messageController';
import { authenticateToken } from '@/middleware/auth';
import { uploadSingle } from '@/middleware/upload';

const router = Router();

// Rate limiting for messaging operations
const messagingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: {
    error: 'Too many messaging requests',
    message: 'Please try again later',
  },
});

const notificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // 200 requests per window
  message: {
    error: 'Too many notification requests',
    message: 'Please try again later',
  },
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'messages',
    timestamp: new Date().toISOString()
  });
});

// All routes require authentication
router.use(authenticateToken);

// Conversation routes
router.post('/conversations', messagingLimiter, MessageController.createConversation);
router.get('/conversations', messagingLimiter, MessageController.getUserConversations);
router.get('/conversations/:conversationId/messages', messagingLimiter, MessageController.getConversationMessages);
router.post('/conversations/:conversationId/messages/search', messagingLimiter, MessageController.searchMessages);
router.put('/conversations/:conversationId/read', messagingLimiter, MessageController.markConversationAsRead);
router.put('/conversations/:conversationId/block', messagingLimiter, MessageController.toggleConversationBlock);
router.put('/conversations/:conversationId/archive', messagingLimiter, MessageController.archiveConversation);

// Message routes
router.post('/messages', messagingLimiter, MessageController.sendMessage);
router.put('/messages/:messageId/read', messagingLimiter, MessageController.markMessageAsRead);
router.delete('/messages/:messageId', messagingLimiter, MessageController.deleteMessage);
router.post('/messages/:messageId/attachments', messagingLimiter, uploadSingle('file'), MessageController.uploadAttachment);

// Message stats
router.get('/unread-count', messagingLimiter, MessageController.getUnreadCount);

// Notification routes
router.get('/notifications', notificationLimiter, NotificationController.getUserNotifications);
router.put('/notifications/:notificationId/read', notificationLimiter, NotificationController.markNotificationAsRead);
router.put('/notifications/read-all', notificationLimiter, NotificationController.markAllNotificationsAsRead);
router.delete('/notifications/:notificationId', notificationLimiter, NotificationController.deleteNotification);
router.get('/notifications/unread-count', notificationLimiter, NotificationController.getUnreadNotificationsCount);

// Notification settings
router.get('/notification-settings', notificationLimiter, NotificationController.getNotificationSettings);
router.put('/notification-settings', notificationLimiter, NotificationController.updateNotificationSettings);

export default router;