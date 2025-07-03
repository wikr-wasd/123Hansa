import React, { useState, useEffect } from 'react';
import { Bell, X, Check, Clock, DollarSign, MessageCircle, AlertTriangle, Settings, Filter } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface Notification {
  id: string;
  type: 'NEW_INQUIRY' | 'OFFER_RECEIVED' | 'OFFER_ACCEPTED' | 'PAYMENT_RECEIVED' | 'VERIFICATION_APPROVED' | 'SYSTEM';
  title: string;
  message: string;
  data?: Record<string, any>;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  readAt?: Date;
  createdAt: Date;
  actionUrl?: string;
}

interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  marketingEmails: boolean;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all');
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    marketingEmails: true,
    quietHours: {
      enabled: true,
      start: '22:00',
      end: '07:00',
    },
  });

  // Mock notifications for demo
  useEffect(() => {
    const mockNotifications: Notification[] = [
      {
        id: 'notif-1',
        type: 'OFFER_RECEIVED',
        title: 'Nytt bud mottaget!',
        message: 'Du har fått ett bud på 8.5M SEK för ditt tech-företag',
        data: {
          offerId: 'offer-123',
          businessId: 'business-456',
          amount: 8500000,
          buyerName: 'Johan Andersson',
        },
        priority: 'URGENT',
        createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        actionUrl: '/dashboard/offers/offer-123',
      },
      {
        id: 'notif-2',
        type: 'NEW_INQUIRY',
        title: 'Ny förfrågan',
        message: 'Anna Lindström har skickat en förfrågan om ditt restaurangföretag',
        data: {
          inquiryId: 'inquiry-789',
          businessId: 'business-321',
          buyerName: 'Anna Lindström',
        },
        priority: 'HIGH',
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        actionUrl: '/dashboard/inquiries/inquiry-789',
      },
      {
        id: 'notif-3',
        type: 'VERIFICATION_APPROVED',
        title: 'Verifiering godkänd',
        message: 'Din BankID-verifiering har godkänts. Du kan nu sälja företag.',
        priority: 'MEDIUM',
        readAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // Read 1 hour ago
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        actionUrl: '/dashboard/verification',
      },
      {
        id: 'notif-4',
        type: 'PAYMENT_RECEIVED',
        title: 'Betalning mottagen',
        message: 'Handpenning på 500,000 SEK har mottagits för företagsförvärvet',
        data: {
          paymentId: 'payment-456',
          amount: 500000,
          transactionId: 'txn-789',
        },
        priority: 'MEDIUM',
        readAt: new Date(Date.now() - 30 * 60 * 1000),
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        actionUrl: '/dashboard/payments/payment-456',
      },
      {
        id: 'notif-5',
        type: 'SYSTEM',
        title: 'Systemuppdatering',
        message: 'Nya funktioner är tillgängliga: förbättrad sökfunktion och mobilapp',
        priority: 'LOW',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        actionUrl: '/updates',
      },
    ];

    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.readAt).length);
  }, []);

  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { className: "w-5 h-5" };
    
    switch (type) {
      case 'OFFER_RECEIVED':
        return <DollarSign {...iconProps} className="w-5 h-5 text-green-600" />;
      case 'NEW_INQUIRY':
        return <MessageCircle {...iconProps} className="w-5 h-5 text-blue-600" />;
      case 'OFFER_ACCEPTED':
        return <Check {...iconProps} className="w-5 h-5 text-green-600" />;
      case 'PAYMENT_RECEIVED':
        return <DollarSign {...iconProps} className="w-5 h-5 text-green-600" />;
      case 'VERIFICATION_APPROVED':
        return <Check {...iconProps} className="w-5 h-5 text-blue-600" />;
      case 'SYSTEM':
        return <AlertTriangle {...iconProps} className="w-5 h-5 text-orange-600" />;
      default:
        return <Bell {...iconProps} className="w-5 h-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'URGENT': return 'border-l-red-500 bg-red-50';
      case 'HIGH': return 'border-l-orange-500 bg-orange-50';
      case 'MEDIUM': return 'border-l-blue-500 bg-blue-50';
      default: return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'just nu';
    if (diffInMinutes < 60) return `${diffInMinutes}m sedan`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h sedan`;
    return `${Math.floor(diffInMinutes / 1440)}d sedan`;
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, readAt: new Date() }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    const now = new Date();
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, readAt: notif.readAt || now }))
    );
    setUnreadCount(0);
  };

  const deleteNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    const notification = notifications.find(n => n.id === notificationId);
    if (notification && !notification.readAt) {
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const filteredNotifications = notifications.filter(notif => {
    switch (filter) {
      case 'unread': return !notif.readAt;
      case 'important': return notif.priority === 'URGENT' || notif.priority === 'HIGH';
      default: return true;
    }
  });

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.readAt) {
      markAsRead(notification.id);
    }
    
    if (notification.actionUrl) {
      // In production, navigate to the action URL
      console.log('Navigate to:', notification.actionUrl);
    }
  };

  const updatePreferences = (key: keyof NotificationPreferences, value: any) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
    
    // In production, save to backend
    console.log('Updated notification preferences:', { [key]: value });
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Notifieringar</CardTitle>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Filter className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => setFilter('all')}>
                      Alla notifieringar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('unread')}>
                      Endast olästa
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilter('important')}>
                      Viktiga notifieringar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-80">
                    <DropdownMenuLabel>Notifieringsinställningar</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <div className="p-3 space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-notifications" className="text-sm">
                          E-postnotifieringar
                        </Label>
                        <Switch
                          id="email-notifications"
                          checked={preferences.emailNotifications}
                          onCheckedChange={(checked) => updatePreferences('emailNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-notifications" className="text-sm">
                          Push-notifieringar
                        </Label>
                        <Switch
                          id="push-notifications"
                          checked={preferences.pushNotifications}
                          onCheckedChange={(checked) => updatePreferences('pushNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="sms-notifications" className="text-sm">
                          SMS-notifieringar
                        </Label>
                        <Switch
                          id="sms-notifications"
                          checked={preferences.smsNotifications}
                          onCheckedChange={(checked) => updatePreferences('smsNotifications', checked)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="quiet-hours" className="text-sm">
                          Tystnadstimmar (22:00-07:00)
                        </Label>
                        <Switch
                          id="quiet-hours"
                          checked={preferences.quietHours.enabled}
                          onCheckedChange={(checked) => 
                            updatePreferences('quietHours', { ...preferences.quietHours, enabled: checked })
                          }
                        />
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {unreadCount > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {unreadCount} olästa notifieringar
                </span>
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Markera alla som lästa
                </Button>
              </div>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Bell className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Inga notifieringar att visa</p>
                </div>
              ) : (
                <div className="divide-y">
                  {filteredNotifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 cursor-pointer hover:bg-gray-50 border-l-4 transition-colors ${
                        !notification.readAt ? getPriorityColor(notification.priority) : 'border-l-gray-200'
                      } ${!notification.readAt ? 'bg-blue-50/30' : ''}`}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`text-sm font-medium ${
                                !notification.readAt ? 'text-gray-900' : 'text-gray-700'
                              }`}>
                                {notification.title}
                              </h4>
                              <p className={`text-sm mt-1 ${
                                !notification.readAt ? 'text-gray-600' : 'text-gray-500'
                              }`}>
                                {notification.message}
                              </p>
                              
                              {/* Additional data display */}
                              {notification.data && notification.type === 'OFFER_RECEIVED' && (
                                <div className="mt-2 flex items-center gap-2">
                                  <Badge variant="secondary" className="text-xs">
                                    {notification.data.amount?.toLocaleString()} SEK
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    från {notification.data.buyerName}
                                  </span>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-2 ml-2">
                              {!notification.readAt && (
                                <div className="w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteNotification(notification.id);
                                }}
                                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-400">
                              {formatRelativeTime(notification.createdAt)}
                            </span>
                            
                            {notification.priority === 'URGENT' && (
                              <Badge variant="destructive" className="text-xs">
                                Urgent
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {filteredNotifications.length > 0 && (
              <>
                <Separator />
                <div className="p-3">
                  <Button variant="ghost" className="w-full justify-center text-sm">
                    Visa alla notifieringar
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;