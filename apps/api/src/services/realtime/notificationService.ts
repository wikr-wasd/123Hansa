import { PrismaClient } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';
import webpush from 'web-push';

const prisma = new PrismaClient();

interface NotificationData {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  channels: NotificationChannel[];
  readAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
}

enum NotificationType {
  // Business Listing Notifications
  NEW_INQUIRY = 'NEW_INQUIRY',
  OFFER_RECEIVED = 'OFFER_RECEIVED',
  OFFER_ACCEPTED = 'OFFER_ACCEPTED',
  OFFER_DECLINED = 'OFFER_DECLINED',
  COUNTER_OFFER = 'COUNTER_OFFER',
  
  // Transaction Notifications
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ESCROW_RELEASED = 'ESCROW_RELEASED',
  
  // Verification Notifications
  VERIFICATION_APPROVED = 'VERIFICATION_APPROVED',
  VERIFICATION_REJECTED = 'VERIFICATION_REJECTED',
  KYC_REQUIRED = 'KYC_REQUIRED',
  
  // System Notifications
  SYSTEM_MAINTENANCE = 'SYSTEM_MAINTENANCE',
  SECURITY_ALERT = 'SECURITY_ALERT',
  FEATURE_UPDATE = 'FEATURE_UPDATE',
  
  // Marketing Notifications
  NEWSLETTER = 'NEWSLETTER',
  PROMOTIONAL = 'PROMOTIONAL',
  RECOMMENDATION = 'RECOMMENDATION',
}

enum NotificationChannel {
  IN_APP = 'IN_APP',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
  WEBHOOK = 'WEBHOOK',
}

interface UserNotificationPreferences {
  userId: string;
  preferences: {
    [key in NotificationType]: {
      enabled: boolean;
      channels: NotificationChannel[];
      quietHours?: {
        start: string; // HH:MM
        end: string;   // HH:MM
        timezone: string;
      };
    };
  };
  language: string;
  timezone: string;
}

interface PushSubscription {
  userId: string;
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
  deviceInfo?: {
    userAgent: string;
    platform: string;
  };
  createdAt: Date;
}

