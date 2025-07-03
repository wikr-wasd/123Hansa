import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  isOnline?: boolean;
  lastSeenAt?: string;
}

export interface Conversation {
  id: string;
  initiatorId: string;
  receiverId: string;
  listingId?: string;
  subject?: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'BLOCKED' | 'CLOSED';
  lastMessageAt?: string;
  createdAt: string;
  initiator: User;
  receiver: User;
  listing?: {
    id: string;
    title: string;
    askingPrice?: number;
    currency: string;
    status: string;
  };
  messages?: Message[];
  unreadCount: number;
  otherUser: User;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  type: 'TEXT' | 'FILE' | 'IMAGE' | 'SYSTEM' | 'INQUIRY';
  content: string;
  metadata?: any;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'DELETED';
  readAt?: string;
  createdAt: string;
  sender: User;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
}

export interface Notification {
  id: string;
  type: 'MESSAGE' | 'LISTING_INQUIRY' | 'LISTING_UPDATE' | 'TRANSACTION' | 'SYSTEM' | 'MARKETING';
  title: string;
  content: string;
  data?: any;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface NotificationSettings {
  emailMessages: boolean;
  emailInquiries: boolean;
  emailListingUpdates: boolean;
  emailTransactions: boolean;
  emailMarketing: boolean;
  inAppMessages: boolean;
  inAppInquiries: boolean;
  inAppListingUpdates: boolean;
  inAppTransactions: boolean;
  pushMessages: boolean;
  pushInquiries: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
  timezone: string;
  language: 'sv' | 'no' | 'da' | 'en';
}

interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const messageService = {
  /**
   * Create a new conversation
   */
  async createConversation(data: {
    receiverId: string;
    listingId?: string;
    subject?: string;
    initialMessage?: string;
  }): Promise<Conversation> {
    try {
      const response: AxiosResponse<ApiResponse<{ conversation: Conversation }>> = 
        await api.post('/messages/conversations', data);
      
      if (response.data.success && response.data.data) {
        return response.data.data.conversation;
      }
      
      throw new Error(response.data.message || 'Failed to create conversation');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to create conversation');
    }
  },

  /**
   * Get user's conversations
   */
  async getUserConversations(page = 1, limit = 20): Promise<PaginatedResponse<Conversation>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<Conversation>>> = 
        await api.get('/messages/conversations', { params: { page, limit } });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get conversations');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get conversations');
    }
  },

  /**
   * Get messages in a conversation
   */
  async getConversationMessages(conversationId: string, page = 1, limit = 50): Promise<PaginatedResponse<Message>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<Message>>> = 
        await api.get(`/messages/conversations/${conversationId}/messages`, { params: { page, limit } });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get messages');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get messages');
    }
  },

  /**
   * Send a message
   */
  async sendMessage(data: {
    conversationId: string;
    content: string;
    type?: string;
    metadata?: any;
  }): Promise<Message> {
    try {
      const response: AxiosResponse<ApiResponse<{ message: Message }>> = 
        await api.post('/messages/messages', data);
      
      if (response.data.success && response.data.data) {
        return response.data.data.message;
      }
      
      throw new Error(response.data.message || 'Failed to send message');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to send message');
    }
  },

  /**
   * Mark message as read
   */
  async markMessageAsRead(messageId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.put(`/messages/messages/${messageId}/read`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to mark message as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark message as read');
    }
  },

  /**
   * Mark conversation as read
   */
  async markConversationAsRead(conversationId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.put(`/messages/conversations/${conversationId}/read`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to mark conversation as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark conversation as read');
    }
  },

  /**
   * Delete message
   */
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.delete(`/messages/messages/${messageId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete message');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete message');
    }
  },

  /**
   * Search messages
   */
  async searchMessages(conversationId: string, query: string, page = 1, limit = 20): Promise<PaginatedResponse<Message>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<Message>>> = 
        await api.post(`/messages/conversations/${conversationId}/messages/search`, 
          { query }, 
          { params: { page, limit } }
        );
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to search messages');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to search messages');
    }
  },

  /**
   * Block/unblock conversation
   */
  async toggleConversationBlock(conversationId: string): Promise<{ status: string }> {
    try {
      const response: AxiosResponse<ApiResponse<{ status: string }>> = 
        await api.put(`/messages/conversations/${conversationId}/block`);
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to update conversation status');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update conversation status');
    }
  },

  /**
   * Archive conversation
   */
  async archiveConversation(conversationId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.put(`/messages/conversations/${conversationId}/archive`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to archive conversation');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to archive conversation');
    }
  },

  /**
   * Get unread messages count
   */
  async getUnreadMessagesCount(): Promise<number> {
    try {
      const response: AxiosResponse<ApiResponse<{ count: number }>> = 
        await api.get('/messages/unread-count');
      
      if (response.data.success && response.data.data) {
        return response.data.data.count;
      }
      
      return 0;
    } catch (error: any) {
      console.error('Failed to get unread messages count:', error);
      return 0;
    }
  },

  /**
   * Upload message attachment
   */
  async uploadAttachment(messageId: string, file: File): Promise<MessageAttachment> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response: AxiosResponse<ApiResponse<{ attachment: MessageAttachment }>> = 
        await api.post(`/messages/messages/${messageId}/attachments`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      
      if (response.data.success && response.data.data) {
        return response.data.data.attachment;
      }
      
      throw new Error(response.data.message || 'Failed to upload attachment');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to upload attachment');
    }
  },
};

export const notificationService = {
  /**
   * Get user notifications
   */
  async getUserNotifications(page = 1, limit = 20, unreadOnly = false): Promise<PaginatedResponse<Notification>> {
    try {
      const response: AxiosResponse<ApiResponse<PaginatedResponse<Notification>>> = 
        await api.get('/messages/notifications', { params: { page, limit, unreadOnly } });
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || 'Failed to get notifications');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get notifications');
    }
  },

  /**
   * Mark notification as read
   */
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.put(`/messages/notifications/${notificationId}/read`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to mark notification as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark notification as read');
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.put('/messages/notifications/read-all');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to mark notifications as read');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to mark notifications as read');
    }
  },

  /**
   * Get unread notifications count
   */
  async getUnreadNotificationsCount(): Promise<number> {
    try {
      const response: AxiosResponse<ApiResponse<{ count: number }>> = 
        await api.get('/messages/notifications/unread-count');
      
      if (response.data.success && response.data.data) {
        return response.data.data.count;
      }
      
      return 0;
    } catch (error: any) {
      console.error('Failed to get unread notifications count:', error);
      return 0;
    }
  },

  /**
   * Delete notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = 
        await api.delete(`/messages/notifications/${notificationId}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete notification');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete notification');
    }
  },

  /**
   * Get notification settings
   */
  async getNotificationSettings(): Promise<NotificationSettings> {
    try {
      const response: AxiosResponse<ApiResponse<{ settings: NotificationSettings }>> = 
        await api.get('/messages/notification-settings');
      
      if (response.data.success && response.data.data) {
        return response.data.data.settings;
      }
      
      throw new Error(response.data.message || 'Failed to get notification settings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to get notification settings');
    }
  },

  /**
   * Update notification settings
   */
  async updateNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
    try {
      const response: AxiosResponse<ApiResponse<{ settings: NotificationSettings }>> = 
        await api.put('/messages/notification-settings', settings);
      
      if (response.data.success && response.data.data) {
        return response.data.data.settings;
      }
      
      throw new Error(response.data.message || 'Failed to update notification settings');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || error.message || 'Failed to update notification settings');
    }
  },
};