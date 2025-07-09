import React, { useState } from 'react';
import { BarChart3, Building2, DollarSign, Eye, Calendar, TrendingUp, Package, MessageSquare, LogOut, User, Mail, Phone, MapPin, Star, Clock, Settings, CreditCard, FileText, Edit, Trash2, CheckCircle, XCircle, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChatSystem from '../../components/chat/ChatSystem';
import InvoiceCreator from '../../components/invoice/InvoiceCreator';
import ElegantMessaging from '../../components/messaging/ElegantMessaging';

interface CustomerAdminPanelProps {
  customerId: string;
  onLogout: () => void;
}

const CustomerAdminPanel: React.FC<CustomerAdminPanelProps> = ({ customerId, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedListingForPromotion, setSelectedListingForPromotion] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    publicContact: false
  });

  // Mock customer data based on customerId
  const getCustomerData = (id: string) => {
    const customers = {
      '1': {
        name: 'Anna Karlsson',
        email: 'anna.karlsson@email.com',
        phone: '+46 70 123 4567',
        location: 'Stockholm',
        joinedDate: '2024-01-15',
        avatar: 'AK',
        stats: {
          activeListings: 5,
          totalViews: 734,
          totalInquiries: 85,
          completedSales: 2,
          totalRevenue: 85000,
          avgResponseTime: '1h 45m'
        },
        listings: [
          {
            id: '1',
            title: 'TechStartup AB',
            category: 'Technology',
            price: 2500000,
            status: 'ACTIVE',
            views: 245,
            inquiries: 18,
            createdAt: '2024-06-20',
            description: 'Innovativt teknikföretag med stark tillväxt och AI-fokus'
          },
          {
            id: '4',
            title: 'Konsultföretag Stockholm',
            category: 'Consulting',
            price: 1800000,
            status: 'ACTIVE',
            views: 89,
            inquiries: 12,
            createdAt: '2024-06-22',
            description: 'Etablerat konsultföretag inom IT med 15 års erfarenhet'
          },
          {
            id: '7',
            title: 'E-handel Nisch',
            category: 'E-commerce',
            price: 950000,
            status: 'ACTIVE',
            views: 177,
            inquiries: 25,
            createdAt: '2024-06-18',
            description: 'Specialiserad e-handelsplattform inom hållbara produkter'
          },
          {
            id: '11',
            title: 'Digital Marknadsföringsbyrå',
            category: 'Marketing',
            price: 3200000,
            status: 'ACTIVE',
            views: 156,
            inquiries: 22,
            createdAt: '2024-06-15',
            description: 'Fullservice digitalbyrå med stora kunder och stabila intäkter'
          },
          {
            id: '15',
            title: 'SaaS Plattform B2B',
            category: 'Software',
            price: 4500000,
            status: 'PENDING',
            views: 67,
            inquiries: 8,
            createdAt: '2024-06-25',
            description: 'Prenumerationsbaserad mjukvarulösning för små företag'
          }
        ],
        messages: [
          {
            id: '1',
            from: 'Erik Johansson',
            subject: 'Intresse för TechStartup AB',
            preview: 'Hej Anna, jag är intresserad av att veta mer om...',
            timestamp: '2024-06-26 14:30',
            unread: true
          },
          {
            id: '2',
            from: 'Maria Svensson',
            subject: 'Frågor om E-handel Nisch',
            preview: 'Kan du berätta mer om omsättningen...',
            timestamp: '2024-06-25 16:45',
            unread: false
          }
        ]
      },
      '2': {
        name: 'Erik Johansson',
        email: 'erik.johansson@email.com',
        phone: '+46 70 987 6543',
        location: 'Göteborg',
        joinedDate: '2024-02-20',
        avatar: 'EJ',
        stats: {
          activeListings: 3,
          totalViews: 234,
          totalInquiries: 31,
          completedSales: 0,
          totalRevenue: 0,
          avgResponseTime: '3h 15m'
        },
        listings: [
          {
            id: '2',
            title: 'Restaurang Gamla Stan',
            category: 'Restaurant',
            price: 1200000,
            status: 'ACTIVE',
            views: 128,
            inquiries: 19,
            createdAt: '2024-06-15',
            description: 'Välbelägen restaurang i hjärtat av Gamla Stan med 30 sittplatser'
          },
          {
            id: '8',
            title: 'Café & Bageri Södermalm',
            category: 'Food & Beverage',
            price: 850000,
            status: 'ACTIVE',
            views: 67,
            inquiries: 8,
            createdAt: '2024-06-20',
            description: 'Populärt café med egen bageriverksamhet'
          },
          {
            id: '12',
            title: 'Cateringföretag Premium',
            category: 'Catering',
            price: 2100000,
            status: 'PENDING',
            views: 39,
            inquiries: 4,
            createdAt: '2024-06-24',
            description: 'Exklusiv cateringverksamhet för företagsevent'
          }
        ],
        messages: []
      },
      '3': {
        name: 'Maria Svensson',
        email: 'maria.svensson@email.com',
        phone: '+46 70 555 1234',
        location: 'Malmö',
        joinedDate: '2024-03-10',
        avatar: 'MS',
        stats: {
          activeListings: 2,
          totalViews: 145,
          totalInquiries: 18,
          completedSales: 1,
          totalRevenue: 65000,
          avgResponseTime: '2h 30m'
        },
        listings: [
          {
            id: '9',
            title: 'Onlinebutik Kläder',
            category: 'Fashion',
            price: 650000,
            status: 'ACTIVE',
            views: 89,
            inquiries: 12,
            createdAt: '2024-06-12',
            description: 'Etablerad online modebutik med starkt varumärke'
          },
          {
            id: '13',
            title: 'Skönhetssalong Premium',
            category: 'Beauty',
            price: 1150000,
            status: 'ACTIVE',
            views: 56,
            inquiries: 6,
            createdAt: '2024-06-19',
            description: 'Exklusiv skönhetssalong med lojal kundkrets'
          }
        ],
        messages: []
      }
    };
    return customers[id as keyof typeof customers] || customers['1'];
  };

  const customer = getCustomerData(customerId);

  // Mock conversation data
  const mockConversations = [
    {
      id: '1',
      name: 'Erik Johansson',
      avatar: undefined,
      lastMessage: 'Hej Anna, jag är intresserad av att veta mer om TechStartup AB...',
      lastMessageTime: '2024-06-26T14:30:00Z',
      unreadCount: 2,
      isOnline: true,
      isTyping: false,
      isPinned: true,
      isArchived: false,
      listingId: '1',
      listingTitle: 'TechStartup AB'
    },
    {
      id: '2',
      name: 'Maria Svensson',
      avatar: undefined,
      lastMessage: 'Kan du berätta mer om omsättningen för E-handel Nisch?',
      lastMessageTime: '2024-06-25T16:45:00Z',
      unreadCount: 0,
      isOnline: false,
      isTyping: false,
      isPinned: false,
      isArchived: false,
      listingId: '7',
      listingTitle: 'E-handel Nisch'
    },
    {
      id: '3',
      name: 'Peter Andersson',
      avatar: undefined,
      lastMessage: 'Tack för informationen! Jag återkommer inom kort.',
      lastMessageTime: '2024-06-24T10:20:00Z',
      unreadCount: 0,
      isOnline: true,
      isTyping: false,
      isPinned: false,
      isArchived: false,
      listingId: '4',
      listingTitle: 'Konsultföretag Stockholm'
    }
  ];

  const mockMessages = [
    {
      id: '1',
      senderId: '2',
      senderName: 'Erik Johansson',
      content: 'Hej Anna! Jag såg din annons för TechStartup AB och är mycket intresserad.',
      timestamp: '2024-06-26T14:25:00Z',
      status: 'read' as const
    },
    {
      id: '2',
      senderId: customerId,
      senderName: customer.name,
      content: 'Hej Erik! Kul att höra. Vad skulle du vilja veta mer om?',
      timestamp: '2024-06-26T14:27:00Z',
      status: 'read' as const
    },
    {
      id: '3',
      senderId: '2',
      senderName: 'Erik Johansson',
      content: 'Främst om de finansiella siffrorna och team-sammansättningen. Finns det möjlighet till en telefonkonferens?',
      timestamp: '2024-06-26T14:30:00Z',
      status: 'delivered' as const
    },
    {
      id: '4',
      senderId: '2',
      senderName: 'Erik Johansson',
      content: 'Jag är redo att gå vidare snabbt om allt stämmer.',
      timestamp: '2024-06-26T14:31:00Z',
      status: 'sent' as const
    }
  ];

  // Handler functions
  const handleSettingToggle = (setting: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
    toast.success(`${setting === 'emailNotifications' ? 'E-postnotifieringar' : 
      setting === 'smsNotifications' ? 'SMS-notifieringar' : 'Offentlig kontakt'} ${
      !settings[setting] ? 'aktiverade' : 'inaktiverade'}`);
  };

  const handlePackageSelection = (packageType: string, listingId: string) => {
    setSelectedPackage(packageType);
    setSelectedListingForPromotion(listingId);
    
    const packageNames = {
      premium: 'Premium',
      featured: 'Framhävd', 
      vip: 'VIP'
    };
    
    const listing = customer.listings.find(l => l.id === listingId);
    
    // Store package selection data for payment
    const packageData = {
      packageType,
      listingId,
      listingTitle: listing?.title,
      customerName: customer.name,
      customerId: customerId,
      packagePrice: packageType === 'premium' ? 995 : packageType === 'featured' ? 1995 : 2995,
      packageName: packageNames[packageType as keyof typeof packageNames]
    };
    
    // Store in localStorage for payment process
    localStorage.setItem('promotionPackageData', JSON.stringify(packageData));
    
    toast.success(`${packageNames[packageType as keyof typeof packageNames]} valt för "${listing?.title}". Fortsätt till betalning.`);
    
    // Redirect to payment page
    setTimeout(() => {
      setActiveTab('payment');
    }, 1000);
  };

  const handleConversationSelect = (conversationId: string) => {
    setActiveConversationId(conversationId);
  };

  const handleMessageSend = (conversationId: string, content: string) => {
    toast.success('Meddelande skickat!');
    // In real app, this would send the message via API
  };

  const handleMessageRead = (messageId: string) => {
    // In real app, this would mark the message as read via API
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'SOLD': return 'bg-blue-100 text-blue-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <User className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Min Admin Panel</h1>
                <p className="text-sm text-gray-600">Välkommen tillbaka, {customer.name}</p>
              </div>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logga ut
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Översikt', icon: BarChart3 },
              { id: 'listings', label: 'Mina Annonser', icon: Building2 },
              { id: 'messages', label: 'Meddelanden', icon: MessageSquare },
              { id: 'finance', label: 'Ekonomi', icon: DollarSign },
              { id: 'invoices', label: 'Fakturor', icon: FileText },
              { id: 'settings', label: 'Inställningar', icon: Settings },
              { id: 'profile', label: 'Min Profil', icon: User }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center border-b-2 py-2 px-1 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {tab.label}
                  {tab.id === 'messages' && customer.messages.filter(m => m.unread).length > 0 && (
                    <span className="ml-2 bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                      {customer.messages.filter(m => m.unread).length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Välkommen tillbaka, {customer.name.split(' ')[0]}! 👋</h2>
                  <p className="text-blue-100 text-lg">Här är en översikt av din verksamhet på 123hansa</p>
                  <div className="flex items-center mt-4 text-blue-100">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className="text-sm">Medlem sedan {new Date(customer.joinedDate).toLocaleDateString('sv-SE')}</span>
                  </div>
                </div>
                <div className="hidden md:block">
                  <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center text-2xl font-bold">
                    {customer.avatar}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setActiveTab('listings')}
                className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Building2 className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Hantera Annonser</span>
              </button>
              <button 
                onClick={() => setActiveTab('messages')}
                className="bg-gradient-to-br from-green-500 to-green-600 text-white p-4 rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <MessageSquare className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Meddelanden</span>
                {mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0) > 0 && (
                  <span className="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {mockConversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
                  </span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('invoices')}
                className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-4 rounded-xl hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <FileText className="w-6 h-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Skapa Faktura</span>
              </button>
            </div>

            {/* Enhanced Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Aktiva annonser</p>
                        <p className="text-3xl font-bold text-gray-900">{customer.stats.activeListings}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +12%
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">🎯 Bra! Du har fler aktiva annonser än genomsnittet</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <Eye className="w-6 h-6 text-green-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Totala visningar</p>
                        <p className="text-3xl font-bold text-gray-900">{customer.stats.totalViews.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +34%
                  </div>
                </div>
                <div className="mt-4 bg-green-50 rounded-lg p-3">
                  <p className="text-xs text-green-700">🚀 Fantastiskt! Dina annonser får mycket uppmärksamhet</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                        <MessageSquare className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Förfrågningar</p>
                        <p className="text-3xl font-bold text-gray-900">{customer.stats.totalInquiries}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +18%
                  </div>
                </div>
                <div className="mt-4 bg-purple-50 rounded-lg p-3">
                  <p className="text-xs text-purple-700">💬 Bra konvertering från visningar till förfrågningar!</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                        <DollarSign className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Total intäkt</p>
                        <p className="text-3xl font-bold text-gray-900">{formatPrice(customer.stats.totalRevenue)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +85%
                  </div>
                </div>
                <div className="mt-4 bg-emerald-50 rounded-lg p-3">
                  <p className="text-xs text-emerald-700">💰 Utmärkt! Du har genererat betydande intäkter</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Genomförda försäljningar</p>
                        <p className="text-3xl font-bold text-gray-900">{customer.stats.completedSales}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    +100%
                  </div>
                </div>
                <div className="mt-4 bg-orange-50 rounded-lg p-3">
                  <p className="text-xs text-orange-700">🎉 Grattis till dina lyckade affärer!</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Clock className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-600">Genomsnittlig svarstid</p>
                        <p className="text-3xl font-bold text-gray-900">{customer.stats.avgResponseTime}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-green-600 text-sm font-medium">
                    <TrendingUp className="w-4 h-4 inline mr-1" />
                    Snabb
                  </div>
                </div>
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs text-blue-700">⚡ Utmärkt! Snabba svar ökar förtroendet</p>
                </div>
              </div>
            </div>

            {/* Enhanced Recent Activity */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Senaste aktivitet</h3>
                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                  Visa alla →
                </button>
              </div>
              <div className="space-y-4">
                {customer.listings.slice(0, 3).map((listing, index) => (
                  <div key={listing.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : 'bg-purple-100'
                      }`}>
                        <Building2 className={`w-5 h-5 ${
                          index === 0 ? 'text-blue-600' : index === 1 ? 'text-green-600' : 'text-purple-600'
                        }`} />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-semibold text-gray-900">{listing.title}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center">
                            <Eye className="w-3 h-3 mr-1" />
                            {listing.views} visningar
                          </span>
                          <span className="flex items-center">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            {listing.inquiries} förfrågningar
                          </span>
                          <span className="flex items-center">
                            <DollarSign className="w-3 h-3 mr-1" />
                            {formatPrice(listing.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                        {listing.status === 'ACTIVE' ? 'Aktiv' : listing.status === 'PENDING' ? 'Väntar' : listing.status}
                      </span>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {customer.listings.length === 0 && (
                  <div className="text-center py-8">
                    <Building2 className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-medium">Inga annonser ännu</p>
                    <p className="text-gray-400 text-sm">Skapa din första annons för att komma igång</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Mina Annonser</h2>
                <p className="text-gray-600 mt-1">Hantera och övervaka dina företagsannonser</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-600">
                  {customer.stats.activeListings} aktiva annonser
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <Building2 className="w-4 h-4 mr-2" />
                  Ny Annons
                </button>
              </div>
            </div>

            {customer.listings.length > 0 ? (
              <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gradient-to-r from-gray-50 to-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Annons</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kategori</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Pris</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prestanda</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {customer.listings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                <Building2 className="w-6 h-6 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">{listing.title}</div>
                                <div className="text-xs text-gray-500 mt-1">{listing.description}</div>
                                <div className="text-xs text-gray-400 mt-1">Skapad {listing.createdAt}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {listing.category}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">{formatPrice(listing.price)}</div>
                            <div className="text-xs text-gray-500">Slutpris</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                              {listing.status === 'ACTIVE' ? 'Aktiv' : listing.status === 'PENDING' ? 'Väntar' : listing.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="space-y-1">
                              <div className="flex items-center text-xs text-gray-600">
                                <Eye className="w-3 h-3 mr-1 text-blue-500" />
                                <span className="font-medium">{listing.views}</span>
                                <span className="ml-1">visningar</span>
                              </div>
                              <div className="flex items-center text-xs text-gray-600">
                                <MessageSquare className="w-3 h-3 mr-1 text-green-500" />
                                <span className="font-medium">{listing.inquiries}</span>
                                <span className="ml-1">förfrågningar</span>
                              </div>
                              <div className="text-xs text-gray-500">
                                {((listing.inquiries / listing.views) * 100).toFixed(1)}% konvertering
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => {
                                  toast.success(`Visar annons: ${listing.title}`);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Visa annons"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  toast.success(`Redigerar: ${listing.title}`);
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Redigera annons"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (confirm(`Är du säker på att du vill ta bort "${listing.title}"?`)) {
                                    toast.success(`${listing.title} har tagits bort`);
                                  }
                                }}
                                className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                                title="Ta bort annons"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div className="relative">
                                <button 
                                  onClick={() => {
                                    toast.success('Visar fler alternativ...');
                                  }}
                                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title="Fler alternativ"
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {/* Table Footer with Pagination */}
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>Visar {customer.listings.length} av {customer.listings.length} annonser</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                      Föregående
                    </button>
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">1</span>
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                      Nästa
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center">
                  <Building2 className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Inga annonser ännu</h3>
                <p className="text-gray-500 mb-6">Skapa din första annons för att börja sälja ditt företag på 123hansa</p>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto">
                  <Building2 className="w-5 h-5 mr-2" />
                  Skapa första annons
                </button>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="h-[800px]">
            <ElegantMessaging
              currentUserId={customerId}
              currentUserName={customer.name}
              conversations={mockConversations}
              messages={activeConversationId === '1' ? mockMessages : []}
              activeConversationId={activeConversationId}
              onConversationSelect={handleConversationSelect}
              onMessageSend={handleMessageSend}
              onMessageRead={handleMessageRead}
            />
          </div>
        )}

        {/* Finance Tab */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Ekonomi</h2>
              <div className="text-sm text-gray-600">
                Hantera dina transaktioner och betalningar
              </div>
            </div>

            {/* Transaction Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total intäkt</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(customer.stats.totalRevenue)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CreditCard className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Pågående transaktioner</p>
                    <p className="text-2xl font-bold text-gray-900">2</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Genomförda försäljningar</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.stats.completedSales}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Senaste transaktioner</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Betalning mottagen - TechStartup AB</p>
                        <p className="text-xs text-gray-500">2024-06-25 14:30</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">+{formatPrice(2500000)}</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-yellow-600 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Pågående - E-handel Nisch</p>
                        <p className="text-xs text-gray-500">2024-06-26 09:15</p>
                      </div>
                    </div>
                    <span className="text-yellow-600 font-medium">Väntar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invoices Tab */}
        {activeTab === 'invoices' && (
          <div className="space-y-6">
            <InvoiceCreator 
              customerId={customerId}
              customerName={customer.name}
              listings={customer.listings}
            />
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Inställningar</h2>
            
            {/* Account Settings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Kontoinställningar</h3>
              </div>
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">E-postnotifieringar</h4>
                    <p className="text-sm text-gray-500">Få notifieringar om nya meddelanden</p>
                  </div>
                  <button 
                    onClick={() => handleSettingToggle('emailNotifications')}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`${
                      settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS-notifieringar</h4>
                    <p className="text-sm text-gray-500">Få viktiga uppdateringar via SMS</p>
                  </div>
                  <button 
                    onClick={() => handleSettingToggle('smsNotifications')}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      settings.smsNotifications ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`${
                      settings.smsNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Visa kontaktuppgifter publikt</h4>
                    <p className="text-sm text-gray-500">Låt andra användare se din e-post</p>
                  </div>
                  <button 
                    onClick={() => handleSettingToggle('publicContact')}
                    className={`relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      settings.publicContact ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span className={`${
                      settings.publicContact ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy Settings */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Sekretess</h3>
              </div>
              <div className="p-6 space-y-4">
                <button className="w-full text-left py-3 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Ladda ner mina data</h4>
                      <p className="text-sm text-gray-500">Få en kopia av all din data</p>
                    </div>
                    <FileText className="w-5 h-5 text-gray-400" />
                  </div>
                </button>
                
                <button className="w-full text-left py-3 px-4 border border-red-300 rounded-lg hover:bg-red-50 transition-colors text-red-600">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">Radera mitt konto</h4>
                      <p className="text-sm text-red-500">Permanent radering av kontot</p>
                    </div>
                    <Trash2 className="w-5 h-5" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">Min Profil</h2>
            
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center mb-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-xl font-medium text-blue-600">{customer.avatar}</span>
                </div>
                <div className="ml-6">
                  <h3 className="text-xl font-bold text-gray-900">{customer.name}</h3>
                  <p className="text-gray-600">Medlem sedan {new Date(customer.joinedDate).toLocaleDateString('sv-SE')}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{customer.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{customer.phone}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">{customer.location}</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Medlem sedan {new Date(customer.joinedDate).toLocaleDateString('sv-SE')}</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="w-5 h-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Verifierad användare</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat System */}
      <ChatSystem 
        currentUserId={customerId}
        currentUserName={customer.name}
        currentUserType="user"
      />
    </div>
  );
};

export default CustomerAdminPanel;