class NotificationService {
  private io: SocketIOServer | null = null;
  private pushVapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY || '',
    privateKey: process.env.VAPID_PRIVATE_KEY || '',
    subject: process.env.VAPID_SUBJECT || 'mailto:noreply@123hansa.se',
  };

  constructor(io?: SocketIOServer) {
    this.io = io || null;
    this.initializeWebPush();
  }

  private initializeWebPush() {
    if (this.pushVapidKeys.publicKey && this.pushVapidKeys.privateKey) {
      webpush.setVapidDetails(
        this.pushVapidKeys.subject,
        this.pushVapidKeys.publicKey,
        this.pushVapidKeys.privateKey
      );
    }
  }

  // Send notification through multiple channels
  async sendNotification(notification: Omit<NotificationData, 'id' | 'createdAt'>): Promise<NotificationData> {
    try {
      // Create notification record
      const notificationId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullNotification: NotificationData = {
        ...notification,
        id: notificationId,
        createdAt: new Date(),
      };

      // Store in database
      await this.storeNotification(fullNotification);

      // Get user preferences
      const preferences = await this.getUserNotificationPreferences(notification.userId);
      
      // Check if notification type is enabled for user
      const typePreferences = preferences?.preferences[notification.type];
      if (!typePreferences?.enabled) {
        console.log(`Notification type ${notification.type} disabled for user ${notification.userId}`);
        return fullNotification;
      }

      // Check quiet hours
      if (this.isInQuietHours(preferences)) {
        // Schedule for later or reduce priority
        if (notification.priority !== 'URGENT') {
          await this.scheduleNotification(fullNotification);
          return fullNotification;
        }
      }

      // Send through enabled channels
      const enabledChannels = typePreferences.channels.filter(channel => 
        notification.channels.includes(channel)
      );

      await Promise.allSettled([
        ...enabledChannels.map(channel => this.sendThroughChannel(channel, fullNotification, preferences)),
      ]);

      return fullNotification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw new Error('Failed to send notification');
    }
  }

  // Send through specific channel
  private async sendThroughChannel(
    channel: NotificationChannel, 
    notification: NotificationData,
    preferences?: UserNotificationPreferences
  ): Promise<void> {
    try {
      switch (channel) {
        case NotificationChannel.IN_APP:
          await this.sendInAppNotification(notification);
          break;
        case NotificationChannel.EMAIL:
          await this.sendEmailNotification(notification, preferences);
          break;
        case NotificationChannel.SMS:
          await this.sendSMSNotification(notification, preferences);
          break;
        case NotificationChannel.PUSH:
          await this.sendPushNotification(notification, preferences);
          break;
        case NotificationChannel.WEBHOOK:
          await this.sendWebhookNotification(notification);
          break;
      }
    } catch (error) {
      console.error(`Failed to send ${channel} notification:`, error);
    }
  }

  // In-app notifications via WebSocket
  private async sendInAppNotification(notification: NotificationData): Promise<void> {
    if (!this.io) return;

    // Send to specific user room
    this.io.to(`user:${notification.userId}`).emit('notification', {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      priority: notification.priority,
      createdAt: notification.createdAt,
    });

    // Update user's unread count
    const unreadCount = await this.getUnreadNotificationCount(notification.userId);
    this.io.to(`user:${notification.userId}`).emit('unread-count', unreadCount);
  }

  // Email notifications
  private async sendEmailNotification(
    notification: NotificationData,
    preferences?: UserNotificationPreferences
  ): Promise<void> {
    // Get user email
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: { email: true, name: true },
    });

    if (!user?.email) return;

    // Get email template based on notification type
    const emailTemplate = this.getEmailTemplate(notification.type, preferences?.language || 'sv');
    
    // Send email (mock implementation)
    console.log('Sending email notification:', {
      to: user.email,
      subject: notification.title,
      template: emailTemplate,
      data: {
        userName: user.name,
        notification,
      },
    });

    // In production, integrate with email service (SendGrid, AWS SES, etc.)
  }

  // SMS notifications
  private async sendSMSNotification(
    notification: NotificationData,
    preferences?: UserNotificationPreferences
  ): Promise<void> {
    // Get user phone number
    const user = await prisma.user.findUnique({
      where: { id: notification.userId },
      select: { phone: true },
    });

    if (!user?.phone) return;

    // Format SMS message
    const smsMessage = this.formatSMSMessage(notification, preferences?.language || 'sv');

    // Send SMS (mock implementation)
    console.log('Sending SMS notification:', {
      to: user.phone,
      message: smsMessage,
    });

    // In production, integrate with SMS service (Twilio, AWS SNS, etc.)
  }

  // Push notifications
  private async sendPushNotification(
    notification: NotificationData,
    preferences?: UserNotificationPreferences
  ): Promise<void> {
    try {
      // Get user's push subscriptions
      const subscriptions = await this.getUserPushSubscriptions(notification.userId);

      if (subscriptions.length === 0) return;

      // Prepare push payload
      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: '/icons/notification-icon.png',
        badge: '/icons/badge.png',
        data: {
          notificationId: notification.id,
          type: notification.type,
          url: this.getNotificationUrl(notification),
          ...notification.data,
        },
        actions: this.getPushActions(notification.type),
        requireInteraction: notification.priority === 'URGENT',
      });

      // Send to all user devices
      const pushPromises = subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys,
            },
            payload,
            {
              urgency: this.getPushUrgency(notification.priority),
              TTL: this.getPushTTL(notification.type),
            }
          );
        } catch (error) {
          console.error('Push notification failed for subscription:', subscription.endpoint, error);
          
          // Remove invalid subscriptions
          if (error.statusCode === 410) {
            await this.removePushSubscription(subscription.endpoint);
          }
        }
      });

      await Promise.allSettled(pushPromises);
    } catch (error) {
      console.error('Failed to send push notifications:', error);
    }
  }

  // Webhook notifications for integrations
  private async sendWebhookNotification(notification: NotificationData): Promise<void> {
    // Get user's webhook endpoints
    const webhooks = await this.getUserWebhooks(notification.userId);

    const webhookPromises = webhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-123hansa-Signature': this.generateWebhookSignature(notification, webhook.secret),
            'X-123hansa-Event': notification.type,
          },
          body: JSON.stringify({
            id: notification.id,
            type: notification.type,
            userId: notification.userId,
            title: notification.title,
            message: notification.message,
            data: notification.data,
            createdAt: notification.createdAt,
          }),
        });

        if (!response.ok) {
          throw new Error(`Webhook failed with status ${response.status}`);
        }
      } catch (error) {
        console.error('Webhook notification failed:', webhook.url, error);
      }
    });

    await Promise.allSettled(webhookPromises);
  }

  // Quick notification methods for common scenarios
  async notifyNewInquiry(sellerId: string, inquiryData: any): Promise<void> {
    await this.sendNotification({
      userId: sellerId,
      type: NotificationType.NEW_INQUIRY,
      title: 'Ny förfrågan om ditt företag',
      message: `${inquiryData.buyerName} har skickat en förfrågan om "${inquiryData.businessTitle}"`,
      data: {
        inquiryId: inquiryData.id,
        businessId: inquiryData.businessId,
        buyerId: inquiryData.buyerId,
      },
      priority: 'HIGH',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    });
  }

  async notifyOfferReceived(sellerId: string, offerData: any): Promise<void> {
    await this.sendNotification({
      userId: sellerId,
      type: NotificationType.OFFER_RECEIVED,
      title: 'Nytt bud på ditt företag!',
      message: `Du har fått ett bud på ${offerData.amount.toLocaleString()} SEK för "${offerData.businessTitle}"`,
      data: {
        offerId: offerData.id,
        businessId: offerData.businessId,
        buyerId: offerData.buyerId,
        amount: offerData.amount,
      },
      priority: 'URGENT',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.SMS],
    });
  }

  async notifyOfferAccepted(buyerId: string, offerData: any): Promise<void> {
    await this.sendNotification({
      userId: buyerId,
      type: NotificationType.OFFER_ACCEPTED,
      title: 'Ditt bud har accepterats!',
      message: `Grattis! Ditt bud på "${offerData.businessTitle}" har accepterats av säljaren.`,
      data: {
        offerId: offerData.id,
        businessId: offerData.businessId,
        sellerId: offerData.sellerId,
        nextSteps: 'due_diligence',
      },
      priority: 'URGENT',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
    });
  }

  async notifyPaymentReceived(userId: string, paymentData: any): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.PAYMENT_RECEIVED,
      title: 'Betalning mottagen',
      message: `Betalning på ${paymentData.amount.toLocaleString()} SEK har mottagits för "${paymentData.description}"`,
      data: {
        paymentId: paymentData.id,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount,
      },
      priority: 'MEDIUM',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  async notifyVerificationApproved(userId: string, verificationType: string): Promise<void> {
    await this.sendNotification({
      userId,
      type: NotificationType.VERIFICATION_APPROVED,
      title: 'Verifiering godkänd',
      message: `Din ${verificationType}-verifiering har godkänts. Du kan nu använda fler funktioner på plattformen.`,
      data: {
        verificationType,
        newCapabilities: this.getVerificationCapabilities(verificationType),
      },
      priority: 'MEDIUM',
      channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
    });
  }

  // Notification management
  async markNotificationAsRead(notificationId: string, userId: string): Promise<void> {
    try {
      // Update notification in database
      await this.updateNotificationReadStatus(notificationId, userId, new Date());

      // Emit updated unread count
      if (this.io) {
        const unreadCount = await this.getUnreadNotificationCount(userId);
        this.io.to(`user:${userId}`).emit('unread-count', unreadCount);
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async getUserNotifications(
    userId: string, 
    page = 1, 
    limit = 20,
    types?: NotificationType[]
  ): Promise<{
    notifications: NotificationData[];
    totalCount: number;
    unreadCount: number;
  }> {
    try {
      // Get notifications from database (mock implementation)
      const notifications = await this.getStoredNotifications(userId, page, limit, types);
      const totalCount = await this.getTotalNotificationCount(userId, types);
      const unreadCount = await this.getUnreadNotificationCount(userId);

      return {
        notifications,
        totalCount,
        unreadCount,
      };
    } catch (error) {
      console.error('Failed to get user notifications:', error);
      throw new Error('Failed to retrieve notifications');
    }
  }

  // Push subscription management
  async subscribeToPush(userId: string, subscription: Omit<PushSubscription, 'userId' | 'createdAt'>): Promise<void> {
    try {
      // Store subscription in database
      await this.storePushSubscription({
        ...subscription,
        userId,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      throw new Error('Failed to subscribe to push notifications');
    }
  }

  async unsubscribeFromPush(userId: string, endpoint: string): Promise<void> {
    try {
      await this.removePushSubscription(endpoint);
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error);
      throw new Error('Failed to unsubscribe from push notifications');
    }
  }

  // User preferences management
  async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<UserNotificationPreferences>
  ): Promise<void> {
    try {
      await this.storeUserPreferences(userId, preferences);
    } catch (error) {
      console.error('Failed to update notification preferences:', error);
      throw new Error('Failed to update notification preferences');
    }
  }

  // Private helper methods
  private async storeNotification(notification: NotificationData): Promise<void> {
    // In production, store in database
    console.log('Storing notification:', notification.id);
  }

  private async getUserNotificationPreferences(userId: string): Promise<UserNotificationPreferences | null> {
    // Mock preferences - in production, fetch from database
    return {
      userId,
      preferences: {
        [NotificationType.NEW_INQUIRY]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
        },
        [NotificationType.OFFER_RECEIVED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH, NotificationChannel.SMS],
        },
        [NotificationType.OFFER_ACCEPTED]: {
          enabled: true,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL, NotificationChannel.PUSH],
        },
        // ... other notification types
      } as any,
      language: 'sv',
      timezone: 'Europe/Stockholm',
    };
  }

  private isInQuietHours(preferences?: UserNotificationPreferences): boolean {
    if (!preferences?.preferences) return false;

    // Check if current time is in quiet hours
    const now = new Date();
    const currentTime = now.toLocaleTimeString('sv-SE', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: preferences.timezone 
    });

    // Mock quiet hours check
    return currentTime >= '22:00' || currentTime <= '07:00';
  }

  private async scheduleNotification(notification: NotificationData): Promise<void> {
    // Schedule notification for later (e.g., after quiet hours)
    console.log('Scheduling notification for later:', notification.id);
  }

  private getEmailTemplate(type: NotificationType, language: string): string {
    // Return appropriate email template
    return `email-template-${type.toLowerCase()}-${language}`;
  }

  private formatSMSMessage(notification: NotificationData, language: string): string {
    // Format SMS message for the notification type
    return `123hansa: ${notification.title} - ${notification.message}`;
  }

  private async getUserPushSubscriptions(userId: string): Promise<PushSubscription[]> {
    // Mock subscriptions - in production, fetch from database
    return [];
  }

  private getNotificationUrl(notification: NotificationData): string {
    // Generate URL based on notification type
    switch (notification.type) {
      case NotificationType.NEW_INQUIRY:
        return `/dashboard/inquiries/${notification.data?.inquiryId}`;
      case NotificationType.OFFER_RECEIVED:
        return `/dashboard/offers/${notification.data?.offerId}`;
      default:
        return '/dashboard/notifications';
    }
  }

  private getPushActions(type: NotificationType): any[] {
    // Return push notification actions based on type
    switch (type) {
      case NotificationType.OFFER_RECEIVED:
        return [
          { action: 'view', title: 'Visa bud' },
          { action: 'respond', title: 'Svara' },
        ];
      case NotificationType.NEW_INQUIRY:
        return [
          { action: 'view', title: 'Visa förfrågan' },
          { action: 'reply', title: 'Svara' },
        ];
      default:
        return [{ action: 'view', title: 'Visa' }];
    }
  }

  private getPushUrgency(priority: string): 'very-low' | 'low' | 'normal' | 'high' {
    switch (priority) {
      case 'URGENT': return 'high';
      case 'HIGH': return 'normal';
      case 'MEDIUM': return 'low';
      default: return 'very-low';
    }
  }

  private getPushTTL(type: NotificationType): number {
    // Return TTL in seconds based on notification type
    switch (type) {
      case NotificationType.OFFER_RECEIVED: return 86400; // 24 hours
      case NotificationType.NEW_INQUIRY: return 43200; // 12 hours
      default: return 3600; // 1 hour
    }
  }

  private async getUserWebhooks(userId: string): Promise<any[]> {
    // Get user's webhook configurations
    return [];
  }

  private generateWebhookSignature(notification: NotificationData, secret: string): string {
    // Generate HMAC signature for webhook security
    return 'mock-signature';
  }

  private async removePushSubscription(endpoint: string): Promise<void> {
    // Remove invalid push subscription
    console.log('Removing push subscription:', endpoint);
  }

  private async storePushSubscription(subscription: PushSubscription): Promise<void> {
    // Store push subscription in database
    console.log('Storing push subscription for user:', subscription.userId);
  }

  private async storeUserPreferences(userId: string, preferences: any): Promise<void> {
    // Store user preferences in database
    console.log('Storing preferences for user:', userId);
  }

  private async getStoredNotifications(
    userId: string, 
    page: number, 
    limit: number, 
    types?: NotificationType[]
  ): Promise<NotificationData[]> {
    // Mock notifications for demo
    return [];
  }

  private async getTotalNotificationCount(userId: string, types?: NotificationType[]): Promise<number> {
    return 0;
  }

  private async getUnreadNotificationCount(userId: string): Promise<number> {
    return 0;
  }

  private async updateNotificationReadStatus(notificationId: string, userId: string, readAt: Date): Promise<void> {
    console.log('Marking notification as read:', notificationId);
  }

  private getVerificationCapabilities(verificationType: string): string[] {
    const capabilities: Record<string, string[]> = {
      'email': ['Skapa annonser', 'Kontakta säljare'],
      'phone': ['Lägga bud', 'Mobilverifiering'],
      'bankid': ['Sälja företag', 'Höga transaktioner'],
      'enhanced': ['Internationella affärer', 'Premium funktioner'],
    };
    return capabilities[verificationType] || [];
  }
}

export { 
  NotificationService, 
  NotificationData, 
  NotificationType, 
  NotificationChannel,
  UserNotificationPreferences,
  PushSubscription 
};