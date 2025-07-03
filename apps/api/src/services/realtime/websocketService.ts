import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { notificationService } from '../notificationService';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  userRole?: string;
}

interface SocketUser {
  id: string;
  socketId: string;
  userId: string;
  role: string;
  lastSeen: Date;
  rooms: string[];
}

interface LiveUpdate {
  type: 'LISTING_UPDATE' | 'OFFER_UPDATE' | 'INQUIRY_UPDATE' | 'USER_ONLINE' | 'USER_OFFLINE';
  data: any;
  userId?: string;
  broadcastTo?: string[];
}

interface TypingIndicator {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: Date;
}

class WebSocketService {
  private io: SocketIOServer;
  private connectedUsers: Map<string, SocketUser> = new Map();
  private notificationService: NotificationService;
  private jwtSecret: string;

  constructor(server: HTTPServer) {
    this.jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
    
    // Initialize Socket.IO with CORS configuration
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    // Initialize notification service with io instance
    notificationService = notificationService;

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeat();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication required'));
        }

        // Verify JWT token
        const decoded = verify(token, this.jwtSecret) as any;
        
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        
        next();
      } catch (error) {
        console.error('WebSocket authentication failed:', error);
        next(new Error('Invalid token'));
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected via WebSocket`);
      
      this.handleUserConnection(socket);
      this.setupSocketEventListeners(socket);
    });
  }

  private handleUserConnection(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    // Add user to connected users
    const socketUser: SocketUser = {
      id: socket.id,
      socketId: socket.id,
      userId: socket.userId,
      role: socket.userRole || 'USER',
      lastSeen: new Date(),
      rooms: [],
    };

    this.connectedUsers.set(socket.id, socketUser);

    // Join user-specific room
    socket.join(`user:${socket.userId}`);
    socketUser.rooms.push(`user:${socket.userId}`);

    // Join role-specific rooms
    if (socket.userRole === 'ADMIN') {
      socket.join('admins');
      socketUser.rooms.push('admins');
    }

    // Notify user is online
    this.broadcastUserStatus(socket.userId, 'online');

    // Send initial data
    this.sendInitialData(socket);
  }

  private setupSocketEventListeners(socket: AuthenticatedSocket): void {
    // Handle disconnection
    socket.on('disconnect', () => {
      this.handleUserDisconnection(socket);
    });

    // Join specific rooms (business listings, conversations)
    socket.on('join-room', (roomId: string) => {
      this.handleJoinRoom(socket, roomId);
    });

    socket.on('leave-room', (roomId: string) => {
      this.handleLeaveRoom(socket, roomId);
    });

    // Real-time messaging
    socket.on('send-message', (data) => {
      this.handleSendMessage(socket, data);
    });

    socket.on('typing-start', (data) => {
      this.handleTypingStart(socket, data);
    });

    socket.on('typing-stop', (data) => {
      this.handleTypingStop(socket, data);
    });

    // Notification interactions
    socket.on('mark-notification-read', (notificationId: string) => {
      this.handleMarkNotificationRead(socket, notificationId);
    });

    socket.on('subscribe-push', (subscription) => {
      this.handlePushSubscription(socket, subscription);
    });

    // Business listing interactions
    socket.on('watch-listing', (listingId: string) => {
      this.handleWatchListing(socket, listingId);
    });

    socket.on('unwatch-listing', (listingId: string) => {
      this.handleUnwatchListing(socket, listingId);
    });

    // Offer and inquiry real-time updates
    socket.on('track-offer', (offerId: string) => {
      this.handleTrackOffer(socket, offerId);
    });

    // Live chat for customer support
    socket.on('join-support-chat', () => {
      this.handleJoinSupportChat(socket);
    });

    // Heartbeat
    socket.on('heartbeat', () => {
      this.handleHeartbeat(socket);
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  }

  private handleUserDisconnection(socket: AuthenticatedSocket): void {
    console.log(`User ${socket.userId} disconnected`);
    
    if (socket.userId) {
      // Remove from connected users
      this.connectedUsers.delete(socket.id);
      
      // Check if user has other connections
      const hasOtherConnections = Array.from(this.connectedUsers.values())
        .some(user => user.userId === socket.userId);
      
      if (!hasOtherConnections) {
        // Notify user is offline after delay
        setTimeout(() => {
          const stillOffline = !Array.from(this.connectedUsers.values())
            .some(user => user.userId === socket.userId);
          
          if (stillOffline) {
            this.broadcastUserStatus(socket.userId!, 'offline');
          }
        }, 30000); // 30 second delay
      }
    }
  }

  private handleJoinRoom(socket: AuthenticatedSocket, roomId: string): void {
    if (!this.isValidRoom(roomId, socket)) {
      socket.emit('error', { message: 'Invalid room or insufficient permissions' });
      return;
    }

    socket.join(roomId);
    
    const user = this.connectedUsers.get(socket.id);
    if (user && !user.rooms.includes(roomId)) {
      user.rooms.push(roomId);
    }

    // Send room-specific data
    this.sendRoomData(socket, roomId);
    
    console.log(`User ${socket.userId} joined room: ${roomId}`);
  }

  private handleLeaveRoom(socket: AuthenticatedSocket, roomId: string): void {
    socket.leave(roomId);
    
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.rooms = user.rooms.filter(room => room !== roomId);
    }
    
    console.log(`User ${socket.userId} left room: ${roomId}`);
  }

  private handleSendMessage(socket: AuthenticatedSocket, data: {
    conversationId: string;
    message: string;
    attachments?: any[];
  }): void {
    if (!socket.userId) return;

    // Validate message
    if (!data.message.trim() || data.message.length > 5000) {
      socket.emit('error', { message: 'Invalid message content' });
      return;
    }

    // Create message object
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      conversationId: data.conversationId,
      senderId: socket.userId,
      message: data.message,
      attachments: data.attachments || [],
      timestamp: new Date(),
      status: 'sent',
    };

    // Broadcast to conversation participants
    this.io.to(`conversation:${data.conversationId}`).emit('new-message', message);

    // Store message (in production, save to database)
    console.log('New message:', message);

    // Send notification to offline users
    this.notifyOfflineUsers(data.conversationId, message);
  }

  private handleTypingStart(socket: AuthenticatedSocket, data: { conversationId: string }): void {
    if (!socket.userId) return;

    const typingIndicator: TypingIndicator = {
      conversationId: data.conversationId,
      userId: socket.userId,
      userName: 'User', // In production, get from user data
      isTyping: true,
      timestamp: new Date(),
    };

    // Broadcast to others in conversation
    socket.to(`conversation:${data.conversationId}`).emit('user-typing', typingIndicator);
  }

  private handleTypingStop(socket: AuthenticatedSocket, data: { conversationId: string }): void {
    if (!socket.userId) return;

    const typingIndicator: TypingIndicator = {
      conversationId: data.conversationId,
      userId: socket.userId,
      userName: 'User',
      isTyping: false,
      timestamp: new Date(),
    };

    socket.to(`conversation:${data.conversationId}`).emit('user-typing', typingIndicator);
  }

  private handleMarkNotificationRead(socket: AuthenticatedSocket, notificationId: string): void {
    if (!socket.userId) return;
    
    notificationService.markNotificationAsRead(notificationId, socket.userId);
  }

  private handlePushSubscription(socket: AuthenticatedSocket, subscription: any): void {
    if (!socket.userId) return;
    
    notificationService.subscribeToPush(socket.userId, subscription);
  }

  private handleWatchListing(socket: AuthenticatedSocket, listingId: string): void {
    if (!socket.userId) return;

    // Join listing-specific room for updates
    socket.join(`listing:${listingId}`);
    
    // Add to user's watched listings
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.rooms.push(`listing:${listingId}`);
    }

    console.log(`User ${socket.userId} is now watching listing: ${listingId}`);
  }

  private handleUnwatchListing(socket: AuthenticatedSocket, listingId: string): void {
    socket.leave(`listing:${listingId}`);
    
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.rooms = user.rooms.filter(room => room !== `listing:${listingId}`);
    }
  }

  private handleTrackOffer(socket: AuthenticatedSocket, offerId: string): void {
    if (!socket.userId) return;

    socket.join(`offer:${offerId}`);
    
    // Send current offer status
    this.sendOfferStatus(socket, offerId);
  }

  private handleJoinSupportChat(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    socket.join('support-queue');
    
    // Notify support team
    this.io.to('admins').emit('support-request', {
      userId: socket.userId,
      timestamp: new Date(),
      socketId: socket.id,
    });
  }

  private handleHeartbeat(socket: AuthenticatedSocket): void {
    const user = this.connectedUsers.get(socket.id);
    if (user) {
      user.lastSeen = new Date();
    }
    
    socket.emit('heartbeat-ack');
  }

  // Public methods for broadcasting updates
  public broadcastListingUpdate(listingId: string, update: any): void {
    this.io.to(`listing:${listingId}`).emit('listing-update', {
      listingId,
      update,
      timestamp: new Date(),
    });
  }

  public broadcastOfferUpdate(offerId: string, update: any): void {
    this.io.to(`offer:${offerId}`).emit('offer-update', {
      offerId,
      update,
      timestamp: new Date(),
    });
  }

  public notifyUserDirectly(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  public broadcastToAdmins(event: string, data: any): void {
    this.io.to('admins').emit(event, data);
  }

  public getConnectedUserCount(): number {
    return this.connectedUsers.size;
  }

  public getUserConnections(userId: string): SocketUser[] {
    return Array.from(this.connectedUsers.values())
      .filter(user => user.userId === userId);
  }

  public isUserOnline(userId: string): boolean {
    return Array.from(this.connectedUsers.values())
      .some(user => user.userId === userId);
  }

  // Private helper methods
  private broadcastUserStatus(userId: string, status: 'online' | 'offline'): void {
    // Broadcast to relevant users (friends, ongoing conversations, etc.)
    this.io.emit('user-status', {
      userId,
      status,
      timestamp: new Date(),
    });
  }

  private sendInitialData(socket: AuthenticatedSocket): void {
    if (!socket.userId) return;

    // Send unread notification count
    notificationService.getUserNotifications(socket.userId, 1, 10)
      .then(result => {
        socket.emit('initial-data', {
          unreadNotifications: result.unreadCount,
          recentNotifications: result.notifications,
          onlineUsers: this.getOnlineUsers(),
        });
      })
      .catch(error => {
        console.error('Failed to send initial data:', error);
      });
  }

  private sendRoomData(socket: AuthenticatedSocket, roomId: string): void {
    // Send room-specific data based on room type
    if (roomId.startsWith('listing:')) {
      const listingId = roomId.replace('listing:', '');
      // Send listing status, recent activity, etc.
    } else if (roomId.startsWith('conversation:')) {
      const conversationId = roomId.replace('conversation:', '');
      // Send recent messages, participants, etc.
    }
  }

  private isValidRoom(roomId: string, socket: AuthenticatedSocket): boolean {
    // Validate room access permissions
    if (roomId.startsWith('user:')) {
      const userId = roomId.replace('user:', '');
      return userId === socket.userId;
    }
    
    if (roomId === 'admins') {
      return socket.userRole === 'ADMIN';
    }
    
    // Add more room validation logic
    return true;
  }

  private async notifyOfflineUsers(conversationId: string, message: any): Promise<void> {
    // Get conversation participants
    // Check who's offline
    // Send push notifications to offline users
  }

  private sendOfferStatus(socket: AuthenticatedSocket, offerId: string): void {
    // Mock offer status
    socket.emit('offer-status', {
      offerId,
      status: 'pending',
      lastActivity: new Date(),
      nextAction: 'awaiting_seller_response',
    });
  }

  private getOnlineUsers(): string[] {
    return Array.from(new Set(
      Array.from(this.connectedUsers.values()).map(user => user.userId)
    ));
  }

  private startHeartbeat(): void {
    setInterval(() => {
      // Clean up stale connections
      const now = new Date();
      const staleThreshold = 5 * 60 * 1000; // 5 minutes

      for (const [socketId, user] of this.connectedUsers.entries()) {
        if (now.getTime() - user.lastSeen.getTime() > staleThreshold) {
          console.log(`Removing stale connection for user ${user.userId}`);
          this.connectedUsers.delete(socketId);
        }
      }
    }, 60000); // Check every minute
  }

  // Cleanup method
  public async shutdown(): Promise<void> {
    console.log('Shutting down WebSocket service...');
    
    // Notify all connected users
    this.io.emit('server-shutdown', {
      message: 'Server is restarting, please reconnect in a moment',
      timestamp: new Date(),
    });

    // Close all connections
    this.io.close();
    
    console.log('WebSocket service shut down complete');
  }
}

export { WebSocketService, AuthenticatedSocket, SocketUser, LiveUpdate };