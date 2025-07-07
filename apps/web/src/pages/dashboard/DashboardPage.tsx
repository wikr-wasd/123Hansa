import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link, useLocation } from 'react-router-dom';
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
  Trash2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { toast } from 'react-hot-toast';
import { PremiumChatBubble } from '../../components/messaging/PremiumChatBubble';
import { HeartContract } from '../../components/heart/HeartContract';
import { VerificationModal } from '../../components/auth/VerificationModal';

const DashboardPage: React.FC = () => {
  const location = useLocation();
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
    // In production, navigate to listing detail page
    toast.success(`Öppnar annons: ${listingId}`);
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
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[18px] text-center animate-pulse">
                        {userStats.unreadNotifications}
                      </span>
                    )}
                  </button>
                  
                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                      <div className="flex items-center justify-between p-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Notifikationer</h3>
                        <div className="flex items-center space-x-2">
                          {userStats.unreadNotifications > 0 && (
                            <button
                              onClick={clearAllNotifications}
                              className="text-xs text-blue-600 hover:text-blue-700"
                            >
                              Markera alla som lästa
                            </button>
                          )}
                          <button
                            onClick={() => setShowNotifications(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="max-h-80 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                              }`}
                              onClick={() => markNotificationAsRead(notification.id)}
                            >
                              <div className="flex items-start space-x-3">
                                <div className="text-2xl">{notification.icon}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className={`text-sm font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                                      {notification.title}
                                    </p>
                                    {!notification.read && (
                                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                  <p className="text-xs text-gray-400 mt-2">
                                    {formatDate(notification.timestamp)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-gray-500">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-sm font-medium">Inga notifikationer</p>
                            <p className="text-xs text-gray-400 mt-1">Du kommer att få notifikationer här när något händer</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <span className="text-sm text-gray-600">Välkommen, {user.name}!</span>
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
                { id: 'purchases', name: 'Köp', icon: ShoppingCart },
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
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
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
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Skapa ny annons
                </Link>
                <button
                  onClick={() => setActiveTab('heart')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                            <button className="text-gray-400 hover:text-gray-600">
                              <MoreHorizontal className="w-4 h-4" />
                            </button>
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
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                          <button className="text-gray-400 hover:text-gray-600">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
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
                              className="text-red-600 hover:text-red-700 text-sm font-medium"
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
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
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
                  <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
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
                <h2 className="text-2xl font-bold text-gray-900">Mina köp</h2>
                <span className="text-sm text-gray-500">{userStats.completedPurchases} genomförda köp</span>
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="text-center py-12">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Köphistorik</h3>
                  <p className="text-gray-600">
                    Du har genomfört {userStats.completedPurchases} köp för totalt {formatPrice(userStats.totalSpent)}.
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Detaljerad köphistorik kommer snart...
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
              <HeartContract />
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

        {/* Premium Chat Bubble */}
        <PremiumChatBubble />

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