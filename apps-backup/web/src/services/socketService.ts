import { io, Socket } from 'socket.io-client';
import { Message, Notification } from './messageService';

interface SocketEvents {
  // Message events
  new_message: (message: Message) => void;
  message_read: (data: { messageId: string; conversationId: string; readBy: string }) => void;
  message_deleted: (data: { messageId: string; conversationId: string }) => void;
  
  // Typing events
  user_typing: (data: { userId: string; conversationId: string; isTyping: boolean }) => void;
  
  // Notification events
  new_notification: (data: { type: string; conversationId?: string; message?: Message }) => void;
  notification: (notification: Notification) => void;
  
  // User status events
  user_status_change: (data: { userId: string; isOnline: boolean; timestamp: Date }) => void;
  
  // Connection events
  connect: () => void;
  disconnect: () => void;
  connect_error: (error: Error) => void;
  
  // System events
  unread_count: (data: { count: number }) => void;
}

export class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 1000;
  private eventListeners: Map<string, Function[]> = new Map();

  /**
   * Connect to the socket server
   */
  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const API_URL = import.meta.env.VITE_API_URL || window.location.origin;
      
      this.socket = io(API_URL, {
        auth: {
          token,
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: this.reconnectInterval,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.reconnectAttempts = 0;
        this.setupEventHandlers();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          reject(new Error('Failed to connect to chat server'));
        }
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
        this.emit('disconnect');
      });
    });
  }

  /**
   * Disconnect from socket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.eventListeners.clear();
  }

  /**
   * Check if socket is connected
   */
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  /**
   * Setup event handlers
   */
  private setupEventHandlers(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on('new_message', (message: Message) => {
      this.emit('new_message', message);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('message_deleted', (data) => {
      this.emit('message_deleted', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    // Notification events
    this.socket.on('new_notification', (data) => {
      this.emit('new_notification', data);
    });

    this.socket.on('notification', (notification: Notification) => {
      this.emit('notification', notification);
    });

    // User status events
    this.socket.on('user_status_change', (data) => {
      this.emit('user_status_change', data);
    });

    // System events
    this.socket.on('unread_count', (data) => {
      this.emit('unread_count', data);
    });
  }

  /**
   * Join a conversation room
   */
  joinConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('join_conversation', { conversationId });
    }
  }

  /**
   * Leave a conversation room
   */
  leaveConversation(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('leave_conversation', { conversationId });
    }
  }

  /**
   * Send a message
   */
  sendMessage(data: {
    conversationId: string;
    content: string;
    type?: string;
    metadata?: any;
  }): void {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  /**
   * Mark message as read
   */
  markMessageAsRead(messageId: string): void {
    if (this.socket) {
      this.socket.emit('mark_message_read', { messageId });
    }
  }

  /**
   * Delete message
   */
  deleteMessage(messageId: string): void {
    if (this.socket) {
      this.socket.emit('delete_message', { messageId });
    }
  }

  /**
   * Start typing indicator
   */
  startTyping(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('start_typing', { conversationId });
    }
  }

  /**
   * Stop typing indicator
   */
  stopTyping(conversationId: string): void {
    if (this.socket) {
      this.socket.emit('stop_typing', { conversationId });
    }
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): void {
    if (this.socket) {
      this.socket.emit('mark_notification_read', { notificationId });
    }
  }

  /**
   * Get unread count
   */
  getUnreadCount(): void {
    if (this.socket) {
      this.socket.emit('get_unread_count');
    }
  }

  /**
   * Event listener management
   */
  on<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  off<K extends keyof SocketEvents>(event: K, callback: SocketEvents[K]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in socket event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Singleton instance
let socketService: SocketService | null = null;

export const getSocketService = (): SocketService => {
  if (!socketService) {
    socketService = new SocketService();
  }
  return socketService;
};

export const initializeSocket = async (token: string): Promise<SocketService> => {
  const service = getSocketService();
  await service.connect(token);
  return service;
};

export const disconnectSocket = (): void => {
  if (socketService) {
    socketService.disconnect();
    socketService = null;
  }
};