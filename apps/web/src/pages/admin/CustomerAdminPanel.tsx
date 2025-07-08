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
          activeListings: 3,
          totalViews: 145,
          totalInquiries: 23,
          completedSales: 1,
          totalRevenue: 45000,
          avgResponseTime: '2h 15m'
        },
        listings: [
          {
            id: '1',
            title: 'TechStartup AB',
            category: 'Technology',
            price: 2500000,
            status: 'ACTIVE',
            views: 45,
            inquiries: 8,
            createdAt: '2024-06-20',
            description: 'Innovativt teknikföretag med stark tillväxt'
          },
          {
            id: '4',
            title: 'Konsultföretag Stockholm',
            category: 'Consulting',
            price: 1800000,
            status: 'PENDING',
            views: 23,
            inquiries: 3,
            createdAt: '2024-06-22',
            description: 'Etablerat konsultföretag inom IT'
          },
          {
            id: '7',
            title: 'E-handel Nisch',
            category: 'E-commerce',
            price: 950000,
            status: 'ACTIVE',
            views: 77,
            inquiries: 12,
            createdAt: '2024-06-18',
            description: 'Specialiserad e-handelsplattform'
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
          activeListings: 1,
          totalViews: 78,
          totalInquiries: 12,
          completedSales: 0,
          totalRevenue: 0,
          avgResponseTime: '4h 30m'
        },
        listings: [
          {
            id: '2',
            title: 'Restaurang Gamla Stan',
            category: 'Restaurant',
            price: 1200000,
            status: 'ACTIVE',
            views: 78,
            inquiries: 12,
            createdAt: '2024-06-15',
            description: 'Välbelägen restaurang i hjärtat av Gamla Stan'
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
          activeListings: 0,
          totalViews: 0,
          totalInquiries: 0,
          completedSales: 0,
          totalRevenue: 0,
          avgResponseTime: '-'
        },
        listings: [],
        messages: []
      }
    };
    return customers[id as keyof typeof customers] || customers['1'];
  };

  const customer = getCustomerData(customerId);

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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Marknadsföring</h2>
              <div className="text-sm text-gray-600">
                Promota dina annonser för bättre synlighet
              </div>
            </div>

            {/* Promotion Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200 hover:border-blue-500 transition-colors">
                <div className="text-center">
                  <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Premium</h3>
                  <p className="text-gray-600 mb-4">Få din annons att synas högre upp i sökresultaten</p>
                  <div className="text-2xl font-bold text-gray-900 mb-4">1,500 SEK</div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Välj Premium
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-blue-500">
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Framhävd</h3>
                  <p className="text-gray-600 mb-4">Visa din annons på startsidan och få extra uppmärksamhet</p>
                  <div className="text-2xl font-bold text-gray-900 mb-4">2,500 SEK</div>
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Välj Framhävd
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-purple-500">
                <div className="text-center">
                  <Package className="w-12 h-12 text-purple-500 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-gray-900 mb-2">VIP Paket</h3>
                  <p className="text-gray-600 mb-4">Premium + Framhävd + Personlig support</p>
                  <div className="text-2xl font-bold text-gray-900 mb-4">3,500 SEK</div>
                  <button className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors">
                    Välj VIP
                  </button>
                </div>
              </div>
            </div>

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
                        <p className="text-xs text-gray-500">Aktiv till 2024-07-15</p>
                      </div>
                    </div>
                    <span className="text-green-600 font-medium">Aktiv</span>
                  </div>
                  <div className="text-center py-8 text-gray-500">
                    <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Inga fler aktiva kampanjer</p>
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
                  <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-blue-600">
                    <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">SMS-notifieringar</h4>
                    <p className="text-sm text-gray-500">Få viktiga uppdateringar via SMS</p>
                  </div>
                  <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-200">
                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Visa kontaktuppgifter publikt</h4>
                    <p className="text-sm text-gray-500">Låt andra användare se din e-post</p>
                  </div>
                  <button className="relative inline-flex flex-shrink-0 h-6 w-11 border-2 border-transparent rounded-full cursor-pointer transition-colors ease-in-out duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 bg-gray-200">
                    <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition ease-in-out duration-200"></span>
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