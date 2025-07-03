import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Notification, notificationService } from '../../services/messageService';
import { getSocketService } from '../../services/socketService';
import { formatDistanceToNow } from 'date-fns';
import { sv } from 'date-fns/locale';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserId: string;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  isOpen,
  onClose,
  currentUserId,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const socketService = getSocketService();

  // Load notifications
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const result = await notificationService.getUserNotifications(1, 20);
      setNotifications(result.notifications || []);
    } catch (error) {
      console.error('Failed to load notifications:', error);
      toast.error('Kunde inte ladda notifikationer');
    } finally {
      setIsLoading(false);
    }
  };

  // Load unread count
  const loadUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadNotificationsCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await notificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ 
        ...n, 
        isRead: true, 
        readAt: new Date().toISOString() 
      })));
      setUnreadCount(0);
      toast.success('Alla notifikationer markerade som lästa');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      toast.error('Kunde inte markera som lästa');
    }
  };

  // Delete notification
  const deleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      const notification = notifications.find(n => n.id === notificationId);
      if (notification && !notification.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      toast.success('Notifikation borttagen');
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('Kunde inte ta bort notifikation');
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }

    // Handle navigation based on notification type
    if (notification.type === 'MESSAGE' && notification.data?.conversationId) {
      // Navigate to conversation
      window.location.href = `/messages?conversation=${notification.data.conversationId}`;
    } else if (notification.type === 'LISTING_INQUIRY' && notification.data?.listingId) {
      // Navigate to listing
      window.location.href = `/listings/${notification.data.listingId}`;
    }
  };

  // Get notification icon
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return '💬';
      case 'LISTING_INQUIRY':
        return '🔔';
      case 'LISTING_UPDATE':
        return '📝';
      case 'TRANSACTION':
        return '💳';
      case 'SYSTEM':
        return '⚙️';
      default:
        return '📢';
    }
  };

  // Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'MESSAGE':
        return 'bg-nordic-blue-50 border-nordic-blue-200';
      case 'LISTING_INQUIRY':
        return 'bg-nordic-green-50 border-nordic-green-200';
      case 'LISTING_UPDATE':
        return 'bg-nordic-yellow-50 border-nordic-yellow-200';
      case 'TRANSACTION':
        return 'bg-nordic-purple-50 border-nordic-purple-200';
      case 'SYSTEM':
        return 'bg-nordic-gray-50 border-nordic-gray-200';
      default:
        return 'bg-nordic-gray-50 border-nordic-gray-200';
    }
  };

  // Socket event handlers
  useEffect(() => {
    const handleNewNotification = (notification: Notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast
      toast(`${getNotificationIcon(notification.type)} ${notification.title}`, {
        duration: 4000,
      });
    };

    socketService.on('notification', handleNewNotification);

    return () => {
      socketService.off('notification', handleNewNotification);
    };
  }, [socketService]);

  // Load data when panel opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadUnreadCount();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-25"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-nordic-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-nordic-gray-900">
                Notifikationer
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-nordic-gray-500 hover:text-nordic-gray-700 hover:bg-nordic-gray-100 rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Actions */}
            {unreadCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-nordic-gray-600">
                  {unreadCount} olästa
                </span>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-nordic-blue-600 hover:text-nordic-blue-700 font-medium"
                >
                  Markera alla som lästa
                </button>
              </div>
            )}
          </div>

          {/* Notifications list */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="p-6 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nordic-blue-600 mx-auto mb-4"></div>
                <p className="text-nordic-gray-500">Laddar notifikationer...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-6xl mb-4">🔔</div>
                <h3 className="text-lg font-medium text-nordic-gray-900 mb-2">
                  Inga notifikationer
                </h3>
                <p className="text-nordic-gray-500">
                  Du kommer att få notifikationer här när något händer
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-l-4 cursor-pointer hover:bg-nordic-gray-50 transition-colors ${
                      getNotificationColor(notification.type)
                    } ${!notification.isRead ? 'bg-opacity-100' : 'bg-opacity-50'}`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-lg">
                            {getNotificationIcon(notification.type)}
                          </span>
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.isRead ? 'text-nordic-gray-900' : 'text-nordic-gray-700'
                          }`}>
                            {notification.title}
                          </h4>
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-nordic-blue-600 rounded-full flex-shrink-0"></div>
                          )}
                        </div>
                        <p className={`text-sm ${
                          !notification.isRead ? 'text-nordic-gray-800' : 'text-nordic-gray-600'
                        }`}>
                          {notification.content}
                        </p>
                        <p className="text-xs text-nordic-gray-500 mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                            locale: sv,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center space-x-1 ml-2">
                        {!notification.isRead && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notification.id);
                            }}
                            className="p-1 text-nordic-gray-400 hover:text-nordic-blue-600 rounded"
                            title="Markera som läst"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notification.id);
                          }}
                          className="p-1 text-nordic-gray-400 hover:text-red-600 rounded"
                          title="Ta bort"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;