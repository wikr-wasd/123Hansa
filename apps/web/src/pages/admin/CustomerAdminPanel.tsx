import React, { useState } from 'react';
import { BarChart3, Building2, DollarSign, Eye, Calendar, TrendingUp, Package, MessageSquare, LogOut, User, Mail, Phone, MapPin, Star, Clock, Settings, CreditCard, FileText, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChatSystem from '../../components/chat/ChatSystem';

interface CustomerAdminPanelProps {
  customerId: string;
  onLogout: () => void;
}

const CustomerAdminPanel: React.FC<CustomerAdminPanelProps> = ({ customerId, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedListingForPromotion, setSelectedListingForPromotion] = useState<string | null>(null);
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
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
              { id: 'promotions', label: 'Marknadsföring', icon: Star },
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
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Min Översikt</h2>
              <p className="text-gray-600">Här är en sammanfattning av din aktivitet på Hansa</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Building2 className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Aktiva annonser</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.stats.activeListings}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Eye className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Totala visningar</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.stats.totalViews}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <MessageSquare className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Förfrågningar</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.stats.totalInquiries}</p>
                  </div>
                </div>
              </div>

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
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Genomförda försäljningar</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.stats.completedSales}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Genomsnittlig svarstid</p>
                    <p className="text-2xl font-bold text-gray-900">{customer.stats.avgResponseTime}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Senaste aktivitet</h3>
              <div className="space-y-3">
                {customer.listings.slice(0, 3).map((listing) => (
                  <div key={listing.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{listing.title}</p>
                        <p className="text-xs text-gray-500">{listing.views} visningar • {listing.inquiries} förfrågningar</p>
                      </div>
                    </div>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                      {listing.status === 'ACTIVE' ? 'Aktiv' : listing.status === 'PENDING' ? 'Väntar' : listing.status}
                    </span>
                  </div>
                ))}
                {customer.listings.length === 0 && (
                  <p className="text-gray-500 text-center py-4">Inga annonser ännu</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Listings Tab */}
        {activeTab === 'listings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Mina Annonser</h2>
              <div className="text-sm text-gray-600">
                {customer.stats.activeListings} aktiva annonser
              </div>
            </div>

            {customer.listings.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annons</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pris</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Visningar</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Förfrågningar</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {customer.listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                              <div className="text-xs text-gray-500">{listing.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{formatPrice(listing.price)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                            {listing.status === 'ACTIVE' ? 'Aktiv' : listing.status === 'PENDING' ? 'Väntar' : listing.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.views}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{listing.inquiries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <Building2 className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Inga annonser</h3>
                <p className="mt-1 text-sm text-gray-500">Du har inte skapat några annonser ännu.</p>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Meddelanden</h2>
              <div className="text-sm text-gray-600">
                {customer.messages.filter(m => m.unread).length} olästa meddelanden
              </div>
            </div>

            {customer.messages.length > 0 ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="divide-y divide-gray-200">
                  {customer.messages.map((message) => (
                    <div key={message.id} className={`p-6 hover:bg-gray-50 ${message.unread ? 'bg-blue-50' : ''}`}>
                      <div className="flex items-start">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-600">{message.from.charAt(0)}</span>
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900">{message.from}</h4>
                            <p className="text-sm text-gray-500">{message.timestamp}</p>
                          </div>
                          <p className="text-sm font-medium text-gray-900 mt-1">{message.subject}</p>
                          <p className="text-sm text-gray-600 mt-1">{message.preview}</p>
                          {message.unread && (
                            <span className="inline-flex mt-2 px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                              Nytt
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Inga meddelanden</h3>
                <p className="mt-1 text-sm text-gray-500">Du har inte fått några meddelanden ännu.</p>
              </div>
            )}
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

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🚀 Öka synligheten för dina annonser</h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Få fler visningar, kontakter och snabbare försäljning med våra professionella marknadsföringspaket. 
                Över 85% av våra kunder som använder Premium-paket säljer sina företag 40% snabbare!
              </p>
            </div>

            {/* Step 1: Select Listing */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Steg 1: Välj vilken annons du vill promota</h3>
              <div className="grid grid-cols-1 gap-4">
                {customer.listings.map((listing) => (
                  <div 
                    key={listing.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedListingForPromotion === listing.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                    onClick={() => setSelectedListingForPromotion(listing.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Building2 className="w-8 h-8 text-blue-600" />
                        <div>
                          <h4 className="font-medium text-gray-900">{listing.title}</h4>
                          <p className="text-sm text-gray-600">{listing.description}</p>
                          <div className="flex items-center space-x-4 mt-2">
                            <span className="text-sm font-medium text-green-600">
                              {formatPrice(listing.price)}
                            </span>
                            <span className="text-sm text-gray-500">
                              {listing.views} visningar
                            </span>
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                              {listing.status === 'ACTIVE' ? 'Aktiv' : listing.status === 'PENDING' ? 'Väntar' : listing.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {selectedListingForPromotion === listing.id && (
                        <CheckCircle className="w-6 h-6 text-blue-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Step 2: Select Package (only shown when listing is selected) */}
            {selectedListingForPromotion && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Steg 2: Välj ditt marknadsföringspaket</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Premium Package */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-yellow-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                        Populärast
                      </span>
                    </div>
                    <div className="text-center">
                      <Star className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Premium</h4>
                      <p className="text-gray-600 mb-4">Höj din annons i sökresultaten och få 3x fler visningar</p>
                      <div className="text-4xl font-bold text-gray-900 mb-2">995 SEK</div>
                      <p className="text-sm text-gray-500 mb-6">30 dagar aktivt</p>
                      
                      <div className="text-left space-y-3 mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Prioritering i sökresultat</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Orange "Premium" badge</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">3x fler visningar i snitt</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handlePackageSelection('premium', selectedListingForPromotion)}
                        className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-4 rounded-lg hover:from-yellow-700 hover:to-orange-700 transition-all duration-200 font-medium"
                      >
                        Välj Premium
                      </button>
                    </div>
                  </div>

                  {/* Featured Package */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-blue-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                        Rekommenderat
                      </span>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-16 h-16 text-blue-500 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">Framhävd</h4>
                      <p className="text-gray-600 mb-4">Visa på startsidan och få 5x fler kontakter</p>
                      <div className="text-4xl font-bold text-gray-900 mb-2">1,995 SEK</div>
                      <p className="text-sm text-gray-500 mb-6">30 dagar aktivt</p>
                      
                      <div className="text-left space-y-3 mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Allt i Premium +</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Visas på startsidan</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Blå "Framhävd" badge</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">5x fler kontakter i snitt</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handlePackageSelection('featured', selectedListingForPromotion)}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 font-medium"
                      >
                        Välj Framhävd
                      </button>
                    </div>
                  </div>

                  {/* VIP Package */}
                  <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-purple-200 relative">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <span className="bg-purple-100 text-purple-800 text-sm font-medium px-3 py-1 rounded-full">
                        Maximal ROI
                      </span>
                    </div>
                    <div className="text-center">
                      <Package className="w-16 h-16 text-purple-500 mx-auto mb-4" />
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">VIP Paket</h4>
                      <p className="text-gray-600 mb-4">Komplett paket med personlig support och premium-placering</p>
                      <div className="text-4xl font-bold text-gray-900 mb-2">2,995 SEK</div>
                      <p className="text-sm text-gray-500 mb-6">60 dagar aktivt</p>
                      
                      <div className="text-left space-y-3 mb-6">
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Allt i Framhävd +</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Personlig rådgivare</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Guld "VIP" badge</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">10x fler kvalificerade leads</span>
                        </div>
                        <div className="flex items-center">
                          <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                          <span className="text-sm">Prioriterat telefonsamtal</span>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => handlePackageSelection('vip', selectedListingForPromotion)}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-200 font-medium"
                      >
                        Välj VIP
                      </button>
                    </div>
                  </div>
                </div>

                {/* Success Statistics */}
                <div className="bg-white rounded-lg border border-green-200 p-6 mt-8">
                  <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">🎯 Resultat från våra kunder</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                    <div>
                      <div className="text-3xl font-bold text-green-600">85%</div>
                      <p className="text-sm text-gray-600">snabbare försäljning</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-blue-600">500%</div>
                      <p className="text-sm text-gray-600">fler kontakter</p>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-purple-600">95%</div>
                      <p className="text-sm text-gray-600">kundnöjdhet</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Active Promotions */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Aktiva kampanjer</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b last:border-b-0">
                    <div className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Premium - TechStartup AB</p>
                        <p className="text-xs text-gray-500">Aktiv till 2024-07-15 • 12 dagar kvar</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-green-600 font-medium text-sm">Aktiv</span>
                      <p className="text-xs text-gray-500">+245% visningar</p>
                    </div>
                  </div>
                  
                  {customer.listings.length > 1 && (
                    <div className="flex items-center justify-between py-3 border-b last:border-b-0">
                      <div className="flex items-center">
                        <TrendingUp className="w-5 h-5 text-blue-500 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Framhävd - {customer.listings[1]?.title}</p>
                          <p className="text-xs text-gray-500">Aktiv till 2024-08-05 • 25 dagar kvar</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-green-600 font-medium text-sm">Aktiv</span>
                        <p className="text-xs text-gray-500">+520% kontakter</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-center py-6 text-gray-500">
                    <Package className="w-10 h-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Vill du starta fler kampanjer?</p>
                    <p className="text-xs mt-1">Välj en annons ovan för att börja!</p>
                  </div>
                </div>
              </div>
            </div>
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