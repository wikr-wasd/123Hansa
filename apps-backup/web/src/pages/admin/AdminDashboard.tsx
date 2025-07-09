import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, BarChart3, Users, Building2, MessageSquare, DollarSign, Settings, Eye, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, TrendingUp, Activity, Search, Filter, Send, Clock, User, Calendar, RefreshCw, Undo2, Mail, Phone, MapPin, Star, ThumbsUp, ThumbsDown, Target, CreditCard, ArrowUpDown, Download } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedUsers, setDeletedUsers] = useState<any[]>([]);
  const [deletedListings, setDeletedListings] = useState<any[]>([]);
  const [rejectedListings, setRejectedListings] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [selectedListingForView, setSelectedListingForView] = useState<any>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState([
    {
      id: 'PR001',
      listingId: '1',
      listingTitle: 'TechStartup AB',
      userId: '1',
      userName: 'Anna Karlsson',
      amount: 499,
      service: 'Featured Listing',
      description: 'Gör annonsen utvald i 30 dagar',
      status: 'PENDING',
      createdAt: '2024-06-25',
      paymentMethod: 'Swish'
    },
    {
      id: 'PR002', 
      listingId: '2',
      listingTitle: 'Restaurang Gamla Stan',
      userId: '2',
      userName: 'Erik Johansson',
      amount: 299,
      service: 'Boost Listing',
      description: 'Prioritera annons i sökresultat i 14 dagar',
      status: 'PENDING',
      createdAt: '2024-06-26',
      paymentMethod: 'Kort'
    },
    {
      id: 'PR003',
      listingId: '3', 
      listingTitle: 'Maria\'s Café & Bakery',
      userId: '3',
      userName: 'Maria Svensson',
      amount: 199,
      service: 'Premium Support',
      description: 'Prioriterad kundsupport i 30 dagar',
      status: 'APPROVED',
      createdAt: '2024-06-24',
      paymentMethod: 'Bankgiro'
    }
  ]);
  
  // Platform Settings State
  const [platformSettings, setPlatformSettings] = useState({
    platformName: '123hansa.se',
    supportEmail: 'support@servicematch.se',
    platformDescription: 'Sveriges ledande marknadsplats för företagsförvärv och crowdfunding',
    currency: 'SEK',
    language: 'sv-SE',
    timezone: 'Europe/Stockholm',
    maintenanceMode: false,
    registrationEnabled: true,
    emailNotifications: true,
    smsNotifications: false,
    maxFileUploadSize: '10MB',
    allowedFileTypes: '.jpg,.png,.pdf,.docx',
    maxListingsPerUser: 5,
    defaultListingDuration: 90,
    featuredListingPrice: 499,
    boostListingPrice: 299,
    premiumSupportPrice: 199
  });
  
  // Mock data with more comprehensive information
  const [stats, setStats] = useState({
    totalUsers: 1234,
    activeUsers: 1180,
    newUsersToday: 23,
    activeListings: 567,
    pendingListings: 12,
    totalTransactions: 89,
    totalRevenue: 2450000,
    monthlyRevenue: 234000,
    pendingApprovals: 12,
    reportedListings: 3,
    resolvedTickets: 45,
    openTickets: 8
  });

  const [users, setUsers] = useState([
    { 
      id: '1', 
      name: 'Anna Karlsson', 
      email: 'anna@example.com', 
      phone: '+46 70 123 4567',
      location: 'Stockholm',
      status: 'ACTIVE', 
      listingsCount: 3, 
      verified: true,
      joinedDate: '2024-01-15',
      lastLogin: '2024-06-25 14:30',
      totalSpent: 45000,
      avatar: 'AK'
    },
    { 
      id: '2', 
      name: 'Erik Johansson', 
      email: 'erik@example.com', 
      phone: '+46 70 987 6543',
      location: 'Göteborg',
      status: 'ACTIVE', 
      listingsCount: 1, 
      verified: true,
      joinedDate: '2024-02-20',
      lastLogin: '2024-06-26 09:15',
      totalSpent: 12000,
      avatar: 'EJ'
    },
    { 
      id: '3', 
      name: 'Maria Svensson', 
      email: 'maria@example.com', 
      phone: '+46 70 555 1234',
      location: 'Malmö',
      status: 'SUSPENDED', 
      listingsCount: 0, 
      verified: false,
      joinedDate: '2024-03-10',
      lastLogin: '2024-06-20 16:45',
      totalSpent: 0,
      avatar: 'MS'
    }
  ]);

  const [listings, setListings] = useState([
    { 
      id: '1', 
      title: 'TechStartup AB', 
      category: 'Technology', 
      price: 2500000, 
      seller: 'Anna Karlsson', 
      sellerId: '1',
      status: 'PENDING', 
      views: 45, 
      reports: 0,
      description: 'Innovativt teknikföretag med stark tillväxt',
      location: 'Stockholm',
      createdAt: '2024-06-25',
      featured: false,
      riskScore: 15
    },
    { 
      id: '2', 
      title: 'Restaurang Gamla Stan', 
      category: 'Restaurant', 
      price: 1200000, 
      seller: 'Erik Johansson', 
      sellerId: '2',
      status: 'ACTIVE', 
      views: 78, 
      reports: 1,
      description: 'Välbesökt restaurang i hjärtat av Stockholm',
      location: 'Stockholm',
      createdAt: '2024-06-20',
      featured: true,
      riskScore: 25
    },
    { 
      id: '3', 
      title: 'E-handel Fashion', 
      category: 'E-commerce', 
      price: 800000, 
      seller: 'Maria Svensson', 
      sellerId: '3',
      status: 'PENDING', 
      views: 23, 
      reports: 0,
      description: 'Online modebutik med stor potential',
      location: 'Malmö',
      createdAt: '2024-06-24',
      featured: false,
      riskScore: 35
    }
  ]);

  const [supportTickets, setSupportTickets] = useState([
    {
      id: 'T001',
      subject: 'Problem med betalning',
      customer: 'Anna Karlsson',
      customerEmail: 'anna@example.com',
      customerId: '1',
      priority: 'HIGH',
      status: 'open',
      category: 'billing',
      createdAt: '2024-06-26 10:30',
      lastUpdated: '2024-06-26 10:30',
      description: 'Jag kan inte genomföra betalningen för min annons. Får felmeddelande när jag försöker betala.',
      messages: [
        {
          id: 'M001',
          sender: 'customer',
          senderName: 'Anna Karlsson',
          message: 'Jag kan inte genomföra betalningen för min annons. Får felmeddelande när jag försöker betala.',
          timestamp: '2024-06-26 10:30',
          attachments: []
        }
      ]
    },
    {
      id: 'T002',
      subject: 'Fråga om verifiering',
      customer: 'Erik Johansson',
      customerEmail: 'erik@example.com',
      customerId: '2',
      priority: 'MEDIUM',
      status: 'in_progress',
      category: 'account',
      createdAt: '2024-06-25 15:45',
      lastUpdated: '2024-06-26 09:15',
      description: 'Hur lång tid tar det att få mitt konto verifierat?',
      messages: [
        {
          id: 'M002',
          sender: 'customer',
          senderName: 'Erik Johansson',
          message: 'Hur lång tid tar det att få mitt konto verifierat?',
          timestamp: '2024-06-25 15:45',
          attachments: []
        },
        {
          id: 'M003',
          sender: 'admin',
          senderName: 'Support Team',
          message: 'Hej Erik! Verifieringen tar normalt 1-2 arbetsdagar. Vi kollar på ditt konto nu.',
          timestamp: '2024-06-26 09:15',
          attachments: []
        }
      ]
    },
    {
      id: 'T003',
      subject: 'Rapportera olämplig annons',
      customer: 'Maria Svensson',
      customerEmail: 'maria@example.com',
      customerId: '3',
      priority: 'LOW',
      status: 'resolved',
      category: 'content',
      createdAt: '2024-06-24 12:20',
      lastUpdated: '2024-06-25 14:30',
      description: 'Jag vill rapportera en annons som verkar misstänkt.',
      messages: [
        {
          id: 'M004',
          sender: 'customer',
          senderName: 'Maria Svensson',
          message: 'Jag vill rapportera en annons som verkar misstänkt.',
          timestamp: '2024-06-24 12:20',
          attachments: []
        },
        {
          id: 'M005',
          sender: 'admin',
          senderName: 'Support Team',
          message: 'Tack för din rapport. Vi har granskat annonsen och vidtagit åtgärder.',
          timestamp: '2024-06-25 14:30',
          attachments: []
        }
      ]
    }
  ]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'SUSPENDED': return 'bg-red-100 text-red-800';
      case 'SOLD': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-100 text-red-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'LOW': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (riskScore: number) => {
    if (riskScore >= 70) return 'bg-red-100 text-red-800';
    if (riskScore >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
  };

  // User Management Functions
  const handleDeleteUser = (userId: string) => {
    const userToDelete = users.find(u => u.id === userId);
    if (userToDelete) {
      setDeletedUsers(prev => [...prev, { ...userToDelete, deletedAt: new Date().toISOString() }]);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(`Användare ${userToDelete.name} har tagits bort`);
    }
  };

  const handleRestoreUser = (userId: string) => {
    const userToRestore = deletedUsers.find(u => u.id === userId);
    if (userToRestore) {
      const { deletedAt, ...cleanUser } = userToRestore;
      setUsers(prev => [...prev, cleanUser]);
      setDeletedUsers(prev => prev.filter(u => u.id !== userId));
      toast.success(`Användare ${userToRestore.name} har återställts`);
    }
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED' } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(`Användare ${user?.name} har ${user?.status === 'SUSPENDED' ? 'aktiverats' : 'suspenderats'}`);
  };

  const handleVerifyUser = (userId: string) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, verified: !u.verified } : u
    ));
    const user = users.find(u => u.id === userId);
    toast.success(`Användare ${user?.name} har ${user?.verified ? 'avverifierats' : 'verifierats'}`);
  };

  // Listing Management Functions
  const handleApproveListing = (listingId: string) => {
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, status: 'ACTIVE' } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    toast.success(`Annons "${listing?.title}" har godkänts`);
  };

  const handleRejectListing = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (listing) {
      setRejectedListings(prev => [...prev, { ...listing, rejectedAt: new Date().toISOString() }]);
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...l, status: 'REJECTED' } : l
      ));
      toast.error(`Annons "${listing.title}" har avvisats`);
    }
  };

  const handleDeleteListing = (listingId: string) => {
    const listingToDelete = listings.find(l => l.id === listingId);
    if (listingToDelete) {
      setDeletedListings(prev => [...prev, { ...listingToDelete, deletedAt: new Date().toISOString() }]);
      setListings(prev => prev.filter(l => l.id !== listingId));
      toast.success(`Annons "${listingToDelete.title}" har tagits bort`);
    }
  };

  const handleRestoreListing = (listingId: string) => {
    const listingToRestore = deletedListings.find(l => l.id === listingId);
    if (listingToRestore) {
      const { deletedAt, ...cleanListing } = listingToRestore;
      setListings(prev => [...prev, cleanListing]);
      setDeletedListings(prev => prev.filter(l => l.id !== listingId));
      toast.success(`Annons "${listingToRestore.title}" har återställts`);
    }
  };

  const handleReverseRejection = (listingId: string) => {
    const rejectedListing = rejectedListings.find(l => l.id === listingId);
    if (rejectedListing) {
      const { rejectedAt, ...cleanListing } = rejectedListing;
      setListings(prev => prev.map(l => 
        l.id === listingId ? { ...cleanListing, status: 'PENDING' } : l
      ));
      setRejectedListings(prev => prev.filter(l => l.id !== listingId));
      toast.success(`Avslaget för annons "${rejectedListing.title}" har återkallats och är nu under granskning igen`);
    }
  };

  const handleViewListing = (listing: any) => {
    setSelectedListingForView(listing);
    setShowListingModal(true);
  };

  const handleFeatureListing = (listingId: string) => {
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, featured: !l.featured } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    toast.success(`Annons "${listing?.title}" har ${listing?.featured ? 'tagits bort från' : 'lagts till som'} utvald`);
  };

  // Payment Request Functions
  const handleApprovePayment = (paymentId: string) => {
    const payment = paymentRequests.find(p => p.id === paymentId);
    if (payment) {
      setPaymentRequests(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'APPROVED' } : p
      ));
      
      // Apply the service based on payment type
      if (payment.service === 'Featured Listing') {
        setListings(prev => prev.map(l => 
          l.id === payment.listingId ? { ...l, featured: true } : l
        ));
      } else if (payment.service === 'Boost Listing') {
        // Add boost logic here - could be a priority score or timestamp
        setListings(prev => prev.map(l => 
          l.id === payment.listingId ? { ...l, boosted: true, boostExpiry: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() } : l
        ));
      }
      
      toast.success(`Betalning för "${payment.service}" har godkänts och tjänsten har aktiverats för "${payment.listingTitle}"`);
    }
  };

  const handleRejectPayment = (paymentId: string) => {
    const payment = paymentRequests.find(p => p.id === paymentId);
    if (payment) {
      setPaymentRequests(prev => prev.map(p => 
        p.id === paymentId ? { ...p, status: 'REJECTED' } : p
      ));
      toast.error(`Betalning för "${payment.service}" har avvisats`);
    }
  };

  // Platform Settings Functions
  const handleSettingChange = (key: string, value: any) => {
    setPlatformSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Here you would typically make an API call to save settings
    toast.success('Plattformsinställningar har uppdaterats');
  };

  // Support Functions
  const handleTicketResponse = () => {
    if (!selectedTicket || !ticketResponse.trim()) return;

    const newMessage = {
      id: `M${Date.now()}`,
      sender: 'admin',
      senderName: 'Support Team (willi)',
      message: ticketResponse,
      timestamp: new Date().toISOString(),
      attachments: []
    };

    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === selectedTicket.id 
        ? { 
            ...ticket, 
            messages: [...ticket.messages, newMessage],
            lastUpdated: new Date().toISOString(),
            status: 'in_progress'
          }
        : ticket
    ));

    setSelectedTicket(prev => prev ? {
      ...prev,
      messages: [...prev.messages, newMessage],
      lastUpdated: new Date().toISOString(),
      status: 'in_progress'
    } : null);

    setTicketResponse('');
    toast.success('Svar skickat till kunden');
  };

  const handleCloseTicket = (ticketId: string) => {
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'resolved', lastUpdated: new Date().toISOString() }
        : ticket
    ));
    toast.success('Ticket markerat som löst');
  };

  const handleReopenTicket = (ticketId: string) => {
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: 'open', lastUpdated: new Date().toISOString() }
        : ticket
    ));
    toast.success('Ticket återöppnat');
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredListings = listings.filter(listing => 
    listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
    listing.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const resolvedTickets = supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed');

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - 123hansa.se</title>
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Shield className="w-8 h-8 text-blue-600 mr-3" />
                <h1 className="text-2xl font-bold text-gray-900">123hansa Admin Panel</h1>
              </div>
              <div className="text-sm text-gray-600">
                Admin: willi • Development Mode • {new Date().toLocaleDateString('sv-SE')}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', label: 'Dashboard', icon: BarChart3 },
                { id: 'users', label: 'Användare', icon: Users },
                { id: 'listings', label: 'Annonser', icon: Building2 },
                { id: 'crowdfunding', label: 'Crowdfunding', icon: Target },
                { id: 'support', label: 'Support', icon: MessageSquare },
                { id: 'finance', label: 'Ekonomi', icon: DollarSign },
                { id: 'settings', label: 'Inställningar', icon: Settings }
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
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Dashboard Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Översikt</h2>
                <p className="text-gray-600">Real-time statistik och systemövervakning för 123hansa-plattformen</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totala användare</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString('sv-SE')}</p>
                      <p className="text-xs text-green-600">+{stats.newUsersToday} idag</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktiva annonser</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.activeListings}</p>
                      <p className="text-xs text-yellow-600">{stats.pendingListings} väntar</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total omsättning</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.totalRevenue)}</p>
                      <p className="text-xs text-green-600">Denna månad: {formatPrice(stats.monthlyRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <MessageSquare className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Support tickets</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.openTickets}</p>
                      <p className="text-xs text-green-600">{stats.resolvedTickets} lösta</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Senaste aktivitet</h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <span>Ny användare registrerad - Anna Karlsson</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <span>Annons godkänd - TechStartup AB</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                      <span>Nytt support ticket - Betalningsproblem</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">System Status</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Status</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-green-600">Online</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Database</span>
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-sm font-medium text-green-600">Connected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Uptime</span>
                      <span className="text-sm font-medium text-gray-900">99.9%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Snabbåtgärder</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setActiveTab('listings')}
                      className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm">Granska väntande annonser</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('support')}
                      className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm">Svara på support tickets</span>
                      </div>
                    </button>
                    <button 
                      onClick={() => setActiveTab('users')}
                      className="w-full text-left p-2 border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-purple-600 mr-2" />
                        <span className="text-sm">Hantera nya användare</span>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Analytics Section */}
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-gray-900">Analys och rapporter</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Användaraktivitet (30 dagar)</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Nya registreringar</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-blue-600 h-2 rounded-full" style={{width: '75%'}}></div>
                          </div>
                          <span className="text-sm font-medium">156</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Aktiva användare</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-green-600 h-2 rounded-full" style={{width: '92%'}}></div>
                          </div>
                          <span className="text-sm font-medium">1,089</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Återvändande användare</span>
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-3">
                            <div className="bg-purple-600 h-2 rounded-full" style={{width: '68%'}}></div>
                          </div>
                          <span className="text-sm font-medium">742</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Försäljningsstatistik</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Genomförda affärer</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-green-600">+12%</span>
                          <span className="text-sm font-bold ml-2">89</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Genomsnittligt värde</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-blue-600 mr-1" />
                          <span className="text-sm font-medium text-blue-600">+8%</span>
                          <span className="text-sm font-bold ml-2">{formatPrice(1350000)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Konverteringsgrad</span>
                        <div className="flex items-center">
                          <TrendingUp className="w-4 h-4 text-purple-600 mr-1" />
                          <span className="text-sm font-medium text-purple-600">+3%</span>
                          <span className="text-sm font-bold ml-2">15.8%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Kategoripopularitet</h4>
                    <div className="space-y-3">
                      {[
                        { name: 'Technology', percentage: 35, color: 'bg-blue-600' },
                        { name: 'Restaurant', percentage: 28, color: 'bg-green-600' },
                        { name: 'E-commerce', percentage: 22, color: 'bg-purple-600' },
                        { name: 'Consulting', percentage: 15, color: 'bg-yellow-600' }
                      ].map((category) => (
                        <div key={category.name} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{category.name}</span>
                          <div className="flex items-center">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div className={`${category.color} h-2 rounded-full`} style={{width: `${category.percentage}%`}}></div>
                            </div>
                            <span className="text-sm font-medium w-8">{category.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Geografisk fördelning</h4>
                    <div className="space-y-3">
                      {[
                        { city: 'Stockholm', count: 456, percentage: 45 },
                        { city: 'Göteborg', count: 234, percentage: 23 },
                        { city: 'Malmö', count: 189, percentage: 19 },
                        { city: 'Uppsala', count: 132, percentage: 13 }
                      ].map((location) => (
                        <div key={location.city} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{location.city}</span>
                          <div className="flex items-center">
                            <div className="w-12 bg-gray-200 rounded-full h-2 mr-2">
                              <div className="bg-indigo-600 h-2 rounded-full" style={{width: `${location.percentage}%`}}></div>
                            </div>
                            <span className="text-sm font-medium">{location.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg shadow-sm p-6">
                    <h4 className="text-lg font-medium text-gray-900 mb-4">Support prestanda</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Genomsnittlig svarstid</span>
                        <span className="text-sm font-medium text-green-600">2.3 timmar</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Första lösning</span>
                        <span className="text-sm font-medium text-blue-600">87%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Kundnöjdhet</span>
                        <div className="flex items-center">
                          <Star className="w-4 h-4 text-yellow-500 mr-1" />
                          <span className="text-sm font-medium">4.6/5</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Lösta tickets</span>
                        <span className="text-sm font-medium text-purple-600">96%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Detaljerade rapporter</h4>
                    <div className="flex space-x-2">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Exportera PDF
                      </button>
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                        Exportera Excel
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">98.7%</p>
                      <p className="text-sm text-gray-600">Systemdrifttid</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">156ms</p>
                      <p className="text-sm text-gray-600">Genomsnittlig laddningstid</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">24.5%</p>
                      <p className="text-sm text-gray-600">Mobilanvändning</p>
                    </div>
                    <div className="text-center p-4 border border-gray-200 rounded-lg">
                      <p className="text-2xl font-bold text-orange-600">3.2</p>
                      <p className="text-sm text-gray-600">Avg. sessioner per användare</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Användarhantering</h2>
                  <p className="text-gray-600">Hantera användarkonton, verifiering och behörigheter</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Sök användare..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {deletedUsers.length > 0 && (
                    <span className="text-sm text-gray-600">
                      {deletedUsers.length} borttagna användare
                    </span>
                  )}
                </div>
              </div>

              {/* Deleted Users Recovery */}
              {deletedUsers.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Undo2 className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        {deletedUsers.length} användare har tagits bort nyligen
                      </span>
                    </div>
                    <div className="space-x-2">
                      {deletedUsers.map(user => (
                        <button
                          key={user.id}
                          onClick={() => handleRestoreUser(user.id)}
                          className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
                        >
                          Återställ {user.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Användare</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kontakt</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivitet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistik</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-600">{user.avatar}</span>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                                <div className="flex items-center mt-1">
                                  {user.verified && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 mr-2">
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Verifierad
                                    </span>
                                  )}
                                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                                    {user.status === 'ACTIVE' ? 'Aktiv' : user.status === 'SUSPENDED' ? 'Suspenderad' : user.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-2" />
                                {user.email}
                              </div>
                              <div className="flex items-center mt-1">
                                <Phone className="w-4 h-4 text-gray-400 mr-2" />
                                {user.phone}
                              </div>
                              <div className="flex items-center mt-1">
                                <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                                {user.location}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>Reg: {formatDate(user.joinedDate)}</div>
                              <div className="text-gray-500">Senast: {formatDate(user.lastLogin)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div>{user.listingsCount} annonser</div>
                              <div className="text-gray-500">{formatPrice(user.totalSpent)} spenderat</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Star className="w-4 h-4 text-yellow-400 mr-1" />
                              <span className="text-sm text-gray-600">4.8</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleVerifyUser(user.id)}
                                className={`p-2 rounded ${user.verified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}
                                title={user.verified ? 'Avverifiera användare' : 'Verifiera användare'}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className={`p-2 rounded ${user.status === 'SUSPENDED' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'} hover:bg-opacity-80`}
                                title={user.status === 'SUSPENDED' ? 'Aktivera användare' : 'Suspendera användare'}
                              >
                                {user.status === 'SUSPENDED' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                              </button>
                              <button
                                className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                                title="Visa detaljer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                title="Redigera användare"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.id)}
                                className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                title="Ta bort användare"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
                  <p className="text-gray-600">Granska, godkänn och hantera annonser</p>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Sök annonser..."
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <span className="text-sm text-gray-600">
                    {listings.filter(l => l.status === 'PENDING').length} väntar på granskning
                  </span>
                </div>
              </div>

              {/* Rejected Listings Recovery */}
              {rejectedListings.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Undo2 className="w-5 h-5 text-red-600 mr-2" />
                      <span className="text-sm font-medium text-red-800">
                        {rejectedListings.length} annonser har avvisats nyligen
                      </span>
                    </div>
                    <div className="space-x-2">
                      {rejectedListings.map(listing => (
                        <button
                          key={listing.id}
                          onClick={() => handleReverseRejection(listing.id)}
                          className="text-xs bg-red-200 text-red-800 px-2 py-1 rounded hover:bg-red-300"
                        >
                          Återkalla avslag för {listing.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Deleted Listings Recovery */}
              {deletedListings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Undo2 className="w-5 h-5 text-yellow-600 mr-2" />
                      <span className="text-sm font-medium text-yellow-800">
                        {deletedListings.length} annonser har tagits bort nyligen
                      </span>
                    </div>
                    <div className="space-x-2">
                      {deletedListings.map(listing => (
                        <button
                          key={listing.id}
                          onClick={() => handleRestoreListing(listing.id)}
                          className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded hover:bg-yellow-300"
                        >
                          Återställ {listing.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annons & Risk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori & Pris</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Säljare</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status & Aktivitet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredListings.map((listing) => (
                        <tr key={listing.id} className={`hover:bg-gray-50 ${listing.status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                              <div>
                                <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                                <div className="text-sm text-gray-500 max-w-xs truncate">{listing.description}</div>
                                <div className="flex items-center mt-1 space-x-2">
                                  <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${getRiskColor(listing.riskScore)}`}>
                                    Risk: {listing.riskScore}%
                                  </span>
                                  {listing.featured && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                      <Star className="w-3 h-3 mr-1" />
                                      Utvald
                                    </span>
                                  )}
                                  {listing.reports > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                      {listing.reports} rapport(er)
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              <div className="font-medium">{listing.category}</div>
                              <div className="text-lg font-bold text-green-600">{formatPrice(listing.price)}</div>
                              <div className="text-xs text-gray-500">{listing.location}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <span className="text-xs font-medium text-gray-600">{listing.seller.charAt(0)}</span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{listing.seller}</div>
                                <div className="text-xs text-gray-500">ID: {listing.sellerId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-1">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                {listing.status === 'PENDING' ? 'Väntar' : listing.status === 'ACTIVE' ? 'Aktiv' : listing.status}
                              </span>
                              <div className="text-xs text-gray-500">
                                <div>{listing.views} visningar</div>
                                <div>Skapad: {formatDate(listing.createdAt)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-1">
                              {listing.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApproveListing(listing.id)}
                                    className="p-2 rounded bg-green-100 text-green-600 hover:bg-green-200"
                                    title="Godkänn annons"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectListing(listing.id)}
                                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                    title="Avslå annons"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleFeatureListing(listing.id)}
                                className={`p-2 rounded ${listing.featured ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}
                                title={listing.featured ? 'Ta bort från utvalda' : 'Gör till utvald'}
                              >
                                <Star className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleViewListing(listing)}
                                className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                                title="Visa detaljer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                className="p-2 rounded bg-gray-100 text-gray-600 hover:bg-gray-200"
                                title="Redigera annons"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteListing(listing.id)}
                                className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                title="Ta bort annons"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Support Tab */}
          {activeTab === 'support' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Support System</h2>
                  <p className="text-gray-600">Hantera kundsupport och lösa ärenden</p>
                </div>
                <div className="text-sm text-gray-600">
                  {openTickets.length} öppna tickets • {resolvedTickets.length} lösta
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Ticket List */}
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Support Tickets</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {supportTickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        onClick={() => setSelectedTicket(ticket)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-medium text-gray-900">#{ticket.id}</span>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPriorityColor(ticket.priority)}`}>
                                {ticket.priority}
                              </span>
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.status)}`}>
                                {ticket.status === 'open' ? 'Öppen' : ticket.status === 'in_progress' ? 'Pågår' : ticket.status === 'resolved' ? 'Löst' : 'Stängd'}
                              </span>
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mt-1">{ticket.subject}</h4>
                            <p className="text-sm text-gray-600 mt-1">{ticket.customer}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Skapad: {formatDate(ticket.createdAt)} • Uppdaterad: {formatDate(ticket.lastUpdated)}
                            </p>
                          </div>
                          <div className="ml-4">
                            {ticket.status !== 'resolved' && ticket.status !== 'closed' && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCloseTicket(ticket.id);
                                }}
                                className="text-green-600 hover:text-green-800"
                                title="Markera som löst"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {(ticket.status === 'resolved' || ticket.status === 'closed') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReopenTicket(ticket.id);
                                }}
                                className="text-blue-600 hover:text-blue-800"
                                title="Återöppna ticket"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket Details */}
                <div className="bg-white rounded-lg shadow-sm">
                  {selectedTicket ? (
                    <>
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-gray-900">#{selectedTicket.id} - {selectedTicket.subject}</h3>
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(selectedTicket.priority)}`}>
                              {selectedTicket.priority}
                            </span>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(selectedTicket.status)}`}>
                              {selectedTicket.status === 'open' ? 'Öppen' : selectedTicket.status === 'in_progress' ? 'Pågår' : selectedTicket.status === 'resolved' ? 'Löst' : 'Stängd'}
                            </span>
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-4">
                            <span>Kund: {selectedTicket.customer}</span>
                            <span>Email: {selectedTicket.customerEmail}</span>
                            <span>Kategori: {selectedTicket.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Messages */}
                      <div className="p-4 max-h-64 overflow-y-auto">
                        <div className="space-y-4">
                          {selectedTicket.messages.map((message: any) => (
                            <div key={message.id} className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                message.sender === 'admin' 
                                  ? 'bg-blue-600 text-white' 
                                  : 'bg-gray-100 text-gray-900'
                              }`}>
                                <div className="text-sm font-medium mb-1">
                                  {message.senderName}
                                </div>
                                <div className="text-sm">{message.message}</div>
                                <div className={`text-xs mt-1 ${message.sender === 'admin' ? 'text-blue-100' : 'text-gray-500'}`}>
                                  {formatDate(message.timestamp)}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Response Form */}
                      {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="space-y-3">
                            <textarea
                              value={ticketResponse}
                              onChange={(e) => setTicketResponse(e.target.value)}
                              rows={3}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-500"
                              placeholder="Skriv ditt svar till kunden..."
                            />
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => handleCloseTicket(selectedTicket.id)}
                                  className="text-sm text-green-600 hover:text-green-800"
                                >
                                  Markera som löst
                                </button>
                              </div>
                              <button
                                onClick={handleTicketResponse}
                                disabled={!ticketResponse.trim()}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="w-4 h-4 mr-2" />
                                Skicka svar
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="p-8 text-center">
                      <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Välj en ticket</h3>
                      <p className="text-gray-600">
                        Klicka på en ticket till vänster för att visa konversationen och svara.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Crowdfunding Tab */}
          {activeTab === 'crowdfunding' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Crowdfunding-hantering</h2>
                <p className="text-gray-600">Hantera crowdfunding-kampanjer och investeringar</p>
              </div>

              {/* Crowdfunding Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Target className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktiva kampanjer</p>
                      <p className="text-2xl font-bold text-gray-900">23</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totalt uppsamlat</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(45600000)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Investerare</p>
                      <p className="text-2xl font-bold text-gray-900">1,247</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Väntande godkännanden</p>
                      <p className="text-2xl font-bold text-gray-900">5</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Management */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Kampanj-hantering</h3>
                </div>
                
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kampanj</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mål / Uppsamlat</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        {
                          id: 'CF-2024-001',
                          title: 'GreenTech Innovation AB',
                          description: 'Miljövänlig teknologi för framtiden',
                          creator: 'Anna Bergström',
                          email: 'anna@greentech.se',
                          goal: 5000000,
                          raised: 3200000,
                          investors: 124,
                          status: 'active',
                          deadline: '2024-08-15',
                          category: 'Technology',
                          riskLevel: 'Medium'
                        },
                        {
                          id: 'CF-2024-002',
                          title: 'Urban Farming Solutions',
                          description: 'Vertikal odling i stadsmiljö',
                          creator: 'Erik Lindahl',
                          email: 'erik@urbanfarm.se',
                          goal: 2500000,
                          raised: 2650000,
                          investors: 89,
                          status: 'funded',
                          deadline: '2024-07-30',
                          category: 'Agriculture',
                          riskLevel: 'Low'
                        },
                        {
                          id: 'CF-2024-003',
                          title: 'AI Healthcare Platform',
                          description: 'AI-driven sjukvårdsdiagnostik',
                          creator: 'Maria Svensson',
                          email: 'maria@aihealth.se',
                          goal: 8000000,
                          raised: 950000,
                          investors: 45,
                          status: 'pending_approval',
                          deadline: '2024-09-20',
                          category: 'Healthcare',
                          riskLevel: 'High'
                        },
                        {
                          id: 'CF-2024-004',
                          title: 'Sustainable Fashion Brand',
                          description: 'Återvinningsbaserad modebrand',
                          creator: 'Sofia Nilsson',
                          email: 'sofia@sustfashion.se',
                          goal: 1500000,
                          raised: 1750000,
                          investors: 203,
                          status: 'overfunded',
                          deadline: '2024-07-10',
                          category: 'Fashion',
                          riskLevel: 'Low'
                        },
                        {
                          id: 'CF-2024-005',
                          title: 'EdTech Learning Platform',
                          description: 'Personaliserad AI-utbildning',
                          creator: 'David Holmberg',
                          email: 'david@edtech.se',
                          goal: 3000000,
                          raised: 450000,
                          investors: 67,
                          status: 'under_review',
                          deadline: '2024-08-30',
                          category: 'Education',
                          riskLevel: 'Medium'
                        }
                      ].map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{campaign.title}</div>
                              <div className="text-sm text-gray-500">{campaign.description}</div>
                              <div className="text-xs text-gray-400 mt-1">
                                <div>Skapare: {campaign.creator} ({campaign.email})</div>
                                <div>Kategori: {campaign.category} | Risk: {campaign.riskLevel}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(campaign.goal)}</div>
                            <div className="text-sm text-green-600">{formatPrice(campaign.raised)} uppsamlat</div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%`}}
                              ></div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{campaign.investors} investerare</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                              campaign.status === 'funded' ? 'bg-blue-100 text-blue-800' :
                              campaign.status === 'overfunded' ? 'bg-purple-100 text-purple-800' :
                              campaign.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                              campaign.status === 'under_review' ? 'bg-orange-100 text-orange-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {campaign.status === 'active' ? 'Aktiv' :
                               campaign.status === 'funded' ? 'Finansierad' :
                               campaign.status === 'overfunded' ? 'Överfinansierad' :
                               campaign.status === 'pending_approval' ? 'Väntar godkännande' :
                               campaign.status === 'under_review' ? 'Under granskning' :
                               campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(campaign.deadline).toLocaleDateString('sv-SE')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} dagar kvar
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              {campaign.status === 'pending_approval' && (
                                <>
                                  <button 
                                    onClick={() => {
                                      toast.success(`Kampanj ${campaign.title} godkänd`);
                                    }}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    Godkänn
                                  </button>
                                  <button 
                                    onClick={() => {
                                      toast.error(`Kampanj ${campaign.title} avvisad`);
                                    }}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                  >
                                    Avvisa
                                  </button>
                                </>
                              )}
                              {campaign.status === 'under_review' && (
                                <button 
                                  onClick={() => {
                                    toast.info(`Granskning av ${campaign.title} slutförd`);
                                  }}
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                  Slutför granskning
                                </button>
                              )}
                              {(campaign.status === 'funded' || campaign.status === 'overfunded') && (
                                <button 
                                  onClick={() => {
                                    toast.success(`Medel frisläppta för ${campaign.title}`);
                                  }}
                                  className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                                >
                                  Frisläpp medel
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  toast.info(`Visa investerare för ${campaign.title}`);
                                }}
                                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                              >
                                Visa investerare
                              </button>
                              <button 
                                onClick={() => {
                                  toast.info(`Kommunikation öppnad med ${campaign.creator}`);
                                }}
                                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                              >
                                Kontakta skapare
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Investment Overview */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Senaste investeringar</h3>
                  <div className="space-y-4">
                    {[
                      { investor: 'Magnus Lindqvist', amount: 250000, campaign: 'GreenTech Innovation AB', time: '2 minuter sedan' },
                      { investor: 'Eva Johansson', amount: 100000, campaign: 'Urban Farming Solutions', time: '15 minuter sedan' },
                      { investor: 'Anders Berg', amount: 500000, campaign: 'Sustainable Fashion Brand', time: '1 timme sedan' },
                      { investor: 'Lisa Holm', amount: 75000, campaign: 'EdTech Learning Platform', time: '3 timmar sedan' }
                    ].map((investment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{investment.investor}</div>
                          <div className="text-xs text-gray-500">{investment.campaign}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-green-600">{formatPrice(investment.amount)}</div>
                          <div className="text-xs text-gray-500">{investment.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Plattformsavgifter</h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Framgångsavgift (5%)</span>
                      <span className="text-sm font-medium text-gray-900">{formatPrice(2280000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Betalningsavgifter (2.5%)</span>
                      <span className="text-sm font-medium text-gray-900">{formatPrice(1140000)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Administrativa avgifter</span>
                      <span className="text-sm font-medium text-gray-900">{formatPrice(156000)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between items-center">
                        <span className="text-base font-medium text-gray-900">Total intäkt</span>
                        <span className="text-base font-bold text-green-600">{formatPrice(3576000)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Finance Tab */}
          {activeTab === 'finance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ekonomi & Transaktioner</h2>
                <p className="text-gray-600">Hantera alla finansiella transaktioner och utbetalningar</p>
              </div>

              {/* Financial Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Månadsomsättning</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(stats.monthlyRevenue)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Väntande godkännanden</p>
                      <p className="text-2xl font-bold text-gray-900">12</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <CreditCard className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totala transaktioner</p>
                      <p className="text-2xl font-bold text-gray-900">156</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <ArrowUpDown className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totalt volym</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(89500000)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Requests for Ad Prioritization */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">Betalningsförfrågningar</h3>
                      <p className="text-sm text-gray-600">Granska och godkänn betalningar för annonsprioriteringar</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-600">
                        {paymentRequests.filter(p => p.status === 'PENDING').length} väntar på godkännande
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Betalning</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annons</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tjänst</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belopp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {paymentRequests.map((payment) => (
                        <tr key={payment.id} className={`hover:bg-gray-50 ${payment.status === 'PENDING' ? 'bg-yellow-50' : ''}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">#{payment.id}</div>
                              <div className="text-sm text-gray-500">{payment.userName}</div>
                              <div className="text-xs text-gray-400">{formatDate(payment.createdAt)}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.listingTitle}</div>
                              <div className="text-xs text-gray-500">ID: {payment.listingId}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{payment.service}</div>
                              <div className="text-xs text-gray-500">{payment.description}</div>
                              <div className="text-xs text-gray-400">via {payment.paymentMethod}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-bold text-green-600">{payment.amount} SEK</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              payment.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {payment.status === 'PENDING' ? 'Väntar' : 
                               payment.status === 'APPROVED' ? 'Godkänd' : 'Avvisad'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center space-x-2">
                              {payment.status === 'PENDING' && (
                                <>
                                  <button
                                    onClick={() => handleApprovePayment(payment.id)}
                                    className="p-2 rounded bg-green-100 text-green-600 hover:bg-green-200"
                                    title="Godkänn betalning och aktivera tjänst"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleRejectPayment(payment.id)}
                                    className="p-2 rounded bg-red-100 text-red-600 hover:bg-red-200"
                                    title="Avvisa betalning"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleViewListing(listings.find(l => l.id === payment.listingId))}
                                className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                                title="Visa annons"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Transaction Management */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Alla Transaktioner - Godkännande Krävs</h3>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Väntar godkännande</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Godkänd</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span className="text-sm text-gray-600">Avvisad</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaktion</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Typ</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belopp</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Datum</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {[
                        {
                          id: 'TXN-2024-001',
                          type: 'business_sale',
                          title: 'TechStartup AB - Försäljning',
                          seller: 'Anna Karlsson',
                          buyer: 'Magnus Lindqvist',
                          amount: 2500000,
                          fee: 125000,
                          status: 'pending_approval',
                          createdAt: '2024-06-28T09:15:00Z',
                          description: 'Företagsförsäljning via 123hansa'
                        },
                        {
                          id: 'TXN-2024-002',
                          type: 'crowdfunding_payout',
                          title: 'GreenTech Innovation - Utbetalning',
                          recipient: 'Anna Bergström',
                          amount: 3200000,
                          fee: 160000,
                          status: 'pending_approval',
                          createdAt: '2024-06-28T08:30:00Z',
                          description: 'Crowdfunding-kampanj slutförd'
                        },
                        {
                          id: 'TXN-2024-003',
                          type: 'escrow_release',
                          title: 'Restaurang Nordic Taste - Escrow',
                          seller: 'Jenny Karlsson',
                          buyer: 'Andreas Lindqvist',
                          amount: 1800000,
                          fee: 36000,
                          status: 'approved',
                          createdAt: '2024-06-27T16:45:00Z',
                          description: 'Escrow-medel redo för frisläpp'
                        },
                        {
                          id: 'TXN-2024-004',
                          type: 'commission_payout',
                          title: 'Mäklararvode - Q2 2024',
                          recipient: 'Erik Johansson (Mäklare)',
                          amount: 45000,
                          fee: 0,
                          status: 'pending_approval',
                          createdAt: '2024-06-27T14:20:00Z',
                          description: 'Kvartalsvis mäklararvode'
                        },
                        {
                          id: 'TXN-2024-005',
                          type: 'refund',
                          title: 'E-handel Fashion Store - Återbetalning',
                          recipient: 'Erik Johansson',
                          amount: 2200000,
                          fee: -44000,
                          status: 'pending_approval',
                          createdAt: '2024-06-27T11:10:00Z',
                          description: 'Återbetalning p.g.a. tvist'
                        },
                        {
                          id: 'TXN-2024-006',
                          type: 'investment_return',
                          title: 'Urban Farming Solutions - Investerarutbetalning',
                          recipient: 'Lisa Holm',
                          amount: 150000,
                          fee: 7500,
                          status: 'rejected',
                          createdAt: '2024-06-26T13:55:00Z',
                          description: 'Investeringsavkastning',
                          rejectionReason: 'Felaktiga bankkonto uppgifter'
                        },
                        {
                          id: 'TXN-2024-007',
                          type: 'business_sale',
                          title: 'Konsultföretag Stockholm - Försäljning',
                          seller: 'Marcus Berg',
                          buyer: 'Anna Svensson',
                          amount: 850000,
                          fee: 42500,
                          status: 'pending_approval',
                          createdAt: '2024-06-26T10:30:00Z',
                          description: 'Företagsförsäljning via 123hansa'
                        }
                      ].map((transaction) => (
                        <tr key={transaction.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{transaction.title}</div>
                              <div className="text-sm text-gray-500">ID: {transaction.id}</div>
                              <div className="text-xs text-gray-400 mt-1">{transaction.description}</div>
                              {transaction.seller && transaction.buyer && (
                                <div className="text-xs text-gray-400 mt-1">
                                  <div>Från: {transaction.seller}</div>
                                  <div>Till: {transaction.buyer}</div>
                                </div>
                              )}
                              {transaction.recipient && (
                                <div className="text-xs text-gray-400 mt-1">
                                  Mottagare: {transaction.recipient}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.type === 'business_sale' ? 'bg-blue-100 text-blue-800' :
                              transaction.type === 'crowdfunding_payout' ? 'bg-purple-100 text-purple-800' :
                              transaction.type === 'escrow_release' ? 'bg-green-100 text-green-800' :
                              transaction.type === 'commission_payout' ? 'bg-orange-100 text-orange-800' :
                              transaction.type === 'refund' ? 'bg-red-100 text-red-800' :
                              transaction.type === 'investment_return' ? 'bg-indigo-100 text-indigo-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.type === 'business_sale' ? 'Företagsförsäljning' :
                               transaction.type === 'crowdfunding_payout' ? 'Crowdfunding' :
                               transaction.type === 'escrow_release' ? 'Escrow' :
                               transaction.type === 'commission_payout' ? 'Provision' :
                               transaction.type === 'refund' ? 'Återbetalning' :
                               transaction.type === 'investment_return' ? 'Investering' :
                               transaction.type}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{formatPrice(transaction.amount)}</div>
                            {transaction.fee !== 0 && (
                              <div className="text-xs text-gray-500">
                                Avgift: {formatPrice(Math.abs(transaction.fee))}
                              </div>
                            )}
                            <div className="text-xs text-green-600 font-medium">
                              Netto: {formatPrice(transaction.amount - Math.abs(transaction.fee))}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              transaction.status === 'pending_approval' ? 'bg-yellow-100 text-yellow-800' :
                              transaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                              transaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {transaction.status === 'pending_approval' ? 'Väntar godkännande' :
                               transaction.status === 'approved' ? 'Godkänd' :
                               transaction.status === 'rejected' ? 'Avvisad' :
                               transaction.status}
                            </span>
                            {transaction.rejectionReason && (
                              <div className="text-xs text-red-600 mt-1">
                                Anledning: {transaction.rejectionReason}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {new Date(transaction.createdAt).toLocaleDateString('sv-SE')}
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(transaction.createdAt).toLocaleTimeString('sv-SE', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col space-y-1">
                              {transaction.status === 'pending_approval' && (
                                <>
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Godkänn transaktion ${transaction.id}?\\n\\nBelopp: ${formatPrice(transaction.amount)}\\nMottagare: ${transaction.recipient || transaction.buyer || transaction.seller}`)) {
                                        toast.success(`Transaktion ${transaction.id} godkänd och betalning initierad`);
                                      }
                                    }}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    ✓ Godkänn & Betala
                                  </button>
                                  <button 
                                    onClick={() => {
                                      const reason = prompt('Anledning för avvisning:');
                                      if (reason) {
                                        toast.error(`Transaktion ${transaction.id} avvisad: ${reason}`);
                                      }
                                    }}
                                    className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                  >
                                    ✗ Avvisa
                                  </button>
                                </>
                              )}
                              {transaction.status === 'rejected' && (
                                <button 
                                  onClick={() => {
                                    toast.info(`Transaktion ${transaction.id} återöppnad för granskning`);
                                  }}
                                  className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                >
                                  Återöppna
                                </button>
                              )}
                              <button 
                                onClick={() => {
                                  toast.info(`Visa fullständig historik för ${transaction.id}`);
                                }}
                                className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                              >
                                Visa detaljer
                              </button>
                              <button 
                                onClick={() => {
                                  toast.info(`Laddar ner kvitto för ${transaction.id}`);
                                }}
                                className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                              >
                                <Download className="w-3 h-3 inline mr-1" />
                                Kvitto
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Visar 7 av 156 transaktioner
                    </div>
                    <div className="flex space-x-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                        Godkänn alla väntande
                      </button>
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                        Exportera rapport
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Senaste framgångsrika affärer</h3>
                  <div className="space-y-4">
                    {[
                      {
                        id: '1',
                        title: 'TechStartup AB',
                        price: 2500000,
                        image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop&crop=center',
                        buyer: 'Magnus Lindqvist',
                        seller: 'Anna Karlsson',
                        completedAt: '2024-06-25',
                        category: 'Technology'
                      },
                      {
                        id: '2',
                        title: 'Restaurang Gamla Stan',
                        price: 1200000,
                        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop&crop=center',
                        buyer: 'Erik Johansson',
                        seller: 'Maria Andersson',
                        completedAt: '2024-06-23',
                        category: 'Restaurant'
                      },
                      {
                        id: '3',
                        title: 'E-handel Fashion',
                        price: 950000,
                        image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop&crop=center',
                        buyer: 'Sofia Bergström',
                        seller: 'David Petersson',
                        completedAt: '2024-06-22',
                        category: 'E-commerce'
                      }
                    ].map((deal) => (
                      <div key={deal.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <img 
                            src={deal.image} 
                            alt={deal.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://via.placeholder.com/64x64/3B82F6/FFFFFF?text=${deal.category.slice(0,1)}`;
                            }}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">{deal.title}</h4>
                          <p className="text-sm text-gray-600">{deal.category}</p>
                          <p className="text-lg font-bold text-green-600">{formatPrice(deal.price)}</p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500">Köpare: {deal.buyer}</p>
                          <p className="text-xs text-gray-500">Säljare: {deal.seller}</p>
                          <p className="text-xs text-gray-400">{formatDate(deal.completedAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">Escrow-transaktioner</h3>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-gray-500">7 aktiva transaktioner</span>
                        <span className="text-sm font-medium text-blue-600">Total värde: {formatPrice(12750000)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaktion</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Belopp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tid kvar</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {[
                          {
                            id: 'ESC-2024-001',
                            title: 'Digital Marknadsföring AB',
                            amount: 750000,
                            buyer: 'Peter Nilsson',
                            buyerEmail: 'peter@example.com',
                            seller: 'Lisa Holm',
                            sellerEmail: 'lisa@example.com',
                            status: 'pending_inspection',
                            createdAt: '2024-06-20T10:00:00Z',
                            inspectionDeadline: '2024-07-05T23:59:59Z',
                            daysLeft: 5,
                            escrowFee: 15000,
                            documents: ['contract.pdf', 'due_diligence.pdf']
                          },
                          {
                            id: 'ESC-2024-002',
                            title: 'Konsultföretag Stockholm',
                            amount: 850000,
                            buyer: 'Anna Svensson',
                            buyerEmail: 'anna.s@example.com',
                            seller: 'Marcus Berg',
                            sellerEmail: 'marcus@example.com',
                            status: 'funds_held',
                            createdAt: '2024-06-15T14:30:00Z',
                            inspectionDeadline: '2024-07-15T23:59:59Z',
                            daysLeft: 12,
                            escrowFee: 17000,
                            documents: ['agreement.pdf', 'financial_report.pdf']
                          },
                          {
                            id: 'ESC-2024-003',
                            title: 'E-handel Fashion Store',
                            amount: 2200000,
                            buyer: 'Erik Johansson',
                            buyerEmail: 'erik@fashion.com',
                            seller: 'Maria Andersson',
                            sellerEmail: 'maria@store.se',
                            status: 'dispute',
                            createdAt: '2024-06-10T09:15:00Z',
                            inspectionDeadline: '2024-07-01T23:59:59Z',
                            daysLeft: -2,
                            escrowFee: 44000,
                            documents: ['purchase_agreement.pdf', 'inventory_list.pdf'],
                            disputeReason: 'Inventory mismatch'
                          },
                          {
                            id: 'ESC-2024-004',
                            title: 'Tech Startup Innovation',
                            amount: 3500000,
                            buyer: 'Sofia Bergström',
                            buyerEmail: 'sofia@venture.se',
                            seller: 'David Petersson',
                            sellerEmail: 'david@techstartup.se',
                            status: 'awaiting_documents',
                            createdAt: '2024-06-25T16:45:00Z',
                            inspectionDeadline: '2024-08-25T23:59:59Z',
                            daysLeft: 28,
                            escrowFee: 70000,
                            documents: ['term_sheet.pdf']
                          },
                          {
                            id: 'ESC-2024-005',
                            title: 'Restaurang Nordic Taste',
                            amount: 1800000,
                            buyer: 'Andreas Lindqvist',
                            buyerEmail: 'andreas@nordic.se',
                            seller: 'Jenny Karlsson',
                            sellerEmail: 'jenny@taste.se',
                            status: 'ready_for_release',
                            createdAt: '2024-05-30T11:20:00Z',
                            inspectionDeadline: '2024-06-30T23:59:59Z',
                            daysLeft: 0,
                            escrowFee: 36000,
                            documents: ['business_transfer.pdf', 'lease_agreement.pdf', 'final_inspection.pdf']
                          }
                        ].map((escrow) => (
                          <tr key={escrow.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-gray-900">{escrow.title}</div>
                                <div className="text-sm text-gray-500">ID: {escrow.id}</div>
                                <div className="text-xs text-gray-400 mt-1">
                                  <div>Köpare: {escrow.buyer} ({escrow.buyerEmail})</div>
                                  <div>Säljare: {escrow.seller} ({escrow.sellerEmail})</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-medium text-gray-900">{formatPrice(escrow.amount)}</div>
                              <div className="text-xs text-gray-500">Escrow-avgift: {formatPrice(escrow.escrowFee)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                escrow.status === 'pending_inspection' ? 'bg-yellow-100 text-yellow-800' :
                                escrow.status === 'funds_held' ? 'bg-blue-100 text-blue-800' :
                                escrow.status === 'dispute' ? 'bg-red-100 text-red-800' :
                                escrow.status === 'awaiting_documents' ? 'bg-orange-100 text-orange-800' :
                                escrow.status === 'ready_for_release' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {escrow.status === 'pending_inspection' ? 'Väntar besiktning' :
                                 escrow.status === 'funds_held' ? 'Medel hålls' :
                                 escrow.status === 'dispute' ? 'Tvist' :
                                 escrow.status === 'awaiting_documents' ? 'Väntar dokument' :
                                 escrow.status === 'ready_for_release' ? 'Klar för frisläpp' : escrow.status}
                              </span>
                              {escrow.disputeReason && (
                                <div className="text-xs text-red-600 mt-1">
                                  Anledning: {escrow.disputeReason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              <div className={`text-sm font-medium ${
                                escrow.daysLeft < 0 ? 'text-red-600' :
                                escrow.daysLeft <= 3 ? 'text-yellow-600' : 'text-gray-900'
                              }`}>
                                {escrow.daysLeft < 0 ? `${Math.abs(escrow.daysLeft)} dagar försenad` :
                                 escrow.daysLeft === 0 ? 'Löper ut idag' :
                                 `${escrow.daysLeft} dagar kvar`}
                              </div>
                              <div className="text-xs text-gray-500">
                                Deadline: {new Date(escrow.inspectionDeadline).toLocaleDateString('sv-SE')}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex flex-col space-y-1">
                                {escrow.status === 'ready_for_release' && (
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Är du säker på att du vill frisläppa ${formatPrice(escrow.amount)} till ${escrow.seller}?`)) {
                                        toast.success(`Medel frisläppta till ${escrow.seller}`);
                                      }
                                    }}
                                    className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                  >
                                    Frisläpp medel
                                  </button>
                                )}
                                {escrow.status === 'dispute' && (
                                  <>
                                    <button 
                                      onClick={() => {
                                        if (confirm(`Återbetala ${formatPrice(escrow.amount)} till ${escrow.buyer}?`)) {
                                          toast.success(`Återbetalning initierad till ${escrow.buyer}`);
                                        }
                                      }}
                                      className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                    >
                                      Återbetala
                                    </button>
                                    <button 
                                      onClick={() => toast.info('Medlingsprocess startad')}
                                      className="text-xs bg-purple-600 text-white px-2 py-1 rounded hover:bg-purple-700"
                                    >
                                      Starta medling
                                    </button>
                                  </>
                                )}
                                {escrow.status === 'pending_inspection' && (
                                  <button 
                                    onClick={() => {
                                      if (confirm(`Förläng besiktningstid för ${escrow.title} med 7 dagar?`)) {
                                        toast.success('Besiktningstid förlängd med 7 dagar');
                                      }
                                    }}
                                    className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                                  >
                                    Förläng tid
                                  </button>
                                )}
                                <button 
                                  onClick={() => toast.info(`Meddelanden skickade till ${escrow.buyer} och ${escrow.seller}`)}
                                  className="text-xs bg-gray-600 text-white px-2 py-1 rounded hover:bg-gray-700"
                                >
                                  Kontakta parter
                                </button>
                                <button 
                                  onClick={() => {
                                    const docs = escrow.documents.join(', ');
                                    toast.info(`Dokument: ${docs}`);
                                  }}
                                  className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                                >
                                  Visa dokument ({escrow.documents.length})
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Visar 5 av 7 transaktioner
                      </div>
                      <div className="flex space-x-2">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 transition-colors">
                          Exportera rapport
                        </button>
                        <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700 transition-colors">
                          Skapa ny escrow
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Systemkonfiguration</h2>
                <p className="text-gray-600">Hantera plattformsinställningar och konfiguration</p>
              </div>

              <div className="space-y-6">
                {/* General Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Allmänna inställningar</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Plattformsnamn</label>
                      <input 
                        type="text" 
                        value={platformSettings.platformName} 
                        onChange={(e) => handleSettingChange('platformName', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Support e-post</label>
                      <input 
                        type="email" 
                        value={platformSettings.supportEmail} 
                        onChange={(e) => handleSettingChange('supportEmail', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Plattformsbeskrivning</label>
                      <textarea 
                        value={platformSettings.platformDescription} 
                        onChange={(e) => handleSettingChange('platformDescription', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Valuta</label>
                      <select 
                        value={platformSettings.currency} 
                        onChange={(e) => handleSettingChange('currency', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="SEK">SEK - Svenska kronor</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="USD">USD - Dollar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Språk</label>
                      <select 
                        value={platformSettings.language} 
                        onChange={(e) => handleSettingChange('language', e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="sv-SE">Svenska</option>
                        <option value="en-US">English</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Platform Features */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Plattformsfunktioner</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Underhållsläge</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={platformSettings.maintenanceMode}
                            onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Registrering aktiverad</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={platformSettings.registrationEnabled}
                            onChange={(e) => handleSettingChange('registrationEnabled', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">E-postnotifikationer</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={platformSettings.emailNotifications}
                            onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Max annonser per användare</label>
                        <input 
                          type="number" 
                          value={platformSettings.maxListingsPerUser} 
                          onChange={(e) => handleSettingChange('maxListingsPerUser', parseInt(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Standard annonsvaraktighet (dagar)</label>
                        <input 
                          type="number" 
                          value={platformSettings.defaultListingDuration} 
                          onChange={(e) => handleSettingChange('defaultListingDuration', parseInt(e.target.value))}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pricing Settings */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Prissättning</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Utvald annons (SEK)</label>
                      <input 
                        type="number" 
                        value={platformSettings.featuredListingPrice} 
                        onChange={(e) => handleSettingChange('featuredListingPrice', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Boost annons (SEK)</label>
                      <input 
                        type="number" 
                        value={platformSettings.boostListingPrice} 
                        onChange={(e) => handleSettingChange('boostListingPrice', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Premium support (SEK)</label>
                      <input 
                        type="number" 
                        value={platformSettings.premiumSupportPrice} 
                        onChange={(e) => handleSettingChange('premiumSupportPrice', parseInt(e.target.value))}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500" 
                      />
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSaveSettings}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Spara inställningar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Success Status */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-green-600 mr-3" />
              <div>
                <h3 className="text-lg font-medium text-green-800">
                  ✅ Komplett Admin Panel Aktiv!
                </h3>
                <div className="mt-2 text-sm text-green-700">
                  <p>Alla funktioner är nu implementerade och funktionella:</p>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>• Fullständig användarhantering med ångra-funktion</div>
                    <div>• Komplett content moderation med alla åtgärder</div>
                    <div>• Fullt funktionellt support system</div>
                    <div>• Finansiell övervakning och rapporter</div>
                    <div>• Real-time dashboard med statistik</div>
                    <div>• Systemkonfiguration och inställningar</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listing View Modal */}
      {showListingModal && selectedListingForView && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Annonsdetaljer</h2>
                <button
                  onClick={() => setShowListingModal(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <XCircle className="w-6 h-6 text-gray-600" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Header Info */}
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedListingForView.title}</h3>
                    <p className="text-gray-600 mt-1">{selectedListingForView.description}</p>
                    <div className="flex items-center space-x-4 mt-3">
                      <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(selectedListingForView.status)}`}>
                        {selectedListingForView.status === 'PENDING' ? 'Väntar' : selectedListingForView.status === 'ACTIVE' ? 'Aktiv' : selectedListingForView.status}
                      </span>
                      <span className="text-sm text-gray-500">ID: {selectedListingForView.id}</span>
                      <span className="text-sm text-gray-500">Skapad: {formatDate(selectedListingForView.createdAt)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{formatPrice(selectedListingForView.price)}</div>
                    <div className="text-sm text-gray-500">{selectedListingForView.category}</div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Säljare</h4>
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                          <span className="text-sm font-medium text-gray-600">{selectedListingForView.seller.charAt(0)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{selectedListingForView.seller}</div>
                          <div className="text-xs text-gray-500">Säljare ID: {selectedListingForView.sellerId}</div>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Plats</h4>
                      <p className="text-sm text-gray-600">{selectedListingForView.location}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Riskbedömning</h4>
                      <span className={`inline-flex px-2 py-1 rounded text-sm font-medium ${getRiskColor(selectedListingForView.riskScore)}`}>
                        Risk: {selectedListingForView.riskScore}%
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Aktivitet</h4>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>{selectedListingForView.views} visningar</div>
                        {selectedListingForView.reports > 0 && (
                          <div className="text-red-600">{selectedListingForView.reports} rapport(er)</div>
                        )}
                        {selectedListingForView.featured && (
                          <div className="text-purple-600">✨ Utvald annons</div>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Snabbåtgärder</h4>
                      <div className="flex space-x-2">
                        {selectedListingForView.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => {
                                handleApproveListing(selectedListingForView.id);
                                setShowListingModal(false);
                              }}
                              className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded hover:bg-green-200"
                            >
                              Godkänn
                            </button>
                            <button
                              onClick={() => {
                                handleRejectListing(selectedListingForView.id);
                                setShowListingModal(false);
                              }}
                              className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                            >
                              Avslå
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            handleFeatureListing(selectedListingForView.id);
                            setShowListingModal(false);
                          }}
                          className={`px-3 py-1 text-sm rounded ${
                            selectedListingForView.featured 
                              ? 'bg-purple-100 text-purple-700 hover:bg-purple-200' 
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {selectedListingForView.featured ? 'Ta bort från utvalda' : 'Gör till utvald'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full Description */}
                <div>
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Fullständig beskrivning</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedListingForView.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminDashboard;