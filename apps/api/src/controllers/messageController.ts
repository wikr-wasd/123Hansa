import { Request, Response } from 'express';
import { messageService } from '@/services/messageService';
import { notificationService } from '@/services/notificationService';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';

export class MessageController {
  /**
   * Create a new conversation
   */
  static async createConversation(req: Request, res: Response) {
    try {
      const { receiverId, listingId, subject, initialMessage } = req.body;
      const initiatorId = req.user!.userId;

      // Validate that user is not trying to message themselves
      if (initiatorId === receiverId) {
        throw createError.badRequest('Cannot create conversation with yourself');
      }

      const conversation = await messageService.createConversation({
        initiatorId,
        receiverId,
        listingId,
        subject,
        initialMessage,
      });

      // Send notification to receiver if initial message was sent
      if (initialMessage && conversation) {
        await notificationService.notifyNewMessage(receiverId, initiatorId, conversation.id, initialMessage);
      }

      res.status(201).json({
        success: true,
        data: { conversation },
        message: 'Conversation created successfully',
      });
    } catch (error) {
      logger.error('Error creating conversation:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to create conversation',
      });
    }
  }

  /**
   * Get user's conversations
   */
  static async getUserConversations(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await messageService.getUserConversations(userId, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'Conversations retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting user conversations:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get conversations',
      });
    }
  }

  /**
   * Get messages in a conversation
   */
  static async getConversationMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;

      const result = await messageService.getConversationMessages(conversationId, userId, page, limit);

      res.json({
        success: true,
        data: result,
        message: 'Messages retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting conversation messages:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get messages',
      });
    }
  }

  /**
   * Send a message
   */
  static async sendMessage(req: Request, res: Response) {
    try {
      const { conversationId, content, type = 'TEXT', metadata } = req.body;
      const senderId = req.user!.userId;

      if (!content || content.trim().length === 0) {
        throw createError.badRequest('Message content cannot be empty');
      }

      const message = await messageService.sendMessage({
        conversationId,
        senderId,
        content: content.trim(),
        type,
        metadata,
      });

      res.status(201).json({
        success: true,
        data: { message },
        message: 'Message sent successfully',
      });
    } catch (error) {
      logger.error('Error sending message:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to send message',
      });
    }
  }

  /**
   * Mark message as read
   */
  static async markMessageAsRead(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;

      await messageService.markAsRead(messageId, userId);

      res.json({
        success: true,
        message: 'Message marked as read',
      });
    } catch (error) {
      logger.error('Error marking message as read:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to mark message as read',
      });
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  static async markConversationAsRead(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user!.userId;

      await messageService.markConversationAsRead(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation marked as read',
      });
    } catch (error) {
      logger.error('Error marking conversation as read:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to mark conversation as read',
      });
    }
  }

  /**
   * Delete a message
   */
  static async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;

      await messageService.deleteMessage(messageId, userId);

      res.json({
        success: true,
        message: 'Message deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting message:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to delete message',
      });
    }
  }

  /**
   * Search messages
   */
  static async searchMessages(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const { query } = req.query;
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      if (!query || typeof query !== 'string' || query.trim().length === 0) {
        throw createError.badRequest('Search query is required');
      }

      const result = await messageService.searchMessages({
        conversationId,
        query: query.trim(),
        userId,
        page,
        limit,
      });

      res.json({
        success: true,
        data: result,
        message: 'Messages searched successfully',
      });
    } catch (error) {
      logger.error('Error searching messages:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to search messages',
      });
    }
  }

  /**
   * Block/unblock conversation
   */
  static async toggleConversationBlock(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user!.userId;

      const result = await messageService.toggleConversationBlock(conversationId, userId);

      res.json({
        success: true,
        data: result,
        message: `Conversation ${result.status.toLowerCase()} successfully`,
      });
    } catch (error) {
      logger.error('Error toggling conversation block:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update conversation status',
      });
    }
  }

  /**
   * Archive conversation
   */
  static async archiveConversation(req: Request, res: Response) {
    try {
      const { conversationId } = req.params;
      const userId = req.user!.userId;

      await messageService.archiveConversation(conversationId, userId);

      res.json({
        success: true,
        message: 'Conversation archived successfully',
      });
    } catch (error) {
      logger.error('Error archiving conversation:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to archive conversation',
      });
    }
  }

  /**
   * Get unread messages count
   */
  static async getUnreadCount(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await messageService.getUnreadMessagesCount(userId);

      res.json({
        success: true,
        data: { count },
        message: 'Unread count retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting unread count:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get unread count',
      });
    }
  }

  /**
   * Upload message attachment
   */
  static async uploadAttachment(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user!.userId;
      const file = req.file;

      if (!file) {
        throw createError.badRequest('No file uploaded');
      }

      const attachment = await messageService.uploadAttachment(messageId, file, userId);

      res.status(201).json({
        success: true,
        data: { attachment },
        message: 'Attachment uploaded successfully',
      });
    } catch (error) {
      logger.error('Error uploading attachment:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to upload attachment',
      });
    }
  }
}

export class NotificationController {
  /**
   * Get user notifications
   */
  static async getUserNotifications(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const unreadOnly = req.query.unreadOnly === 'true';

      const result = await notificationService.getUserNotifications(userId, page, limit, unreadOnly);

      res.json({
        success: true,
        data: result,
        message: 'Notifications retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting user notifications:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get notifications',
      });
    }
  }

  /**
   * Mark notification as read
   */
  static async markNotificationAsRead(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.userId;

      await notificationService.markAsRead(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification marked as read',
      });
    } catch (error) {
      logger.error('Error marking notification as read:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to mark notification as read',
      });
    }
  }

  /**
   * Mark all notifications as read
   */
  static async markAllNotificationsAsRead(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      await notificationService.markAllAsRead(userId);

      res.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } catch (error) {
      logger.error('Error marking all notifications as read:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to mark notifications as read',
      });
    }
  }

  /**
   * Get unread notifications count
   */
  static async getUnreadNotificationsCount(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const count = await notificationService.getUnreadCount(userId);

      res.json({
        success: true,
        data: { count },
        message: 'Unread count retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting unread notifications count:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get unread count',
      });
    }
  }

  /**
   * Delete notification
   */
  static async deleteNotification(req: Request, res: Response) {
    try {
      const { notificationId } = req.params;
      const userId = req.user!.userId;

      await notificationService.deleteNotification(notificationId, userId);

      res.json({
        success: true,
        message: 'Notification deleted successfully',
      });
    } catch (error) {
      logger.error('Error deleting notification:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to delete notification',
      });
    }
  }

  /**
   * Get user notification settings
   */
  static async getNotificationSettings(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const settings = await notificationService.getUserSettings(userId);

      res.json({
        success: true,
        data: { settings },
        message: 'Notification settings retrieved successfully',
      });
    } catch (error) {
      logger.error('Error getting notification settings:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to get notification settings',
      });
    }
  }

  /**
   * Update user notification settings
   */
  static async updateNotificationSettings(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const preferences = req.body;

      const settings = await notificationService.updateUserSettings(userId, preferences);

      res.json({
        success: true,
        data: { settings },
        message: 'Notification settings updated successfully',
      });
    } catch (error) {
      logger.error('Error updating notification settings:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Failed to update notification settings',
      });
    }
  }
}