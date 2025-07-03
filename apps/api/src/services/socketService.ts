import { Server as SocketIOServer, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '@/config/app';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { messageService } from './messageService';
import { notificationService } from './notificationService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

interface SocketUser {
  socketId: string;
  userId: string;
  lastSeen: Date;
}

export class SocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          throw new Error('No token provided');
        }

        const decoded = jwt.verify(token, config.jwtSecret) as any;
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            isActive: true,
          },
        });

        if (!user || !user.isActive) {
          throw new Error('User not found or inactive');
        }

        socket.userId = user.id;
        socket.user = user;
        next();
      } catch (error) {
        logger.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      this.handleConnection(socket);
    });
  }

  private async handleConnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    logger.info(`User ${userId} connected with socket ${socket.id}`);

    // Track user connection
    this.connectedUsers.set(socket.id, {
      socketId: socket.id,
      userId,
      lastSeen: new Date(),
    });

    // Track user sockets (user can have multiple sockets)
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)!.add(socket.id);

    // Update user online status
    await this.updateUserOnlineStatus(userId, true);

    // Join user to their personal room
    socket.join(`user_${userId}`);

    // Set up event handlers
    this.setupMessageHandlers(socket);
    this.setupConversationHandlers(socket);
    this.setupTypingHandlers(socket);
    this.setupNotificationHandlers(socket);

    // Handle disconnect
    socket.on('disconnect', () => {
      this.handleDisconnection(socket);
    });
  }

  private setupMessageHandlers(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Send message
    socket.on('send_message', async (data) => {
      try {
        const { conversationId, content, type = 'TEXT', metadata } = data;
        
        const message = await messageService.sendMessage({
          conversationId,
          senderId: userId,
          content,
          type,
          metadata,
        });

        // Emit to conversation room
        this.io.to(`conversation_${conversationId}`).emit('new_message', message);
        
        // Send notification to receiver
        const conversation = await prisma.conversation.findUnique({
          where: { id: conversationId },
          include: { initiator: true, receiver: true },
        });

        if (conversation) {
          const receiverId = conversation.initiatorId === userId ? conversation.receiverId : conversation.initiatorId;
          await notificationService.createNotification({
            userId: receiverId,
            type: 'MESSAGE',
            title: `Nytt meddelande från ${socket.user!.firstName} ${socket.user!.lastName}`,
            content: content.substring(0, 100),
            data: { conversationId, messageId: message.id },
            channel: 'IN_APP',
          });

          // Emit notification to receiver
          this.io.to(`user_${receiverId}`).emit('new_notification', {
            type: 'message',
            conversationId,
            message,
          });
        }

      } catch (error) {
        logger.error('Error sending message:', error);
        socket.emit('message_error', { error: 'Failed to send message' });
      }
    });

    // Mark message as read
    socket.on('mark_message_read', async (data) => {
      try {
        const { messageId } = data;
        await messageService.markAsRead(messageId, userId);
        
        // Notify sender that message was read
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { conversation: true },
        });

        if (message) {
          this.io.to(`user_${message.senderId}`).emit('message_read', {
            messageId,
            conversationId: message.conversationId,
            readBy: userId,
          });
        }
      } catch (error) {
        logger.error('Error marking message as read:', error);
      }
    });

    // Delete message
    socket.on('delete_message', async (data) => {
      try {
        const { messageId } = data;
        await messageService.deleteMessage(messageId, userId);
        
        const message = await prisma.message.findUnique({
          where: { id: messageId },
          include: { conversation: true },
        });

        if (message) {
          this.io.to(`conversation_${message.conversationId}`).emit('message_deleted', {
            messageId,
            conversationId: message.conversationId,
          });
        }
      } catch (error) {
        logger.error('Error deleting message:', error);
      }
    });
  }

  private setupConversationHandlers(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Join conversation
    socket.on('join_conversation', async (data) => {
      try {
        const { conversationId } = data;
        
        // Verify user is part of conversation
        const conversation = await prisma.conversation.findFirst({
          where: {
            id: conversationId,
            OR: [
              { initiatorId: userId },
              { receiverId: userId },
            ],
          },
        });

        if (conversation) {
          socket.join(`conversation_${conversationId}`);
          logger.info(`User ${userId} joined conversation ${conversationId}`);
        }
      } catch (error) {
        logger.error('Error joining conversation:', error);
      }
    });

    // Leave conversation
    socket.on('leave_conversation', (data) => {
      const { conversationId } = data;
      socket.leave(`conversation_${conversationId}`);
      logger.info(`User ${userId} left conversation ${conversationId}`);
    });
  }

  private setupTypingHandlers(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Start typing
    socket.on('start_typing', async (data) => {
      try {
        const { conversationId } = data;
        
        // Create or update typing indicator
        await prisma.typingIndicator.upsert({
          where: {
            conversationId_userId: {
              conversationId,
              userId,
            },
          },
          update: {
            isTyping: true,
            expiresAt: new Date(Date.now() + 10000), // 10 seconds
          },
          create: {
            conversationId,
            userId,
            isTyping: true,
            expiresAt: new Date(Date.now() + 10000),
          },
        });

        // Broadcast to conversation
        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId,
          conversationId,
          isTyping: true,
        });
      } catch (error) {
        logger.error('Error handling start typing:', error);
      }
    });

    // Stop typing
    socket.on('stop_typing', async (data) => {
      try {
        const { conversationId } = data;
        
        await prisma.typingIndicator.updateMany({
          where: {
            conversationId,
            userId,
          },
          data: {
            isTyping: false,
          },
        });

        socket.to(`conversation_${conversationId}`).emit('user_typing', {
          userId,
          conversationId,
          isTyping: false,
        });
      } catch (error) {
        logger.error('Error handling stop typing:', error);
      }
    });
  }

  private setupNotificationHandlers(socket: AuthenticatedSocket) {
    const userId = socket.userId!;

    // Mark notification as read
    socket.on('mark_notification_read', async (data) => {
      try {
        const { notificationId } = data;
        await notificationService.markAsRead(notificationId, userId);
      } catch (error) {
        logger.error('Error marking notification as read:', error);
      }
    });

    // Get unread notifications count
    socket.on('get_unread_count', async () => {
      try {
        const count = await notificationService.getUnreadCount(userId);
        socket.emit('unread_count', { count });
      } catch (error) {
        logger.error('Error getting unread count:', error);
      }
    });
  }

  private async handleDisconnection(socket: AuthenticatedSocket) {
    const userId = socket.userId!;
    
    // Remove from tracking
    this.connectedUsers.delete(socket.id);
    
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.delete(socket.id);
      
      // If no more sockets for this user, update offline status
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
        await this.updateUserOnlineStatus(userId, false);
      }
    }

    logger.info(`User ${userId} disconnected (socket ${socket.id})`);
  }

  private async updateUserOnlineStatus(userId: string, isOnline: boolean) {
    try {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isOnline,
          lastSeenAt: new Date(),
        },
      });

      // Broadcast status change to user's contacts
      this.broadcastUserStatusChange(userId, isOnline);
    } catch (error) {
      logger.error('Error updating user online status:', error);
    }
  }

  private async broadcastUserStatusChange(userId: string, isOnline: boolean) {
    try {
      // Get user's conversations to find contacts
      const conversations = await prisma.conversation.findMany({
        where: {
          OR: [
            { initiatorId: userId },
            { receiverId: userId },
          ],
          status: 'ACTIVE',
        },
        select: {
          initiatorId: true,
          receiverId: true,
        },
      });

      const contactIds = new Set<string>();
      conversations.forEach(conv => {
        const contactId = conv.initiatorId === userId ? conv.receiverId : conv.initiatorId;
        contactIds.add(contactId);
      });

      // Broadcast to all contacts
      contactIds.forEach(contactId => {
        this.io.to(`user_${contactId}`).emit('user_status_change', {
          userId,
          isOnline,
          timestamp: new Date(),
        });
      });
    } catch (error) {
      logger.error('Error broadcasting user status change:', error);
    }
  }

  // Public methods for other services to use
  public async sendNotificationToUser(userId: string, notification: any) {
    this.io.to(`user_${userId}`).emit('notification', notification);
  }

  public async sendMessageToConversation(conversationId: string, message: any) {
    this.io.to(`conversation_${conversationId}`).emit('new_message', message);
  }

  public getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  public isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  // Clean up expired typing indicators
  public async cleanupTypingIndicators() {
    try {
      // TODO: Re-enable when TypingIndicator model is added to schema
      logger.debug('Typing indicator cleanup disabled - model not in schema');
      return;
      
      // if (!prisma) {
      //   logger.warn('Prisma not initialized, skipping typing indicator cleanup');
      //   return;
      // }
      
      // const expired = await prisma.typingIndicator.findMany({
      //   where: {
      //     expiresAt: {
      //       lt: new Date(),
      //     },
      //   },
      // });

      for (const indicator of expired) {
        await prisma.typingIndicator.delete({
          where: { id: indicator.id },
        });

        // Broadcast stop typing
        this.io.to(`conversation_${indicator.conversationId}`).emit('user_typing', {
          userId: indicator.userId,
          conversationId: indicator.conversationId,
          isTyping: false,
        });
      }
    } catch (error) {
      logger.error('Error cleaning up typing indicators:', error);
    }
  }
}

// Singleton instance
let socketService: SocketService;

export const initializeSocketService = (io: SocketIOServer) => {
  socketService = new SocketService(io);
  
  // Clean up typing indicators every 30 seconds
  setInterval(() => {
    socketService.cleanupTypingIndicators();
  }, 30000);
  
  return socketService;
};

export const getSocketService = () => {
  if (!socketService) {
    throw new Error('SocketService not initialized');
  }
  return socketService;
};