import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
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
  Check
} from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'favorites' | 'messages' | 'purchases' | 'settings'>('overview');

  // Mock user data - in real app this would come from context/API
  const user = {
    name: 'Anna Karlsson',
    email: 'anna@example.com',
    phone: '+46 70 123 4567',
    location: 'Stockholm',
    verified: true,
    memberSince: '2024-01-15',
    avatar: 'AK'
  };

  const userStats = {
    activeListings: 2,
    totalViews: 1247,
    savedListings: 8,
    completedPurchases: 3,
    unreadMessages: 4,
    totalSpent: 450000,
    rating: 4.8,
    reviewCount: 12
  };

  const myListings = [
    {
      id: '1',
      title: 'TechStartup AB',
      category: 'Technology',
      price: 2500000,
      views: 45,
      status: 'active',
      createdAt: '2024-06-25',
      featured: true
    },
    {
      id: '2',
      title: 'Konsultföretag Stockholm',
      category: 'Consulting',
      price: 850000,
      views: 23,
      status: 'pending',
      createdAt: '2024-06-20',
      featured: false
    }
  ];

  const favoriteListings = [
    {
      id: '3',
      title: 'Restaurang Gamla Stan',
      category: 'Restaurant',
      price: 1200000,
      location: 'Stockholm',
      savedAt: '2024-06-26'
    },
    {
      id: '4',
      title: 'E-handel Fashion',
      category: 'E-commerce',
      price: 950000,
      location: 'Göteborg',
      savedAt: '2024-06-24'
    },
    {
      id: '5',
      title: 'Digital Marknadsföring AB',
      category: 'Marketing',
      price: 750000,
      location: 'Malmö',
      savedAt: '2024-06-22'
    }
  ];

  const recentMessages = [
    {
      id: '1',
      from: 'Erik Johansson',
      subject: 'Intresse för TechStartup AB',
      preview: 'Hej! Jag är intresserad av att veta mer om ert företag...',
      time: '2024-06-26 14:30',
      unread: true
    },
    {
      id: '2',
      from: 'Maria Svensson',
      subject: 'Frågor om konsultföretaget',
      preview: 'Kan ni berätta mer om kundbasen och intäkter?',
      time: '2024-06-25 11:15',
      unread: true
    },
    {
      id: '3',
      from: '123hansa Support',
      subject: 'Din annons har godkänts',
      preview: 'Grattis! Din annons "TechStartup AB" har nu godkänts...',
      time: '2024-06-24 09:45',
      unread: false
    }
  ];

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
                <button className="relative p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="w-6 h-6" />
                  {userStats.unreadMessages > 0 && (
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
                  )}
                </button>
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
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Senaste meddelanden</h3>
                  <div className="space-y-3">
                    {recentMessages.slice(0, 3).map((message) => (
                      <div key={message.id} className={`p-3 rounded-lg border ${message.unread ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{message.from}</p>
                            <p className="text-sm text-gray-600">{message.subject}</p>
                            <p className="text-xs text-gray-500 mt-1">{message.preview}</p>
                          </div>
                          {message.unread && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Mina annonser</h3>
                  <div className="space-y-3">
                    {myListings.map((listing) => (
                      <div key={listing.id} className="p-3 rounded-lg border border-gray-200">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">{listing.title}</p>
                            <p className="text-sm text-gray-600">{formatPrice(listing.price)}</p>
                            <div className="flex items-center mt-1">
                              <Eye className="w-3 h-3 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">{listing.views} visningar</span>
                              {listing.featured && (
                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                                  <Star className="w-3 h-3 mr-1" />
                                  Utvald
                                </span>
                              )}
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            listing.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {listing.status === 'active' ? 'Aktiv' : 'Väntar'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'favorites' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Mina favoriter</h2>
                <span className="text-sm text-gray-500">{favoriteListings.length} sparade annonser</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteListings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-semibold text-gray-900">{listing.title}</h3>
                      <button className="text-pink-500 hover:text-pink-600">
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{listing.category}</p>
                    <p className="text-lg font-bold text-blue-600 mb-2">{formatPrice(listing.price)}</p>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {listing.location}
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Sparad {formatDate(listing.savedAt)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-900">Meddelanden</h2>
                <span className="bg-red-100 text-red-800 text-sm px-3 py-1 rounded-full">
                  {userStats.unreadMessages} olästa
                </span>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="divide-y divide-gray-200">
                  {recentMessages.map((message) => (
                    <div key={message.id} className={`p-4 hover:bg-gray-50 cursor-pointer ${message.unread ? 'bg-blue-50' : ''}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <p className={`font-medium ${message.unread ? 'text-gray-900' : 'text-gray-700'}`}>
                              {message.from}
                            </p>
                            {message.unread && (
                              <span className="ml-2 w-2 h-2 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                          <p className={`text-sm mt-1 ${message.unread ? 'text-gray-900' : 'text-gray-600'}`}>
                            {message.subject}
                          </p>
                          <p className="text-sm text-gray-500 mt-1">{message.preview}</p>
                        </div>
                        <div className="text-xs text-gray-400 ml-4">
                          {formatDate(message.time)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
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
        </div>
      </div>
    </>
  );
};

export default DashboardPage;