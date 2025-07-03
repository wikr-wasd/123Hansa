import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { createError } from '@/middleware/errorHandler';
import crypto from 'crypto';
import { MessageType, MessageStatus, ConversationStatus } from '@prisma/client';

interface CreateMessageData {
  conversationId: string;
  senderId: string;
  content: string;
  type?: MessageType;
  metadata?: any;
}

interface CreateConversationData {
  initiatorId: string;
  receiverId: string;
  listingId?: string;
  subject?: string;
  initialMessage?: string;
}

interface SearchMessagesOptions {
  conversationId: string;
  query: string;
  userId: string;
  page?: number;
  limit?: number;
}

export class MessageService {
  // Encryption key for sensitive messages
  private encryptionKey: string;

  constructor() {
    this.encryptionKey = process.env.MESSAGE_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Create a new conversation
   */
  async createConversation(data: CreateConversationData) {
    try {
      // Check if conversation already exists for this listing
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          OR: [
            {
              initiatorId: data.initiatorId,
              receiverId: data.receiverId,
              listingId: data.listingId,
            },
            {
              initiatorId: data.receiverId,
              receiverId: data.initiatorId,
              listingId: data.listingId,
            },
          ],
        },
        include: {
          initiator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              askingPrice: true,
              currency: true,
            },
          },
        },
      });

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const conversation = await prisma.conversation.create({
        data: {
          initiatorId: data.initiatorId,
          receiverId: data.receiverId,
          listingId: data.listingId,
          subject: data.subject,
          status: 'ACTIVE',
          lastMessageAt: new Date(),
        },
        include: {
          initiator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              askingPrice: true,
              currency: true,
            },
          },
        },
      });

      // Send initial message if provided
      if (data.initialMessage) {
        await this.sendMessage({
          conversationId: conversation.id,
          senderId: data.initiatorId,
          content: data.initialMessage,
          type: 'INQUIRY',
        });
      }

      logger.info(`New conversation created between ${data.initiatorId} and ${data.receiverId}`);
      return conversation;
    } catch (error) {
      logger.error('Error creating conversation:', error);
      throw createError.internalServerError('Failed to create conversation');
    }
  }

  /**
   * Send a message
   */
  async sendMessage(data: CreateMessageData) {
    try {
      // Verify conversation exists and user has access
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: data.conversationId,
          OR: [
            { initiatorId: data.senderId },
            { receiverId: data.senderId },
          ],
          status: { not: 'BLOCKED' },
        },
      });

      if (!conversation) {
        throw createError.notFound('Conversation not found or access denied');
      }

      const receiverId = conversation.initiatorId === data.senderId 
        ? conversation.receiverId 
        : conversation.initiatorId;

      // Encrypt sensitive content if needed
      let encryptedContent = null;
      if (conversation.isEncrypted || data.type === 'INQUIRY') {
        encryptedContent = this.encryptMessage(data.content);
      }

      // Create message
      const message = await prisma.message.create({
        data: {
          conversationId: data.conversationId,
          senderId: data.senderId,
          receiverId,
          type: data.type || 'TEXT',
          content: data.content,
          encryptedContent,
          metadata: data.metadata,
          status: 'SENT',
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          attachments: true,
        },
      });

      // Update conversation
      await prisma.conversation.update({
        where: { id: data.conversationId },
        data: {
          lastMessageAt: new Date(),
        },
      });

      logger.info(`Message sent from ${data.senderId} in conversation ${data.conversationId}`);
      return message;
    } catch (error) {
      logger.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Get conversations for a user
   */
  async getUserConversations(userId: string, page = 1, limit = 20) {
    try {
      const skip = (page - 1) * limit;

      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
          status: { not: 'CLOSED' },
        },
        include: {
          initiator: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
          receiver: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
          listing: {
            select: {
              id: true,
              title: true,
              askingPrice: true,
              currency: true,
              status: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  receiverId: userId,
                  status: { not: 'READ' },
                },
              },
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.conversation.count({
        where: {
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
          status: { not: 'CLOSED' },
        },
      });

      return {
        conversations: conversations.map(conv => ({
          ...conv,
          unreadCount: conv._count.messages,
          otherUser: conv.initiatorId === userId ? conv.receiver : conv.initiator,
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting user conversations:', error);
      throw createError.internalServerError('Failed to get conversations');
    }
  }

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId: string, userId: string, page = 1, limit = 50) {
    try {
      // Verify user has access to conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
        },
      });

      if (!conversation) {
        throw createError.notFound('Conversation not found or access denied');
      }

      const skip = (page - 1) * limit;

      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          deletedAt: null,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.message.count({
        where: {
          conversationId,
          deletedAt: null,
        },
      });

      // Decrypt messages if necessary
      const decryptedMessages = messages.map(msg => ({
        ...msg,
        content: msg.encryptedContent ? this.decryptMessage(msg.encryptedContent) : msg.content,
      }));

      return {
        messages: decryptedMessages.reverse(), // Return in chronological order
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error getting conversation messages:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markAsRead(messageId: string, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          receiverId: userId,
        },
      });

      if (!message) {
        throw createError.notFound('Message not found');
      }

      await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });

      logger.info(`Message ${messageId} marked as read by user ${userId}`);
    } catch (error) {
      logger.error('Error marking message as read:', error);
      throw error;
    }
  }

  /**
   * Mark all messages in conversation as read
   */
  async markConversationAsRead(conversationId: string, userId: string) {
    try {
      await prisma.message.updateMany({
        where: {
          conversationId,
          receiverId: userId,
          status: { not: 'READ' },
        },
        data: {
          status: 'READ',
          readAt: new Date(),
        },
      });

      logger.info(`All messages in conversation ${conversationId} marked as read by user ${userId}`);
    } catch (error) {
      logger.error('Error marking conversation as read:', error);
      throw error;
    }
  }

  /**
   * Delete a message
   */
  async deleteMessage(messageId: string, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          senderId: userId, // Only sender can delete
        },
      });

      if (!message) {
        throw createError.notFound('Message not found or permission denied');
      }

      await prisma.message.update({
        where: { id: messageId },
        data: {
          status: 'DELETED',
          deletedAt: new Date(),
        },
      });

      logger.info(`Message ${messageId} deleted by user ${userId}`);
    } catch (error) {
      logger.error('Error deleting message:', error);
      throw error;
    }
  }

  /**
   * Search messages
   */
  async searchMessages(options: SearchMessagesOptions) {
    try {
      const { conversationId, query, userId, page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;

      // Verify user has access to conversation
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
        },
      });

      if (!conversation) {
        throw createError.notFound('Conversation not found or access denied');
      }

      const messages = await prisma.message.findMany({
        where: {
          conversationId,
          deletedAt: null,
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      });

      const total = await prisma.message.count({
        where: {
          conversationId,
          deletedAt: null,
          content: {
            contains: query,
            mode: 'insensitive',
          },
        },
      });

      return {
        messages,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      logger.error('Error searching messages:', error);
      throw error;
    }
  }

  /**
   * Block/unblock conversation
   */
  async toggleConversationBlock(conversationId: string, userId: string) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
        },
      });

      if (!conversation) {
        throw createError.notFound('Conversation not found');
      }

      const newStatus = conversation.status === 'BLOCKED' ? 'ACTIVE' : 'BLOCKED';

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: newStatus },
      });

      logger.info(`Conversation ${conversationId} ${newStatus.toLowerCase()} by user ${userId}`);
      return { status: newStatus };
    } catch (error) {
      logger.error('Error toggling conversation block:', error);
      throw error;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string, userId: string) {
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
        },
      });

      if (!conversation) {
        throw createError.notFound('Conversation not found');
      }

      await prisma.conversation.update({
        where: { id: conversationId },
        data: { status: 'ARCHIVED' },
      });

      logger.info(`Conversation ${conversationId} archived by user ${userId}`);
    } catch (error) {
      logger.error('Error archiving conversation:', error);
      throw error;
    }
  }

  /**
   * Get unread messages count for user
   */
  async getUnreadMessagesCount(userId: string) {
    try {
      const count = await prisma.message.count({
        where: {
          receiverId: userId,
          status: { not: 'READ' },
          deletedAt: null,
        },
      });

      return count;
    } catch (error) {
      logger.error('Error getting unread messages count:', error);
      throw createError.internalServerError('Failed to get unread count');
    }
  }

  /**
   * Upload message attachment
   */
  async uploadAttachment(messageId: string, file: Express.Multer.File, userId: string) {
    try {
      const message = await prisma.message.findFirst({
        where: {
          id: messageId,
          senderId: userId,
        },
      });

      if (!message) {
        throw createError.notFound('Message not found or permission denied');
      }

      // Save file and create attachment record
      const attachment = await prisma.messageAttachment.create({
        data: {
          messageId,
          filename: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          url: `/uploads/messages/${file.filename}`,
        },
      });

      // Update message type to FILE
      await prisma.message.update({
        where: { id: messageId },
        data: { type: 'FILE' },
      });

      return attachment;
    } catch (error) {
      logger.error('Error uploading attachment:', error);
      throw error;
    }
  }

  // Encryption helper methods
  private encryptMessage(content: string): string {
    const cipher = crypto.createCipher('aes-256-ctr', this.encryptionKey);
    let encrypted = cipher.update(content, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  private decryptMessage(encryptedContent: string): string {
    const decipher = crypto.createDecipher('aes-256-ctr', this.encryptionKey);
    let decrypted = decipher.update(encryptedContent, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}

export const messageService = new MessageService();