import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  User, 
  Building2, 
  Heart, 
  Eye, 
  MessageSquare, 
  Bell, 
  Settings, 
  TrendingUp,
  DollarSign,
  Calendar,
  Star,
  Plus,
  Search,
  Filter,
  Mail,
  Phone,
  MapPin,
  Edit,
  BookmarkIcon,
  ShoppingCart,
  CreditCard,
  Award,
  Clock,
  Check,
  ExternalLink,
  MoreHorizontal,
  Send,
  Shield,
  Reply,
  X,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { HeartContract } from '../../components/heart/HeartContract';
import { EnhancedHeartContract } from '../../components/heart/EnhancedHeartContract';
import { VerificationModal } from '../../components/auth/VerificationModal';

const DashboardPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'favorites' | 'messages' | 'purchases' | 'heart' | 'profile' | 'settings'>('overview');
  const { user: authUser } = useAuthStore();
  const [userListings, setUserListings] = useState<any[]>([]);
  const [userFavorites, setUserFavorites] = useState<any[]>([]);
  const [userMessages, setUserMessages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [selectedMessage, setSelectedMessage] = useState<any | null>(null);
  const [showMessageCompose, setShowMessageCompose] = useState(false);
  const [replyFormData, setReplyFormData] = useState({
    recipient: '',
    subject: '',
    content: ''
  });
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    firstName: authUser?.firstName || '',
    lastName: authUser?.lastName || '',
    email: authUser?.email || '',
    phone: '+46 70 123 4567',
    location: 'Stockholm'
  });
  const [verificationModal, setVerificationModal] = useState<{
    isOpen: boolean;
    type: 'email' | 'phone';
    newValue: string;
  }>({
    isOpen: false,
    type: 'email',
    newValue: ''
  });
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [viewingListing, setViewingListing] = useState<any | null>(null);

  // Get real user data from auth store
  const user = {
    name: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Användare',
    email: authUser?.email || '',
    phone: '+46 70 123 4567',
    location: 'Stockholm',
    verified: authUser?.isEmailVerified || false,
    memberSince: authUser?.createdAt || '2024-01-15',
    avatar: authUser ? `${authUser.firstName[0]}${authUser.lastName[0]}` : 'U'
  };

  // Handle navigation state from CreateListingPage
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [location.state]);

  // Load user data on component mount and when active tab changes
  useEffect(() => {
    loadUserData();
    loadNotifications();
  }, [authUser, activeTab]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.relative')) {
        setOpenDropdown(null);
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadUserData = async () => {
    if (!authUser) return;
    
    setIsLoading(true);
    try {
      // Load user's listings from localStorage or API
      const savedListings = JSON.parse(localStorage.getItem(`userListings_${authUser.id}`) || '[]');
      const savedFavorites = JSON.parse(localStorage.getItem(`userFavorites_${authUser.id}`) || '[]');
      const savedMessages = JSON.parse(localStorage.getItem(`userMessages_${authUser.id}`) || '[]');
      
      setUserListings(savedListings);
      setUserFavorites(savedFavorites);
      setUserMessages(savedMessages);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileSave = () => {
    const originalEmail = authUser?.email || '';
    const originalPhone = '+46 70 123 4567'; // Get from user data
    
    // Check if email changed
    if (profileFormData.email !== originalEmail) {
      setVerificationModal({
        isOpen: true,
        type: 'email',
        newValue: profileFormData.email
      });
      return;
    }
    
    // Check if phone changed
    if (profileFormData.phone !== originalPhone) {
      setVerificationModal({
        isOpen: true,
        type: 'phone',
        newValue: profileFormData.phone
      });
      return;
    }
    
    // No verification needed, save directly
    saveProfile();
  };

  const saveProfile = () => {
    // Simulate saving profile
    toast.success('Profil uppdaterad!');
    setIsEditingProfile(false);
  };

  const handleVerificationComplete = (verified: boolean) => {
    if (verified) {
      saveProfile();
    }
    setVerificationModal({ isOpen: false, type: 'email', newValue: '' });
  };

  const loadNotifications = () => {
    if (!authUser) return;
    
    // Load notifications from localStorage or create demo notifications
    const savedNotifications = JSON.parse(localStorage.getItem(`notifications_${authUser.id}`) || '[]');
    
    // Add some demo notifications if none exist
    if (savedNotifications.length === 0) {
      const demoNotifications = [
        {
          id: 'notif_1',
          type: 'message',
          title: 'Nytt meddelande',
          message: 'Du har fått ett nytt meddelande från Anna Karlsson',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
          read: false,
          icon: '💬'
        },
        {
          id: 'notif_2',
          type: 'listing',
          title: 'Annons visad',
          message: 'Din annons "TechStartup AB" har visats 5 gånger idag',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          read: false,
          icon: '👁️'
        },
        {
          id: 'notif_3',
          type: 'heart',
          title: 'Heart Avtal',
          message: 'Du har ett nytt Heart avtal att granska',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          read: true,
          icon: '❤️'
        }
      ];
      
      setNotifications(demoNotifications);
      localStorage.setItem(`notifications_${authUser.id}`, JSON.stringify(demoNotifications));
    } else {
      setNotifications(savedNotifications);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    const updatedNotifications = notifications.map(n =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    setNotifications(updatedNotifications);
    localStorage.setItem(`notifications_${authUser?.id}`, JSON.stringify(updatedNotifications));
  };

  const clearAllNotifications = () => {
    const clearedNotifications = notifications.map(n => ({ ...n, read: true }));
    setNotifications(clearedNotifications);
    localStorage.setItem(`notifications_${authUser?.id}`, JSON.stringify(clearedNotifications));
    toast.success('Alla notifikationer markerade som lästa');
  };

  const userStats = {
    activeListings: userListings.filter(l => l.status === 'active').length,
    totalViews: userListings.reduce((sum, l) => sum + (l.views || 0), 0),
    savedListings: userFavorites.length,
    completedPurchases: 3,
    unreadMessages: userMessages.filter(m => !m.read).length,
    unreadNotifications: notifications.filter(n => !n.read).length,
    totalSpent: 450000,
    rating: 4.8,
    reviewCount: 12
  };

  // Functions for managing favorites
  const addToFavorites = (listing: any) => {
    if (!authUser) return;
    
    const newFavorite = {
      ...listing,
      savedAt: new Date().toISOString(),
      userId: authUser.id
    };
    
    const updatedFavorites = [...userFavorites, newFavorite];
    setUserFavorites(updatedFavorites);
    localStorage.setItem(`userFavorites_${authUser.id}`, JSON.stringify(updatedFavorites));
    toast.success('Tillagd i favoriter!');
  };

  const removeFromFavorites = (listingId: string) => {
    if (!authUser) return;
    
    const updatedFavorites = userFavorites.filter(f => f.id !== listingId);
    setUserFavorites(updatedFavorites);
    localStorage.setItem(`userFavorites_${authUser.id}`, JSON.stringify(updatedFavorites));
    toast.success('Borttagen från favoriter');
  };

  // Function for sending messages
  const sendMessage = (recipientId: string, subject: string, content: string) => {
    if (!authUser) return;
    
    const message = {
      id: Date.now().toString(),
      from: authUser.id,
      fromName: `${authUser.firstName} ${authUser.lastName}`,
      to: recipientId,
      subject,
      content,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    // Save message for sender
    const senderMessages = [...userMessages, { ...message, type: 'sent' }];
    setUserMessages(senderMessages);
    localStorage.setItem(`userMessages_${authUser.id}`, JSON.stringify(senderMessages));
    
    // Save message for recipient (notification)
    const recipientMessages = JSON.parse(localStorage.getItem(`userMessages_${recipientId}`) || '[]');
    recipientMessages.push({ ...message, type: 'received' });
    localStorage.setItem(`userMessages_${recipientId}`, JSON.stringify(recipientMessages));
    
    toast.success('Meddelande skickat!');
  };

  // Function for viewing listing details
  const handleViewListing = (listingId: string) => {
    const listing = allUserListings.find(l => l.id === listingId);
    if (listing) {
      setViewingListing(listing);
    } else {
      // Navigate to public listing page
      window.open(`/listings/${listingId}`, '_blank');
    }
    setOpenDropdown(null);
  };

  // Function for editing listing
  const handleEditListing = (listingId: string) => {
    const listing = allUserListings.find(l => l.id === listingId);
    if (!listing) return;
    
    // Set up edit modal with current listing data
    setEditingListing(listing);
    setEditFormData({
      title: listing.title || '',
      description: listing.description || '',
      longDescription: listing.longDescription || '',
      price: listing.price?.toString() || '',
      category: listing.category || 'companies',
      industry: listing.industry || listing.sector || '',
      employees: listing.financials?.employees?.toString() || '',
      revenue: listing.financials?.revenue?.toString() || '',
      website: listing.website || '',
      location: listing.location?.city || '',
      contactName: listing.contactName || '',
      contactEmail: listing.contactEmail || '',
      contactPhone: listing.contactPhone || '',
      reasonForSelling: listing.reasonForSelling || '',
      timeframe: listing.timeframe || '',
      negotiable: listing.negotiable !== false
    });
    setOpenDropdown(null);
  };

  // Function to save edited listing
  const handleSaveEditedListing = () => {
    if (!editingListing || !authUser) return;
    
    const updatedListing = {
      ...editingListing,
      title: editFormData.title,
      description: editFormData.description,
      longDescription: editFormData.longDescription,
      price: parseInt(editFormData.price) || 0,
      category: editFormData.category,
      industry: editFormData.industry,
      website: editFormData.website,
      contactName: editFormData.contactName,
      contactEmail: editFormData.contactEmail,
      contactPhone: editFormData.contactPhone,
      reasonForSelling: editFormData.reasonForSelling,
      timeframe: editFormData.timeframe,
      negotiable: editFormData.negotiable,
      financials: {
        ...editingListing.financials,
        employees: parseInt(editFormData.employees) || 0,
        revenue: parseInt(editFormData.revenue) || 0
      },
      location: {
        ...editingListing.location,
        city: editFormData.location
      },
      updatedAt: new Date().toISOString()
    };
    
    // Update listings array
    const updatedListings = userListings.map(l => 
      l.id === editingListing.id ? updatedListing : l
    );
    
    // Save to localStorage
    setUserListings(updatedListings);
    localStorage.setItem(`userListings_${authUser.id}`, JSON.stringify(updatedListings));
    
    // Close modal and show success
    setEditingListing(null);
    setEditFormData({});
    toast.success('Annons uppdaterad framgångsrikt!');
    loadUserData();
  };

  // Function to cancel editing
  const handleCancelEdit = () => {
    setEditingListing(null);
    setEditFormData({});
  };

  // Function to handle message click
  const handleMessageClick = (message: any) => {
    setSelectedMessage(message);
    // Mark as read if it's unread
    if (!message.read && message.type === 'received') {
      handleMarkAsRead(message.id);
    }
  };

  // Function to start reply to message
  const handleReplyToMessage = (message: any) => {
    setReplyFormData({
      recipient: message.type === 'received' ? message.from : message.to,
      subject: message.subject.startsWith('Re: ') ? message.subject : `Re: ${message.subject}`,
      content: ''
    });
    setShowMessageCompose(true);
  };

  // Function to start new message
  const handleNewMessage = () => {
    setReplyFormData({
      recipient: '',
      subject: '',
      content: ''
    });
    setShowMessageCompose(true);
  };

  // Function to send reply/new message
  const handleSendMessage = () => {
    if (!authUser || !replyFormData.recipient || !replyFormData.subject || !replyFormData.content) {
      toast.error('Fyll i alla fält');
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      from: authUser.id,
      fromName: `${authUser.firstName} ${authUser.lastName}`,
      to: replyFormData.recipient,
      subject: replyFormData.subject,
      content: replyFormData.content,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'sent'
    };

    // Add to user's messages
    const updatedMessages = [...userMessages, newMessage];
    setUserMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser.id}`, JSON.stringify(updatedMessages));

    // Simulate saving to recipient (in real app this would be sent to server)
    const recipientMessages = JSON.parse(localStorage.getItem(`userMessages_${replyFormData.recipient}`) || '[]');
    recipientMessages.push({ ...newMessage, type: 'received' });
    localStorage.setItem(`userMessages_${replyFormData.recipient}`, JSON.stringify(recipientMessages));

    // Close compose and reset form
    setShowMessageCompose(false);
    setReplyFormData({ recipient: '', subject: '', content: '' });
    setSelectedMessage(null);
    
    toast.success('Meddelande skickat!');
  };

  // Function for deleting listing
  const handleDeleteListing = (listingId: string) => {
    if (!confirm('Är du säker på att du vill ta bort denna annons?')) return;
    
    const updatedListings = userListings.filter(l => l.id !== listingId);
    setUserListings(updatedListings);
    localStorage.setItem(`userListings_${authUser.id}`, JSON.stringify(updatedListings));
    
    setOpenDropdown(null);
    toast.success('Annons borttagen!');
  };

  // Function for creating new listing from dashboard
  const handleCreateListing = () => {
    if (!authUser) {
      toast.error('Du måste vara inloggad för att skapa annonser');
      return;
    }
    
    const title = prompt('Ange titel för din annons:');
    if (!title) return;
    
    const price = prompt('Ange pris (SEK):');
    if (!price || isNaN(Number(price))) return;
    
    const category = prompt('Ange kategori (t.ex. Technology, Retail, Services):');
    if (!category) return;
    
    const description = prompt('Ange beskrivning:');
    if (!description) return;
    
    const newListing = {
      id: `listing_${authUser.id}_${Date.now()}`,
      title,
      price: Number(price),
      category,
      description,
      views: 0,
      status: 'active',
      createdAt: new Date().toISOString(),
      featured: false,
      userId: authUser.id
    };
    
    const updatedListings = [...userListings, newListing];
    setUserListings(updatedListings);
    localStorage.setItem(`userListings_${authUser.id}`, JSON.stringify(updatedListings));
    
    toast.success('Annons skapad!');
  };

  // Function for marking message as read
  const handleMarkAsRead = (messageId: string) => {
    const updatedMessages = userMessages.map(m => 
      m.id === messageId ? { ...m, read: true } : m
    );
    setUserMessages(updatedMessages);
    localStorage.setItem(`userMessages_${authUser?.id}`, JSON.stringify(updatedMessages));
  };

  // Create some demo listings if user has none
  const demoDemoListings = userListings.length === 0 ? [
    {
      id: `demo_${authUser?.id}_1`,
      title: 'Min Demo Annons',
      category: 'Technology',
      price: 1000000,
      views: 12,
      status: 'active',
      createdAt: new Date().toISOString(),
      featured: false,
      description: 'Detta är en demonstration av hur dina annonser kommer att visas.'
    }
  ] : [];

  const allUserListings = [...userListings, ...demoDemoListings];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      maximumFractionDigits: 0
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Helmet>
        <title>Min Dashboard - 123hansa.se</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <User className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">Min Dashboard</h1>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  >
                    <Bell className="w-6 h-6" />
                    {userStats.unreadNotifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                        {userStats.unreadNotifications}
                      </span>
                    )}
                  </button>
                  
                  {/* Large Notifications Modal */}
                  {showNotifications && (
                    <>
                      {/* Background overlay */}
                      <div 
                        className="fixed inset-0 bg-black bg-opacity-50 z-40"
                        onClick={() => setShowNotifications(false)}
                      ></div>
                      
                      {/* Large notifications panel */}
                      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
                          {/* Header */}
                          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            <div className="flex items-center">
                              <Bell className="w-6 h-6 mr-3" />
                              <h2 className="text-2xl font-bold">Notifikationer</h2>
                              {userStats.unreadNotifications > 0 && (
                                <span className="ml-3 bg-pink-500 text-white text-sm rounded-full px-3 py-1">
                                  {userStats.unreadNotifications} nya
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-3">
                              {userStats.unreadNotifications > 0 && (
                                <button
                                  onClick={clearAllNotifications}
                                  className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium transition-colors"
                                >
                                  Markera alla som lästa
                                </button>
                              )}
                              <button
                                onClick={() => setShowNotifications(false)}
                                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                              >
                                <X className="w-6 h-6" />
                              </button>
                            </div>
                          </div>
                          
                          {/* Content */}
                          <div className="overflow-y-auto max-h-[calc(90vh-100px)]">
                            {notifications.length > 0 ? (
                              <div className="divide-y divide-gray-100">
                                {notifications.map((notification) => (
                                  <div
                                    key={notification.id}
                                    className={`p-6 hover:bg-gray-50 transition-colors cursor-pointer ${
                                      !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                                    }`}
                                    onClick={() => {
                                      markNotificationAsRead(notification.id);
                                      // Navigate based on notification type
                                      if (notification.type === 'heart') {
                                        setActiveTab('heart');
                                        setShowNotifications(false);
                                      } else if (notification.type === 'message') {
                                        setActiveTab('messages');
                                        setShowNotifications(false);
                                      } else if (notification.type === 'listing') {
                                        setActiveTab('listings');
                                        setShowNotifications(false);
                                      }
                                    }}
                                  >
                                    <div className="flex items-start space-x-4">
                                      <div className="text-3xl flex-shrink-0">{notification.icon}</div>
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-2">
                                          <h3 className={`text-lg font-semibold ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                            {notification.title}
                                          </h3>
                                          <div className="flex items-center space-x-2">
                                            {!notification.read && (
                                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                            )}
                                            <span className="text-sm text-gray-500">
                                              {formatDate(notification.timestamp)}
                                            </span>
                                          </div>
                                        </div>
                                        <p className="text-gray-600 mb-3 leading-relaxed">{notification.message}</p>
                                        
                                        {/* Notification type badge */}
                                        <div className="flex items-center justify-between">
                                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                            notification.type === 'heart' ? 'bg-pink-100 text-pink-800' :
                                            notification.type === 'message' ? 'bg-blue-100 text-blue-800' :
                                            notification.type === 'listing' ? 'bg-green-100 text-green-800' :
                                            'bg-gray-100 text-gray-800'
                                          }`}>
                                            {notification.type === 'heart' ? 'Heart Avtal' :
                                             notification.type === 'message' ? 'Meddelande' :
                                             notification.type === 'listing' ? 'Annons' :
                                             'Allmän'}
                                          </span>
                                          
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Navigate to specific notification
                                              if (notification.type === 'heart') {
                                                setActiveTab('heart');
                                                setShowNotifications(false);
                                              } else if (notification.type === 'message') {
                                                setActiveTab('messages');
                                                setShowNotifications(false);
                                              } else if (notification.type === 'listing') {
                                                setActiveTab('listings');
                                                setShowNotifications(false);
                                              }
                                            }}
                                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                                          >
                                            Visa <ArrowRight className="w-4 h-4 ml-1" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="p-12 text-center text-gray-500">
                                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Inga notifikationer</h3>
                                <p className="text-gray-600">Du kommer att få notifikationer här när något händer med dina annonser, meddelanden eller Heart-avtal.</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-600">Hej, {user.name}!</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Översikt', icon: TrendingUp },
                { id: 'listings', name: 'Mina annonser', icon: Building2 },
                { id: 'favorites', name: 'Favoriter', icon: Heart },
                { id: 'messages', name: 'Meddelanden', icon: MessageSquare },
                { id: 'purchases', name: 'Fakturor', icon: CreditCard },
                { id: 'heart', name: 'Heart Avtal', icon: Shield },
                { id: 'profile', name: 'Profil', icon: User },
                { id: 'settings', name: 'Inställningar', icon: Settings }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.name}
                    {tab.id === 'messages' && userStats.unreadMessages > 0 && (
                      <span className="ml-2 bg-pink-500 text-white text-xs rounded-full px-2 py-0.5">
                        {userStats.unreadMessages}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Welcome Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">Välkommen tillbaka, {user.name}!</h2>
                    <p className="text-blue-100 mt-2">Medlem sedan {formatDate(user.memberSince)}</p>
                    <div className="flex items-center mt-3">
                      {user.verified && (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mr-3">
                          <Check className="w-4 h-4 mr-1" />
                          Verifierad användare
                        </span>
                      )}
                      <div className="flex items-center">
                        <Star className="w-4 h-4 text-yellow-300 mr-1" />
                        <span className="text-sm">{userStats.rating} ({userStats.reviewCount} recensioner)</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold">{userStats.rating}</div>
                    <div className="text-blue-100">Ditt betyg</div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-center space-x-4">
                <Link
                  to="/create-listing"
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Skapa ny annons
                </Link>
                <button
                  onClick={() => setActiveTab('heart')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Shield className="w-5 h-5 mr-2" />
                  Heart Avtal
                </button>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Aktiva annonser</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.activeListings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Eye className="w-8 h-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Totala visningar</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.totalViews}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <Heart className="w-8 h-8 text-pink-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Sparade annonser</p>
                      <p className="text-2xl font-bold text-gray-900">{userStats.savedListings}</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Totalt spenderat</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(userStats.totalSpent)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Senaste meddelanden</h3>
                    <button 
                      onClick={() => setActiveTab('messages')}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Visa alla →
                    </button>
                  </div>
                  <div className="space-y-3">
                    {userMessages.length > 0 ? userMessages.slice(0, 3).map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg border ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">
                              {message.type === 'received' ? message.fromName : `Till: ${message.to}`}
                            </p>
                            <p className="text-sm text-gray-600">{message.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">{message.content.substring(0, 60)}...</p>
                          </div>
                          {!message.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-6 text-gray-500">
                        <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm">Inga meddelanden än</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Mina annonser</h3>
                    <Link to="/create-listing" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                      Skapa ny →
                    </Link>
                  </div>
                  <div className="space-y-3">
                    {allUserListings.length > 0 ? allUserListings.slice(0, 3).map((listing) => (
                      <div key={listing.id} className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{listing.title}</p>
                            <p className="text-sm text-gray-600">{formatPrice(listing.price)}</p>
                            <div className="flex items-center mt-1">
                              <Eye className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{listing.views || 0} visningar</span>
                              {listing.featured && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Utvald
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {listing.status === 'active' ? 'Aktiv' : 'Väntar'}
                            </span>
                            <div className="relative">
                              <button 
                                onClick={() => setOpenDropdown(openDropdown === `overview-${listing.id}` ? null : `overview-${listing.id}`)}
                                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                              >
                                <MoreHorizontal className="w-4 h-4" />
                              </button>
                              
                              {openDropdown === `overview-${listing.id}` && (
                                <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                  <button
                                    onClick={() => handleViewListing(listing.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <ExternalLink className="w-4 h-4 mr-2" />
                                    Visa annons
                                  </button>
                                  <button
                                    onClick={() => handleEditListing(listing.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Edit className="w-4 h-4 mr-2" />
                                    Redigera
                                  </button>
                                  {!listing.id.startsWith('demo_') && (
                                    <button
                                      onClick={() => handleDeleteListing(listing.id)}
                                      className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                                    >
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Ta bort
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8 text-gray-500">
                        <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p>Du har inga annonser än</p>
                        <Link to="/create-listing" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Skapa din första annons →
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Mina annonser</h2>
                <Link
                  to="/create-listing"
                  className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Skapa ny annons
                </Link>
              </div>
              
              {allUserListings.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {allUserListings.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 text-lg">{listing.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{listing.category}</p>
                          <p className="text-2xl font-bold text-blue-600">{formatPrice(listing.price)}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 text-sm rounded-full ${
                            listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {listing.status === 'active' ? 'Aktiv' : 'Väntar'}
                          </span>
                          <div className="relative">
                            <button 
                              onClick={() => setOpenDropdown(openDropdown === `listing-${listing.id}` ? null : `listing-${listing.id}`)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                            >
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                            
                            {openDropdown === `listing-${listing.id}` && (
                              <div className="absolute right-0 top-8 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                                <button
                                  onClick={() => handleViewListing(listing.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Visa annons
                                </button>
                                <button
                                  onClick={() => handleEditListing(listing.id)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Redigera
                                </button>
                                {!listing.id.startsWith('demo_') && (
                                  <button
                                    onClick={() => handleDeleteListing(listing.id)}
                                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center"
                                  >
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Ta bort
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          <span>{listing.views || 0} visningar</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>Skapad {formatDate(listing.createdAt)}</span>
                        </div>
                      </div>
                      
                      {listing.description && (
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{listing.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleViewListing(listing.id)}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Visa
                          </button>
                          <button 
                            onClick={() => handleEditListing(listing.id)}
                            className="text-gray-600 hover:text-gray-700 text-sm font-medium flex items-center"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Redigera
                          </button>
                          {!listing.id.startsWith('demo_') && (
                            <button 
                              onClick={() => handleDeleteListing(listing.id)}
                              className="text-rose-600 hover:text-rose-700 text-sm font-medium"
                            >
                              Ta bort
                            </button>
                          )}
                        </div>
                        {listing.featured && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            <Star className="w-3 h-3 mr-1" />
                            Utvald
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Inga annonser än</h3>
                  <p className="text-gray-600 mb-6">Skapa din första annons för att börja sälja ditt företag eller dina tjänster.</p>
                  <Link
                    to="/create-listing"
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Skapa din första annons
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Mina favoriter</h2>
                <span className="text-sm text-gray-500">{userFavorites.length} sparade annonser</span>
              </div>
              
              {userFavorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userFavorites.map((listing) => (
                    <div key={listing.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                        <button 
                          onClick={() => removeFromFavorites(listing.id)}
                          className="text-pink-500 hover:text-pink-600"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{listing.category}</p>
                      <p className="text-lg font-bold text-blue-600 mb-2">{formatPrice(listing.price)}</p>
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <MapPin className="w-4 h-4 mr-1" />
                        {listing.location || 'Sverige'}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-xs text-gray-400">Sparad {formatDate(listing.savedAt)}</p>
                        <Link 
                          to={`/listings/${listing.id}`}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-1" />
                          Visa
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Inga favoriter än</h3>
                  <p className="text-gray-600 mb-6">Spara annonser som intresserar dig genom att klicka på hjärtat på annonssidor.</p>
                  <Link
                    to="/listings"
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Search className="w-5 h-5 mr-2" />
                    Utforska annonser
                  </Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Meddelanden</h2>
                <div className="flex items-center space-x-3">
                  <span className="bg-rose-100 text-rose-800 text-sm px-3 py-1 rounded-full">
                    {userStats.unreadMessages} olästa
                  </span>
                  <button
                    onClick={handleNewMessage}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Nytt meddelande
                  </button>
                </div>
              </div>
              
              {userMessages.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="divide-y divide-gray-200">
                    {userMessages.map((message) => (
                      <div 
                        key={message.id} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!message.read ? 'bg-blue-50' : ''}`}
                        onClick={() => handleMessageClick(message)}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center">
                              <p className={`font-medium ${!message.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                {message.type === 'received' ? message.fromName : `Till: ${message.to}`}
                              </p>
                              {!message.read && (
                                <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                              )}
                              <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                                message.type === 'received' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {message.type === 'received' ? 'Mottaget' : 'Skickat'}
                              </span>
                            </div>
                            <p className={`text-sm mt-1 ${!message.read ? 'text-gray-900' : 'text-gray-600'}`}>
                              {message.subject}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">{message.content.substring(0, 100)}...</p>
                          </div>
                          <div className="text-xs text-gray-400 ml-4">
                            {formatDate(message.timestamp)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-16">
                  <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Inga meddelanden än</h3>
                  <p className="text-gray-600 mb-6">När någon kontaktar dig om dina annonser kommer meddelandena att visas här.</p>
                  <button
                    onClick={handleNewMessage}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Skriv första meddelandet
                  </button>
                </div>
              )}
              
              {/* Message Detail Modal */}
              {selectedMessage && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4 max-h-[90vh] overflow-hidden">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">Meddelande</h3>
                      <button 
                        onClick={() => setSelectedMessage(null)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="p-6 overflow-y-auto max-h-96">
                      <div className="space-y-4">
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {selectedMessage.type === 'received' ? 'Från' : 'Till'}:
                            </span>
                            <span className="text-sm text-gray-500">
                              {formatDate(selectedMessage.timestamp)}
                            </span>
                          </div>
                          <p className="text-gray-900">
                            {selectedMessage.type === 'received' ? selectedMessage.fromName : selectedMessage.to}
                          </p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Ämne:</span>
                          <p className="text-gray-900 mt-1">{selectedMessage.subject}</p>
                        </div>
                        
                        <div>
                          <span className="text-sm font-medium text-gray-700">Meddelande:</span>
                          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                            <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.content}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                      <button
                        onClick={() => setSelectedMessage(null)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Stäng
                      </button>
                      <button
                        onClick={() => {
                          handleReplyToMessage(selectedMessage);
                          setSelectedMessage(null);
                        }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <Reply className="w-4 h-4 mr-2" />
                        Svara
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Message Compose Modal */}
              {showMessageCompose && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {replyFormData.subject.startsWith('Re: ') ? 'Svara på meddelande' : 'Nytt meddelande'}
                      </h3>
                      <button 
                        onClick={() => setShowMessageCompose(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-6 h-6" />
                      </button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Till:</label>
                        <input
                          type="text"
                          value={replyFormData.recipient}
                          onChange={(e) => setReplyFormData({...replyFormData, recipient: e.target.value})}
                          placeholder="Mottagarens användar-ID eller e-post"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Ämne:</label>
                        <input
                          type="text"
                          value={replyFormData.subject}
                          onChange={(e) => setReplyFormData({...replyFormData, subject: e.target.value})}
                          placeholder="Ämne för meddelandet"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Meddelande:</label>
                        <textarea
                          value={replyFormData.content}
                          onChange={(e) => setReplyFormData({...replyFormData, content: e.target.value})}
                          placeholder="Skriv ditt meddelande här..."
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      </div>
                    </div>
                    
                    <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
                      <button
                        onClick={() => setShowMessageCompose(false)}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Avbryt
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!replyFormData.recipient || !replyFormData.subject || !replyFormData.content}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Skicka
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'purchases' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Fakturor & Betalningar</h2>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-500">{userStats.completedPurchases} genomförda köp</span>
                  <button
                    onClick={() => {
                      // Download all invoices as ZIP
                      toast.success('Laddar ner alla fakturor...');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Ladda ner alla
                  </button>
                </div>
              </div>
              
              {/* Invoice Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Betalda fakturor</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                      <p className="text-sm text-green-600">{formatPrice(145600)} totalt</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Väntande betalning</p>
                      <p className="text-2xl font-bold text-gray-900">1</p>
                      <p className="text-sm text-yellow-600">{formatPrice(5000)} förfaller 2024-07-15</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Nästa betalning</p>
                      <p className="text-lg font-bold text-gray-900">15 Jul</p>
                      <p className="text-sm text-blue-600">Premium-prenumeration</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice List */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Fakturor</h3>
                    <div className="flex items-center space-x-3">
                      <select className="border border-gray-300 rounded-md px-3 py-1 text-sm">
                        <option value="all">Alla fakturor</option>
                        <option value="paid">Betalda</option>
                        <option value="pending">Väntande</option>
                        <option value="overdue">Försenade</option>
                      </select>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                          type="text"
                          placeholder="Sök fakturor..."
                          className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faktura</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belopp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Förfaller</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        {
                          id: 'INV-2024-001',
                          number: '#123456',
                          date: '2024-06-15',
                          amount: 5000,
                          status: 'pending',
                          statusText: 'Väntande',
                          dueDate: '2024-07-15',
                          description: 'Premium-prenumeration - Juli 2024',
                          downloadUrl: '/invoices/INV-2024-001.pdf'
                        },
                        {
                          id: 'INV-2024-002',
                          number: '#123455',
                          date: '2024-05-15',
                          amount: 5000,
                          status: 'paid',
                          statusText: 'Betald',
                          dueDate: '2024-06-15',
                          paidDate: '2024-06-10',
                          description: 'Premium-prenumeration - Juni 2024',
                          downloadUrl: '/invoices/INV-2024-002.pdf'
                        },
                        {
                          id: 'INV-2024-003',
                          number: '#123454',
                          date: '2024-04-15',
                          amount: 7500,
                          status: 'paid',
                          statusText: 'Betald',
                          dueDate: '2024-05-15',
                          paidDate: '2024-05-12',
                          description: 'Annonstaxa - TechStartup AB',
                          downloadUrl: '/invoices/INV-2024-003.pdf'
                        },
                        {
                          id: 'INV-2024-004',
                          number: '#123453',
                          date: '2024-03-15',
                          amount: 15000,
                          status: 'paid',
                          statusText: 'Betald',
                          dueDate: '2024-04-15',
                          paidDate: '2024-04-08',
                          description: 'Företagsvärdering - Detaljerad analys',
                          downloadUrl: '/invoices/INV-2024-004.pdf'
                        }
                      ].map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{invoice.number}</div>
                              <div className="text-sm text-gray-500">{invoice.description}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{formatDate(invoice.date)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(invoice.amount)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              invoice.status === 'paid' 
                                ? 'bg-green-100 text-green-800' 
                                : invoice.status === 'pending'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {invoice.statusText}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {invoice.status === 'paid' && invoice.paidDate ? (
                                <span className="text-green-600">Betald {formatDate(invoice.paidDate)}</span>
                              ) : (
                                formatDate(invoice.dueDate)
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => {
                                  // Generate and download PDF invoice
                                  const invoiceData = `
Faktura ${invoice.number}
                                  
Datum: ${formatDate(invoice.date)}
Förfallodatum: ${formatDate(invoice.dueDate)}
${invoice.paidDate ? `Betald: ${formatDate(invoice.paidDate)}` : ''}

Beskrivning: ${invoice.description}
Belopp: ${formatPrice(invoice.amount)}

Status: ${invoice.statusText}

123hansa.se
Org.nr: 556123-4567
support@123hansa.se
                                  `.trim();
                                  
                                  const blob = new Blob([invoiceData], { type: 'text/plain' });
                                  const url = URL.createObjectURL(blob);
                                  const a = document.createElement('a');
                                  a.href = url;
                                  a.download = `faktura-${invoice.number.replace('#', '')}.txt`;
                                  a.click();
                                  URL.revokeObjectURL(url);
                                  toast.success('Faktura nedladdad');
                                }}
                                className="text-blue-600 hover:text-blue-900 flex items-center"
                                title="Ladda ner faktura"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(invoice.number);
                                  toast.success('Fakturanummer kopierat');
                                }}
                                className="text-gray-600 hover:text-gray-900 flex items-center"
                                title="Kopiera fakturanummer"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </button>
                              {invoice.status === 'pending' && (
                                <button
                                  onClick={() => {
                                    // Simulate payment
                                    toast.success('Omdirigerar till betalning...');
                                    setTimeout(() => {
                                      toast.success('Betalning genomförd!');
                                    }, 2000);
                                  }}
                                  className="text-green-600 hover:text-green-900 flex items-center"
                                  title="Betala nu"
                                >
                                  <CreditCard className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Methods */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Betalningsmetoder</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">Visa ****1234</p>
                        <p className="text-sm text-gray-500">Förfaller 12/25</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Standard</span>
                      <button
                        onClick={() => toast.success('Redigerar betalningsmetod...')}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        Redigera
                      </button>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => toast.success('Lägger till ny betalningsmetod...')}
                    className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors flex items-center justify-center"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Lägg till betalningsmetod
                  </button>
                </div>
              </div>

              {/* Billing Address */}
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Faktureringsadress</h3>
                  <button
                    onClick={() => toast.success('Redigerar faktureringsadress...')}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    Redigera
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="font-medium text-gray-900">{user.name}</p>
                  <p>Storgatan 123</p>
                  <p>111 22 Stockholm</p>
                  <p>Sverige</p>
                  <p className="mt-2">
                    <span className="font-medium">Email:</span> {user.email}
                  </p>
                  <p>
                    <span className="font-medium">Telefon:</span> {user.phone}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Inställningar</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Profilinformation</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                      <input
                        type="text"
                        value={user.name}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">E-post</label>
                      <input
                        type="email"
                        value={user.email}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="tel"
                        value={user.phone}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
                      <input
                        type="text"
                        value={user.location}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        readOnly
                      />
                    </div>
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                      Uppdatera profil
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifieringar</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">E-postnotifieringar</p>
                        <p className="text-sm text-gray-600">Få meddelanden via e-post</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">SMS-notifieringar</p>
                        <p className="text-sm text-gray-600">Få viktiga meddelanden via SMS</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Marknadsföring</p>
                        <p className="text-sm text-gray-600">Få information om nya funktioner</p>
                      </div>
                      <input type="checkbox" className="h-4 w-4 text-blue-600" defaultChecked />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'heart' && (
            <div className="space-y-6">
              <EnhancedHeartContract />
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Min Profil</h2>
                {!isEditingProfile && (
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Redigera profil
                  </button>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Profilinformation</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Förnamn</label>
                      <input
                        type="text"
                        value={isEditingProfile ? profileFormData.firstName : (authUser?.firstName || '')}
                        onChange={(e) => setProfileFormData({...profileFormData, firstName: e.target.value})}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        }`}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Efternamn</label>
                      <input
                        type="text"
                        value={isEditingProfile ? profileFormData.lastName : (authUser?.lastName || '')}
                        onChange={(e) => setProfileFormData({...profileFormData, lastName: e.target.value})}
                        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          !isEditingProfile ? 'bg-gray-50' : ''
                        }`}
                        readOnly={!isEditingProfile}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      E-post
                      {isEditingProfile && (
                        <span className="text-xs text-amber-600 ml-2">
                          (Kräver verifiering vid ändring)
                        </span>
                      )}
                    </label>
                    <input
                      type="email"
                      value={isEditingProfile ? profileFormData.email : user.email}
                      onChange={(e) => setProfileFormData({...profileFormData, email: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Telefon
                      {isEditingProfile && (
                        <span className="text-xs text-amber-600 ml-2">
                          (Kräver verifiering vid ändring)
                        </span>
                      )}
                    </label>
                    <input
                      type="tel"
                      value={isEditingProfile ? profileFormData.phone : user.phone}
                      onChange={(e) => setProfileFormData({...profileFormData, phone: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
                    <input
                      type="text"
                      value={isEditingProfile ? profileFormData.location : user.location}
                      onChange={(e) => setProfileFormData({...profileFormData, location: e.target.value})}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        !isEditingProfile ? 'bg-gray-50' : ''
                      }`}
                      readOnly={!isEditingProfile}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medlem sedan</label>
                    <input
                      type="text"
                      value={formatDate(user.memberSince)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                      readOnly
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {user.verified ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <Check className="w-4 h-4 mr-1" />
                        Verifierad användare
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-4 h-4 mr-1" />
                        Väntande verifiering
                      </span>
                    )}
                  </div>
                  
                  {isEditingProfile && (
                    <div className="flex space-x-3 pt-4">
                      <button
                        onClick={handleProfileSave}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                      >
                        Spara ändringar
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingProfile(false);
                          setProfileFormData({
                            firstName: authUser?.firstName || '',
                            lastName: authUser?.lastName || '',
                            email: authUser?.email || '',
                            phone: '+46 70 123 4567',
                            location: 'Stockholm'
                          });
                        }}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                      >
                        Avbryt
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Listing Detail Modal */}
        {viewingListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">Annonsdetaljer</h2>
                <button
                  onClick={() => setViewingListing(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">{viewingListing.title}</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pris</label>
                        <p className="text-3xl font-bold text-blue-600">{formatPrice(viewingListing.price)}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                        <p className="text-gray-900">{viewingListing.category}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          viewingListing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {viewingListing.status === 'active' ? 'Aktiv' : 'Väntar'}
                        </span>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
                        <p className="text-gray-900 whitespace-pre-wrap">{viewingListing.description || 'Ingen beskrivning tillgänglig'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="bg-gray-50 rounded-lg p-6">
                      <h4 className="text-lg font-semibold text-gray-900 mb-4">Statistik</h4>
                      
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Visningar:</span>
                          <span className="font-medium">{viewingListing.views || 0}</span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-gray-600">Skapad:</span>
                          <span className="font-medium">{formatDate(viewingListing.createdAt)}</span>
                        </div>
                        
                        {viewingListing.featured && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Utvald:</span>
                            <span className="flex items-center text-yellow-600">
                              <Star className="w-4 h-4 mr-1" />
                              Ja
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={() => {
                            window.open(`/listings/${viewingListing.id}`, '_blank');
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Öppna publik vy
                        </button>
                        
                        <button
                          onClick={() => {
                            setViewingListing(null);
                            handleEditListing(viewingListing.id);
                          }}
                          className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Redigera annons
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Listing Modal */}
        {editingListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold text-gray-900">Redigera annons</h3>
                  <button
                    onClick={handleCancelEdit}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Grundläggande information */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Grundläggande information</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                      <input
                        type="text"
                        value={editFormData.title || ''}
                        onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                      <select
                        value={editFormData.category || ''}
                        onChange={(e) => setEditFormData({...editFormData, category: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Välj kategori</option>
                        <option value="companies">Företag & Bolag</option>
                        <option value="ecommerce">E-handel & Webshops</option>
                        <option value="domains">Domäner & Webbplatser</option>
                        <option value="content">Content & Media</option>
                        <option value="digital">Digitala Tillgångar</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Pris (SEK)</label>
                      <input
                        type="number"
                        value={editFormData.askingPrice || ''}
                        onChange={(e) => setEditFormData({...editFormData, askingPrice: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kort beskrivning</label>
                      <textarea
                        value={editFormData.description || ''}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  {/* Företagsinformation */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-900">Företagsinformation</h4>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Bransch</label>
                      <input
                        type="text"
                        value={editFormData.industry || ''}
                        onChange={(e) => setEditFormData({...editFormData, industry: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Antal anställda</label>
                      <input
                        type="number"
                        value={editFormData.employees || ''}
                        onChange={(e) => setEditFormData({...editFormData, employees: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Årlig omsättning (SEK)</label>
                      <input
                        type="number"
                        value={editFormData.revenue || ''}
                        onChange={(e) => setEditFormData({...editFormData, revenue: parseInt(e.target.value)})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Webbplats</label>
                      <input
                        type="url"
                        value={editFormData.website || ''}
                        onChange={(e) => setEditFormData({...editFormData, website: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="https://example.com"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Kontaktinformation */}
                <div className="mt-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Kontaktinformation</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Kontaktperson</label>
                      <input
                        type="text"
                        value={editFormData.contactName || ''}
                        onChange={(e) => setEditFormData({...editFormData, contactName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">E-post</label>
                      <input
                        type="email"
                        value={editFormData.contactEmail || ''}
                        onChange={(e) => setEditFormData({...editFormData, contactEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
                      <input
                        type="tel"
                        value={editFormData.contactPhone || ''}
                        onChange={(e) => setEditFormData({...editFormData, contactPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
                
                {/* Utförlig beskrivning */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Utförlig beskrivning</label>
                  <textarea
                    value={editFormData.longDescription || ''}
                    onChange={(e) => setEditFormData({...editFormData, longDescription: e.target.value})}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Beskriv företaget i detalj..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                <button
                  onClick={handleCancelEdit}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Avbryt
                </button>
                <button
                  onClick={handleSaveEditedListing}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                >
                  Spara ändringar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Modal */}
        <VerificationModal
          isOpen={verificationModal.isOpen}
          onClose={() => setVerificationModal({ isOpen: false, type: 'email', newValue: '' })}
          type={verificationModal.type}
          newValue={verificationModal.newValue}
          onVerificationComplete={handleVerificationComplete}
        />
      </div>
    </>
  );
};

export default DashboardPage;