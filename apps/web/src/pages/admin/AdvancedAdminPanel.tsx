import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, Users, Building2, MessageSquare, DollarSign, Settings, Eye, Edit, Trash2, CheckCircle, XCircle, AlertTriangle, TrendingUp, Activity, Search, Filter, Send, Clock, User, Calendar, RefreshCw, Undo2, Mail, Phone, MapPin, Star, ThumbsUp, ThumbsDown, Plus, Save, StickyNote, CreditCard, Lock, Unlock, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import ChatSystem from '../../components/chat/ChatSystem';

interface AdvancedAdminPanelProps {
  onLogout?: () => void;
}

const AdvancedAdminPanel: React.FC<AdvancedAdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [deletedUsers, setDeletedUsers] = useState<any[]>([]);
  const [deletedListings, setDeletedListings] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [editingUser, setEditingUser] = useState<any>(null);
  const [viewingUser, setViewingUser] = useState<any>(null);
  const [newNote, setNewNote] = useState('');
  const [editingNote, setEditingNote] = useState<any>(null);
  const [listingUrl, setListingUrl] = useState('');
  const [selectedPromotionListing, setSelectedPromotionListing] = useState<any>(null);
  const [viewingListing, setViewingListing] = useState<any>(null);
  const [editingListing, setEditingListing] = useState<any>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  
  // Advanced filtering and sorting state
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [promotionFilter, setPromotionFilter] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  
  // Promotion requests system
  const [promotionRequests, setPromotionRequests] = useState([
    {
      id: 'PROMO001',
      listingId: '1',
      listingTitle: 'TechStartup AB',
      userId: 'user_anna',
      userName: 'Anna Karlsson',
      promotionType: 'premium',
      amount: 1500,
      currency: 'SEK',
      status: 'pending',
      paymentId: 'PAY123456789',
      requestedAt: '2024-06-26 15:30',
      notes: 'Användaren vill få sin annons prioriterad'
    },
    {
      id: 'PROMO002',
      listingId: '2',
      listingTitle: 'Konsultföretag Stockholm',
      userId: 'user_erik',
      userName: 'Erik Johansson',
      promotionType: 'featured',
      amount: 2500,
      currency: 'SEK',
      status: 'pending',
      paymentId: 'PAY987654321',
      requestedAt: '2024-06-26 12:15',
      notes: 'Premium placering + framhävd på startsidan'
    }
  ]);
  
  // Notes system
  const [notes, setNotes] = useState([
    {
      id: '1',
      title: 'Viktigt att komma ihåg',
      content: 'Kontrollera alla nya användare extra noggrant denna vecka',
      category: 'reminder',
      createdAt: '2024-06-26 10:30',
      updatedAt: '2024-06-26 10:30'
    },
    {
      id: '2',
      title: 'Teknisk uppgradering',
      content: 'Planerad underhåll av systemet på fredag kväll',
      category: 'technical',
      createdAt: '2024-06-25 14:15',
      updatedAt: '2024-06-25 14:15'
    }
  ]);

  // Escrow transactions
  const [escrowTransactions, setEscrowTransactions] = useState([
    {
      id: 'ESC001',
      listingId: '1',
      listingTitle: 'TechStartup AB',
      buyer: 'Erik Johansson',
      buyerId: '2',
      seller: 'Anna Karlsson',
      sellerId: '1',
      amount: 2500000,
      status: 'PENDING_APPROVAL',
      createdAt: '2024-06-26 09:30',
      depositedAt: '2024-06-26 09:35',
      description: 'Köp av TechStartup AB - Escrow betalning'
    },
    {
      id: 'ESC002',
      listingId: '2',
      listingTitle: 'Restaurang Gamla Stan',
      buyer: 'Maria Svensson',
      buyerId: '3',
      seller: 'Erik Johansson',
      sellerId: '2',
      amount: 1200000,
      status: 'APPROVED',
      createdAt: '2024-06-25 14:20',
      depositedAt: '2024-06-25 14:25',
      approvedAt: '2024-06-25 16:45',
      description: 'Köp av Restaurang Gamla Stan - Escrow betalning'
    },
    {
      id: 'ESC003',
      listingId: '3',
      listingTitle: 'E-handel Fashion',
      buyer: 'Anna Karlsson',
      buyerId: '1',
      seller: 'Maria Svensson',
      sellerId: '3',
      amount: 800000,
      status: 'RELEASED',
      createdAt: '2024-06-24 11:10',
      depositedAt: '2024-06-24 11:15',
      approvedAt: '2024-06-24 15:30',
      releasedAt: '2024-06-25 10:00',
      description: 'Köp av E-handel Fashion - Escrow betalning genomförd'
    }
  ]);

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
    openTickets: 8,
    escrowTotal: 4500000,
    escrowPending: 2500000
  });

  const [users, setUsers] = useState([
    { 
      id: '1', 
      name: 'Anna Karlsson', 
      email: 'anna@example.com', 
      phone: '+46 70 123 4567',
      location: 'Stockholm',
      address: 'Drottninggatan 123, 111 51 Stockholm',
      status: 'ACTIVE', 
      listingsCount: 3, 
      verified: true,
      joinedDate: '2024-01-15',
      lastLogin: '2024-06-25 14:30',
      totalSpent: 45000,
      avatar: 'AK',
      bankIdVerified: true,
      company: 'Karlsson Consulting AB',
      personalNumber: '19850315-****'
    },
    { 
      id: '2', 
      name: 'Erik Johansson', 
      email: 'erik@example.com', 
      phone: '+46 70 987 6543',
      location: 'Göteborg',
      address: 'Avenyn 45, 411 36 Göteborg',
      status: 'ACTIVE', 
      listingsCount: 1, 
      verified: true,
      joinedDate: '2024-02-20',
      lastLogin: '2024-06-26 09:15',
      totalSpent: 12000,
      avatar: 'EJ',
      bankIdVerified: false,
      company: '',
      personalNumber: '19920822-****'
    },
    { 
      id: '3', 
      name: 'Maria Svensson', 
      email: 'maria@example.com', 
      phone: '+46 70 555 1234',
      location: 'Malmö',
      address: 'Stora Torget 8, 211 34 Malmö',
      status: 'SUSPENDED', 
      listingsCount: 0, 
      verified: false,
      joinedDate: '2024-03-10',
      lastLogin: '2024-06-20 16:45',
      totalSpent: 0,
      avatar: 'MS',
      bankIdVerified: false,
      company: 'Fashion Forward AB',
      personalNumber: '19881205-****'
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
      views: 245, 
      reports: 0,
      description: 'Innovativt teknikföretag med stark tillväxt och AI-fokus',
      location: 'Stockholm',
      createdAt: '2024-06-25',
      featured: false,
      riskScore: 15,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 123 4567',
      email: 'anna@techstartup.se',
      inquiries: 18
    },
    { 
      id: '2', 
      title: 'Restaurang Gamla Stan', 
      category: 'Restaurant', 
      price: 1200000, 
      seller: 'Erik Johansson', 
      sellerId: '2',
      status: 'ACTIVE', 
      views: 189, 
      reports: 1,
      description: 'Välbesökt restaurang i hjärtat av Stockholm',
      location: 'Stockholm',
      createdAt: '2024-06-20',
      featured: true,
      riskScore: 25,
      starred: true,
      promotionStatus: 'premium',
      phone: '+46 70 987 6543',
      email: 'erik@restaurangoldtown.se',
      inquiries: 12
    },
    { 
      id: '3', 
      title: 'E-handel Fashion', 
      category: 'E-commerce', 
      price: 800000, 
      seller: 'Maria Svensson', 
      sellerId: '3',
      status: 'PENDING', 
      views: 167, 
      reports: 0,
      description: 'Online modebutik med stor potential',
      location: 'Malmö',
      createdAt: '2024-06-24',
      featured: false,
      riskScore: 35,
      starred: false,
      promotionStatus: 'hot_sale',
      phone: '+46 70 555 1234',
      email: 'maria@fashionforward.se',
      inquiries: 25
    },
    { 
      id: '4', 
      title: 'Konsultföretag Stockholm', 
      category: 'Consulting', 
      price: 1800000, 
      seller: 'Lars Andersson', 
      sellerId: '4',
      status: 'ACTIVE', 
      views: 134, 
      reports: 0,
      description: 'Etablerat konsultföretag inom IT med 15 års erfarenhet',
      location: 'Stockholm',
      createdAt: '2024-06-22',
      featured: false,
      riskScore: 10,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 777 8888',
      email: 'lars@itkonsult.se',
      inquiries: 8
    },
    { 
      id: '5', 
      title: 'Bygg & Anläggning Väst', 
      category: 'Construction', 
      price: 3200000, 
      seller: 'Stefan Nilsson', 
      sellerId: '5',
      status: 'ACTIVE', 
      views: 198, 
      reports: 0,
      description: 'Välbeläget byggföretag med starka kundrelationer',
      location: 'Göteborg',
      createdAt: '2024-06-18',
      featured: true,
      riskScore: 20,
      starred: true,
      promotionStatus: 'featured',
      phone: '+46 70 999 0000',
      email: 'stefan@byggvast.se',
      inquiries: 15
    },
    { 
      id: '6', 
      title: 'Digital Marknadsföringsbyrå', 
      category: 'Marketing', 
      price: 2200000, 
      seller: 'Emma Lindberg', 
      sellerId: '6',
      status: 'PENDING', 
      views: 89, 
      reports: 0,
      description: 'Fullservice digitalbyrå med stora kunder och stabila intäkter',
      location: 'Stockholm',
      createdAt: '2024-06-26',
      featured: false,
      riskScore: 18,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 111 2222',
      email: 'emma@digitalbyra.se',
      inquiries: 22
    },
    { 
      id: '7', 
      title: 'Frisörsalong Centrum', 
      category: 'Beauty', 
      price: 450000, 
      seller: 'Lisa Persson', 
      sellerId: '7',
      status: 'ACTIVE', 
      views: 76, 
      reports: 0,
      description: 'Välbelägen frisörsalong med lojala kunder',
      location: 'Malmö',
      createdAt: '2024-06-21',
      featured: false,
      riskScore: 30,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 333 4444',
      email: 'lisa@saloncentrum.se',
      inquiries: 6
    },
    { 
      id: '8', 
      title: 'Cafe & Bageri Söder', 
      category: 'Food & Beverage', 
      price: 650000, 
      seller: 'Magnus Holm', 
      sellerId: '8',
      status: 'ACTIVE', 
      views: 123, 
      reports: 1,
      description: 'Mysigt cafe med hembakat bröd och stark morgonrusning',
      location: 'Stockholm',
      createdAt: '2024-06-19',
      featured: false,
      riskScore: 25,
      starred: false,
      promotionStatus: 'premium',
      phone: '+46 70 555 6666',
      email: 'magnus@cafesoder.se',
      inquiries: 9
    },
    { 
      id: '9', 
      title: 'Verkstad & Bilservice', 
      category: 'Automotive', 
      price: 1500000, 
      seller: 'Patrik Svensson', 
      sellerId: '9',
      status: 'PENDING', 
      views: 67, 
      reports: 0,
      description: 'Välutrustad bilverkstad med auktoriserade mekaniker',
      location: 'Göteborg',
      createdAt: '2024-06-23',
      featured: false,
      riskScore: 22,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 777 9999',
      email: 'patrik@verkstadservice.se',
      inquiries: 11
    },
    { 
      id: '10', 
      title: 'SaaS Plattform B2B', 
      category: 'Software', 
      price: 4500000, 
      seller: 'Johan Eriksson', 
      sellerId: '10',
      status: 'ACTIVE', 
      views: 234, 
      reports: 0,
      description: 'Prenumerationsbaserad mjukvarulösning för små företag',
      location: 'Stockholm',
      createdAt: '2024-06-15',
      featured: true,
      riskScore: 12,
      starred: true,
      promotionStatus: 'vip',
      phone: '+46 70 888 7777',
      email: 'johan@saasplatform.se',
      inquiries: 28
    },
    { 
      id: '11', 
      title: 'Redovisningsbyrå Syd', 
      category: 'Accounting', 
      price: 980000, 
      seller: 'Ingrid Karlsson', 
      sellerId: '11',
      status: 'ACTIVE', 
      views: 98, 
      reports: 0,
      description: 'Välrenommerad redovisningsbyrå med 25 års erfarenhet',
      location: 'Malmö',
      createdAt: '2024-06-17',
      featured: false,
      riskScore: 8,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 444 5555',
      email: 'ingrid@redovisningsyd.se',
      inquiries: 14
    },
    { 
      id: '12', 
      title: 'Transportföretag Nord', 
      category: 'Logistics', 
      price: 2800000, 
      seller: 'Mikael Lindström', 
      sellerId: '12',
      status: 'PENDING', 
      views: 145, 
      reports: 2,
      description: 'Åkerifirma med egen fordonsflotta och etablerade rutter',
      location: 'Umeå',
      createdAt: '2024-06-27',
      featured: false,
      riskScore: 40,
      starred: false,
      promotionStatus: 'normal',
      phone: '+46 70 666 7777',
      email: 'mikael@transportnord.se',
      inquiries: 7
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
    }
  ]);

  // Filtered data for search functionality
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Enhanced filtering and sorting logic
  const filteredAndSortedListings = React.useMemo(() => {
    let filtered = listings.filter(listing => {
      const matchesSearch = 
        listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.seller.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        listing.phone.includes(searchTerm) ||
        listing.id.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = !statusFilter || listing.status === statusFilter;
      const matchesCategory = !categoryFilter || listing.category === categoryFilter;
      const matchesPromotion = !promotionFilter || listing.promotionStatus === promotionFilter;
      
      return matchesSearch && matchesStatus && matchesCategory && matchesPromotion;
    });

    // Sorting logic
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'price_high':
          return b.price - a.price;
        case 'price_low':
          return a.price - b.price;
        case 'views_high':
          return b.views - a.views;
        case 'inquiries_high':
          return b.inquiries - a.inquiries;
        default:
          return 0;
      }
    });

    return filtered;
  }, [listings, searchTerm, statusFilter, categoryFilter, promotionFilter, sortBy]);

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

  const getEscrowStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_APPROVAL': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'RELEASED': return 'bg-green-100 text-green-800';
      case 'REFUNDED': return 'bg-red-100 text-red-800';
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

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'reminder': return 'bg-blue-100 text-blue-800';
      case 'technical': return 'bg-purple-100 text-purple-800';
      case 'todo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Quick Actions Functions
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'pending_listings':
        setActiveTab('listings');
        setSearchTerm('');
        toast.success('Visar väntande annonser');
        break;
      case 'support_tickets':
        setActiveTab('support');
        toast.success('Visar support tickets');
        break;
      case 'new_users':
        setActiveTab('users');
        setSearchTerm('');
        toast.success('Visar nya användare');
        break;
      case 'escrow_pending':
        setActiveTab('finance');
        toast.success('Visar väntande escrow-transaktioner');
        break;
    }
  };

  // Notes Functions
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const note = {
      id: Date.now().toString(),
      title: newNote.length > 50 ? newNote.substring(0, 50) + '...' : newNote,
      content: newNote,
      category: 'reminder',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    toast.success('Anteckning sparad');
  };

  const handleEditNote = (note: any) => {
    setEditingNote({ ...note });
  };

  const handleSaveNote = () => {
    if (!editingNote?.content.trim()) return;
    
    setNotes(prev => prev.map(note => 
      note.id === editingNote.id 
        ? { 
            ...editingNote, 
            title: editingNote.content.length > 50 ? editingNote.content.substring(0, 50) + '...' : editingNote.content,
            updatedAt: new Date().toISOString() 
          }
        : note
    ));
    setEditingNote(null);
    toast.success('Anteckning uppdaterad');
  };

  const handleDeleteNote = (noteId: string) => {
    setNotes(prev => prev.filter(note => note.id !== noteId));
    toast.success('Anteckning borttagen');
  };

  // User Edit Functions
  const handleEditUser = (user: any) => {
    setEditingUser({ ...user });
  };

  const handleSaveUser = () => {
    if (!editingUser) return;
    
    setUsers(prev => prev.map(user => 
      user.id === editingUser.id ? editingUser : user
    ));
    setEditingUser(null);
    toast.success(`Användare ${editingUser.name} uppdaterad`);
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditingNote(null);
    setViewingListing(null);
    setEditingListing(null);
  };

  // User Details Functions
  const handleViewUser = (user: any) => {
    setViewingUser(user);
  };

  const handleCloseUserDetails = () => {
    setViewingUser(null);
  };

  // Listing Functions
  const handleStarListing = (listingId: string) => {
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, starred: !l.starred } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    toast.success(`Annons "${listing?.title}" har ${listing?.starred ? 'tagits bort från' : 'lagts till som'} stjärnmarkerad`);
  };

  const handleSetListingStatus = (listingId: string, status: string) => {
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, promotionStatus: status } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    const statusText = status === 'hot_sale' ? 'Hot Sale' : status === 'premium' ? 'Premium' : status === 'featured' ? 'Utvald' : 'Normal';
    toast.success(`Annons "${listing?.title}" har markerats som ${statusText}`);
  };

  const handleViewListing = (listing: any) => {
    setViewingListing(listing);
  };

  const handleEditListing = (listing: any) => {
    setEditingListing({ ...listing });
  };

  const handleSaveListing = () => {
    if (!editingListing) return;
    
    setListings(prev => prev.map(listing => 
      listing.id === editingListing.id ? editingListing : listing
    ));
    setEditingListing(null);
    toast.success(`Annons "${editingListing.title}" uppdaterad`);
  };

  // URL-based promotion functions
  const handleProcessListingUrl = () => {
    if (!listingUrl.trim()) {
      toast.error('Vänligen ange en annons-URL');
      return;
    }

    // Extract listing ID from URL (assuming format like /listing/123)
    const urlMatch = listingUrl.match(/\/listing\/(\d+)/);
    if (!urlMatch) {
      toast.error('Ogiltig annons-URL format');
      return;
    }

    const listingId = urlMatch[1];
    const listing = listings.find(l => l.id === listingId);
    
    if (!listing) {
      toast.error('Annons hittades inte');
      return;
    }

    setSelectedPromotionListing(listing);
    toast.success(`Annons "${listing.title}" laddad för marknadsföring`);
  };

  const handleApplyPromotion = (promotionType: string) => {
    if (!selectedPromotionListing) return;

    setListings(prev => prev.map(l => 
      l.id === selectedPromotionListing.id 
        ? { ...l, promotionStatus: promotionType, featured: promotionType === 'featured' || promotionType === 'premium' }
        : l
    ));

    const statusText = {
      'hot_sale': 'Hot Sale',
      'premium': 'Premium',
      'featured': 'Framhävd',
      'normal': 'Normal'
    }[promotionType] || promotionType;

    toast.success(`Annons "${selectedPromotionListing.title}" har markerats som ${statusText}`);
    setSelectedPromotionListing(null);
    setListingUrl('');
  };

  // Escrow Functions
  const handleApproveEscrow = (transactionId: string) => {
    setEscrowTransactions(prev => prev.map(transaction => 
      transaction.id === transactionId 
        ? { 
            ...transaction, 
            status: 'APPROVED',
            approvedAt: new Date().toISOString()
          }
        : transaction
    ));
    toast.success('Escrow-transaktion godkänd');
  };

  const handleReleaseEscrow = (transactionId: string) => {
    setEscrowTransactions(prev => prev.map(transaction => 
      transaction.id === transactionId 
        ? { 
            ...transaction, 
            status: 'RELEASED',
            releasedAt: new Date().toISOString()
          }
        : transaction
    ));
    toast.success('Medel frigivna till säljare');
  };

  const handleRefundEscrow = (transactionId: string) => {
    setEscrowTransactions(prev => prev.map(transaction => 
      transaction.id === transactionId 
        ? { 
            ...transaction, 
            status: 'REFUNDED',
            refundedAt: new Date().toISOString()
          }
        : transaction
    ));
    toast.success('Medel återbetalda till köpare');
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
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, status: 'REJECTED' } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    toast.error(`Annons "${listing?.title}" har avvisats`);
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

  const handleFeatureListing = (listingId: string) => {
    setListings(prev => prev.map(l => 
      l.id === listingId ? { ...l, featured: !l.featured } : l
    ));
    const listing = listings.find(l => l.id === listingId);
    toast.success(`Annons "${listing?.title}" har ${listing?.featured ? 'tagits bort från' : 'lagts till som'} utvald`);
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

  const openTickets = supportTickets.filter(t => t.status === 'open' || t.status === 'in_progress');
  const resolvedTickets = supportTickets.filter(t => t.status === 'resolved' || t.status === 'closed');
  const pendingEscrow = escrowTransactions.filter(t => t.status === 'PENDING_APPROVAL');
  const totalEscrowHeld = escrowTransactions
    .filter(t => t.status === 'APPROVED' || t.status === 'PENDING_APPROVAL')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Shield className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">Hansa Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Admin: willi • Kraken Mode • {new Date().toLocaleDateString('sv-SE')}
              </div>
              {onLogout && (
                <button
                  onClick={onLogout}
                  className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <User className="w-4 h-4 mr-1" />
                  Logga ut
                </button>
              )}
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
              { id: 'support', label: 'Support', icon: MessageSquare },
              { id: 'finance', label: 'Ekonomi', icon: DollarSign },
              { id: 'promotions', label: 'Marknadsföring', icon: Star },
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
              <p className="text-gray-600">Real-time statistik och systemövervakning för Tubba-plattformen</p>
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
                  <Lock className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Escrow innehav</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(totalEscrowHeld)}</p>
                    <p className="text-xs text-orange-600">{pendingEscrow.length} väntar godkännande</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions - Fully Functional */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Snabbåtgärder</h3>
                <div className="space-y-2">
                  <button 
                    onClick={() => handleQuickAction('pending_listings')}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <Building2 className="w-4 h-4 text-blue-600 mr-2" />
                      <span className="text-sm font-medium">Granska väntande annonser</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stats.pendingListings} väntar</div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('support_tickets')}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-green-50 hover:border-green-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <MessageSquare className="w-4 h-4 text-green-600 mr-2" />
                      <span className="text-sm font-medium">Svara på support tickets</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stats.openTickets} öppna</div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('new_users')}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-purple-50 hover:border-purple-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <Users className="w-4 h-4 text-purple-600 mr-2" />
                      <span className="text-sm font-medium">Hantera nya användare</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{stats.newUsersToday} nya idag</div>
                  </button>
                  <button 
                    onClick={() => handleQuickAction('escrow_pending')}
                    className="w-full text-left p-3 border border-gray-200 rounded hover:bg-orange-50 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center">
                      <Lock className="w-4 h-4 text-orange-600 mr-2" />
                      <span className="text-sm font-medium">Godkänn escrow</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">{pendingEscrow.length} väntar</div>
                  </button>
                </div>
              </div>

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
                  <div className="flex items-center text-sm">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                    <span>Escrow-transaktion väntar godkännande</span>
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
                    <span className="text-sm text-gray-600">Escrow System</span>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                      <span className="text-sm font-medium text-green-600">Secure</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-gray-900">99.9%</span>
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

            {/* User Edit Modal */}
            {editingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Redigera användare: {editingUser.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Namn</label>
                      <input
                        type="text"
                        value={editingUser.name}
                        onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={editingUser.email}
                        onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                      <input
                        type="text"
                        value={editingUser.phone}
                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
                      <input
                        type="text"
                        value={editingUser.location}
                        onChange={(e) => setEditingUser({...editingUser, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Adress</label>
                      <input
                        type="text"
                        value={editingUser.address}
                        onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Företag</label>
                      <input
                        type="text"
                        value={editingUser.company}
                        onChange={(e) => setEditingUser({...editingUser, company: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingUser.status}
                        onChange={(e) => setEditingUser({...editingUser, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="ACTIVE">Aktiv</option>
                        <option value="SUSPENDED">Suspenderad</option>
                      </select>
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingUser.verified}
                          onChange={(e) => setEditingUser({...editingUser, verified: e.target.checked})}
                          className="mr-2"
                        />
                        Verifierad användare
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingUser.bankIdVerified}
                          onChange={(e) => setEditingUser({...editingUser, bankIdVerified: e.target.checked})}
                          className="mr-2"
                        />
                        BankID verifierad
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleSaveUser}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Spara ändringar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* User Details Modal */}
            {viewingUser && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Användardetaljer: {viewingUser.name}</h3>
                    <button
                      onClick={handleCloseUserDetails}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Grundläggande Information */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Grundläggande Information</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Namn:</span>
                            <span className="ml-2">{viewingUser.name}</span>
                          </div>
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Email:</span>
                            <span className="ml-2">{viewingUser.email}</span>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Telefon:</span>
                            <span className="ml-2">{viewingUser.phone}</span>
                          </div>
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Plats:</span>
                            <span className="ml-2">{viewingUser.location}</span>
                          </div>
                          {viewingUser.company && (
                            <div className="flex items-center">
                              <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="font-medium">Företag:</span>
                              <span className="ml-2">{viewingUser.company}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Status & Verifiering</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <span className="font-medium">Status:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                              viewingUser.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {viewingUser.status === 'ACTIVE' ? 'Aktiv' : 'Suspenderad'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">Verifierad:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                              viewingUser.verified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {viewingUser.verified ? 'Ja' : 'Nej'}
                            </span>
                          </div>
                          <div className="flex items-center">
                            <span className="font-medium">BankID:</span>
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                              viewingUser.bankIdVerified ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {viewingUser.bankIdVerified ? 'Verifierad' : 'Ej verifierad'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Aktivitet & Statistik */}
                    <div className="space-y-6">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Aktivitet</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Registrerad:</span>
                            <span className="ml-2">{viewingUser.joinedDate}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Senast inloggad:</span>
                            <span className="ml-2">{viewingUser.lastLogin}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Statistik</h4>
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Building2 className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Annonser:</span>
                            <span className="ml-2">{viewingUser.listingsCount}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="font-medium">Totalt spenderat:</span>
                            <span className="ml-2">{viewingUser.totalSpent} SEK</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Adress</h4>
                        <p className="text-gray-700">{viewingUser.address || 'Ingen adress angiven'}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-8">
                    <button
                      onClick={() => {
                        handleCloseUserDetails();
                        handleEditUser(viewingUser);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Redigera användare
                    </button>
                    <button
                      onClick={handleCloseUserDetails}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Stäng
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
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
                                {user.bankIdVerified && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                                    <Shield className="w-3 h-3 mr-1" />
                                    BankID
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
                            {user.company && (
                              <div className="text-gray-500 text-xs">{user.company}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div>{user.listingsCount} annonser</div>
                            <div className="text-gray-500">{formatPrice(user.totalSpent)} spenderat</div>
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
                              onClick={() => handleViewUser(user)}
                              className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                              title="Visa detaljer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEditUser(user)}
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

        {/* Unified Listings & Marketing Management */}
        {activeTab === 'listings' && (
          <div className="space-y-8">
            {/* Premium Header */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-xl p-8 shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">🏢 Annonser & Marknadsföring</h2>
                  <p className="text-blue-100 text-lg">Professionell hantering av alla annonser med avancerade marknadsföringsverktyg</p>
                  <div className="flex items-center mt-4 space-x-6 text-white">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 mr-2" />
                      <span className="font-medium">{listings.length} Totala annonser</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2" />
                      <span className="font-medium">{listings.filter(l => l.status === 'PENDING').length} Väntar granskning</span>
                    </div>
                    <div className="flex items-center">
                      <Star className="w-5 h-5 mr-2" />
                      <span className="font-medium">{listings.filter(l => l.promotionStatus !== 'normal').length} Promoverade</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Sök annonser, säljare, kategorier..."
                      className="pl-10 pr-4 py-3 w-80 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/70 focus:ring-2 focus:ring-white focus:border-white focus:bg-white/30"
                    />
                  </div>
                  <button
                    onClick={() => handleBulkAction('export_listings')}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-lg border border-white/30 font-medium transition-all duration-200 flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Exportera
                  </button>
                </div>
              </div>
            </div>

            {/* Statistics Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Totala Annonser</p>
                    <p className="text-3xl font-bold text-gray-900">{listings.length}</p>
                    <p className="text-xs text-green-600 flex items-center mt-2">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      +{listings.filter(l => l.createdAt.includes('2024-06-2')).length} senaste veckan
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-blue-100">
                    <Building2 className="w-8 h-8 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Väntar Granskning</p>
                    <p className="text-3xl font-bold text-gray-900">{listings.filter(l => l.status === 'PENDING').length}</p>
                    <p className="text-xs text-yellow-600 flex items-center mt-2">
                      <Clock className="w-3 h-3 mr-1" />
                      Kräver uppmärksamhet
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-yellow-100">
                    <Clock className="w-8 h-8 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-purple-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Promoverade</p>
                    <p className="text-3xl font-bold text-gray-900">{listings.filter(l => l.promotionStatus !== 'normal').length}</p>
                    <p className="text-xs text-purple-600 flex items-center mt-2">
                      <Star className="w-3 h-3 mr-1" />
                      Aktiva kampanjer
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-purple-100">
                    <Star className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-green-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">Totalt Värde</p>
                    <p className="text-3xl font-bold text-gray-900">{formatPrice(listings.reduce((sum, l) => sum + l.price, 0))}</p>
                    <p className="text-xs text-green-600 flex items-center mt-2">
                      <DollarSign className="w-3 h-3 mr-1" />
                      ⌀ {formatPrice(listings.reduce((sum, l) => sum + l.price, 0) / listings.length)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-green-100">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="w-6 h-6 mr-2 text-blue-600" />
                Snabbåtgärder & Masshantering
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => handleBulkAction('approve_all_pending')}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Godkänn alla väntande
                </button>
                <button
                  onClick={() => handleBulkAction('star_high_value')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
                >
                  <Star className="w-5 h-5 mr-2" />
                  Stjärnmärk högt värde
                </button>
                <button
                  onClick={() => handleBulkAction('promote_recent')}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
                >
                  <Award className="w-5 h-5 mr-2" />
                  Promota senaste
                </button>
                <button
                  onClick={() => handleBulkAction('contact_pending_sellers')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-4 rounded-xl transition-all duration-200 font-medium flex items-center justify-center shadow-lg"
                >
                  <Mail className="w-5 h-5 mr-2" />
                  Kontakta säljare
                </button>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2 text-blue-600" />
                Avancerade Filter & Sortering
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Alla status</option>
                  <option value="PENDING">Väntar granskning</option>
                  <option value="ACTIVE">Aktiva</option>
                  <option value="REJECTED">Avvisade</option>
                </select>
                
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="">Alla kategorier</option>
                  <option value="Technology">Teknik/IT</option>
                  <option value="Restaurant">Restaurang</option>
                  <option value="E-commerce">E-handel</option>
                  <option value="Consulting">Konsulting</option>
                  <option value="Construction">Bygg</option>
                  <option value="Marketing">Marknadsföring</option>
                </select>
                
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setPromotionFilter(e.target.value)}
                >
                  <option value="">Alla marknadsföringsstatus</option>
                  <option value="vip">🏆 VIP</option>
                  <option value="featured">⚡ Framhävda</option>
                  <option value="premium">⭐ Premium</option>
                  <option value="hot_sale">🔥 Hot Sale</option>
                  <option value="normal">Normal</option>
                </select>
                
                <select 
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Senaste först</option>
                  <option value="oldest">Äldsta först</option>
                  <option value="price_high">Högsta pris</option>
                  <option value="price_low">Lägsta pris</option>
                  <option value="views_high">Flest visningar</option>
                  <option value="inquiries_high">Flest förfrågningar</option>
                </select>
              </div>
            </div>

            {/* Deleted Listings Recovery */}
            {deletedListings.length > 0 && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Undo2 className="w-6 h-6 text-yellow-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-yellow-800">Återställning tillgänglig</h4>
                      <p className="text-sm text-yellow-700">{deletedListings.length} annonser har tagits bort nyligen</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {deletedListings.map(listing => (
                      <button
                        key={listing.id}
                        onClick={() => handleRestoreListing(listing.id)}
                        className="bg-yellow-200 hover:bg-yellow-300 text-yellow-800 px-3 py-2 rounded-lg font-medium transition-colors text-sm"
                      >
                        <Undo2 className="w-4 h-4 inline mr-1" />
                        Återställ {listing.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Results Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">
                  📋 Annonser ({filteredAndSortedListings.length} av {listings.length})
                </h3>
                <div className="text-sm text-gray-600">
                  Sorterat efter: <span className="font-medium">{
                    sortBy === 'newest' ? 'Senaste först' :
                    sortBy === 'oldest' ? 'Äldsta först' :
                    sortBy === 'price_high' ? 'Högsta pris' :
                    sortBy === 'price_low' ? 'Lägsta pris' :
                    sortBy === 'views_high' ? 'Flest visningar' :
                    'Flest förfrågningar'
                  }</span>
                </div>
              </div>
            </div>

            {/* Professional Listings Grid */}
            <div className="grid grid-cols-1 gap-6">
              {filteredAndSortedListings.length === 0 ? (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                  <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-medium text-gray-900 mb-2">Inga annonser hittades</h3>
                  <p className="text-gray-600">Prova att ändra dina sökkriterier eller filter</p>
                </div>
              ) : (
                filteredAndSortedListings.map((listing) => (
                  <div key={listing.id} className={`bg-white rounded-xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                    listing.status === 'PENDING' ? 'border-yellow-300 bg-yellow-50' : 
                    listing.promotionStatus === 'vip' ? 'border-purple-300' :
                    listing.promotionStatus === 'featured' ? 'border-blue-300' :
                    listing.promotionStatus === 'premium' ? 'border-yellow-300' :
                    listing.promotionStatus === 'hot_sale' ? 'border-red-300' :
                    'border-gray-200'
                  }`}>
                    <div className="p-6">
                      {/* Header with Status */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start space-x-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            listing.status === 'PENDING' ? 'bg-yellow-100' :
                            listing.status === 'ACTIVE' ? 'bg-green-100' :
                            'bg-gray-100'
                          }`}>
                            <Building2 className={`w-6 h-6 ${
                              listing.status === 'PENDING' ? 'text-yellow-600' :
                              listing.status === 'ACTIVE' ? 'text-green-600' :
                              'text-gray-600'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{listing.title}</h3>
                              {listing.promotionStatus && listing.promotionStatus !== 'normal' && (
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  listing.promotionStatus === 'vip' ? 'bg-purple-100 text-purple-800' :
                                  listing.promotionStatus === 'featured' ? 'bg-blue-100 text-blue-800' :
                                  listing.promotionStatus === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                                  listing.promotionStatus === 'hot_sale' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {listing.promotionStatus === 'vip' ? '👑 VIP' :
                                   listing.promotionStatus === 'featured' ? '⚡ Framhävd' :
                                   listing.promotionStatus === 'premium' ? '⭐ Premium' :
                                   listing.promotionStatus === 'hot_sale' ? '🔥 Hot Sale' :
                                   listing.promotionStatus}
                                </span>
                              )}
                              {listing.starred && (
                                <Star className="w-5 h-5 text-yellow-500 fill-current" />
                              )}
                            </div>
                            <p className="text-gray-600 mb-3">{listing.description}</p>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1" />
                                {listing.location}
                              </span>
                              <span className="flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(listing.createdAt)}
                              </span>
                              <span className="flex items-center">
                                <User className="w-4 h-4 mr-1" />
                                ID: {listing.id}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-col items-end space-y-2">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {listing.status === 'PENDING' ? '⏳ Väntar granskning' :
                             listing.status === 'ACTIVE' ? '✅ Aktiv' :
                             '❌ Avvisad'}
                          </span>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-green-600">{formatPrice(listing.price)}</div>
                            <div className="text-sm text-gray-500">{listing.category}</div>
                          </div>
                        </div>
                      </div>

                      {/* Performance Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{listing.views}</div>
                          <div className="text-xs text-gray-500">Visningar</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{listing.inquiries}</div>
                          <div className="text-xs text-gray-500">Förfrågningar</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{listing.reports}</div>
                          <div className="text-xs text-gray-500">Rapporter</div>
                        </div>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${
                            listing.riskScore <= 15 ? 'text-green-600' :
                            listing.riskScore <= 30 ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>{listing.riskScore}%</div>
                          <div className="text-xs text-gray-500">Risk</div>
                        </div>
                      </div>

                      {/* Seller Information */}
                      <div className="bg-blue-50 rounded-lg p-4 mb-6">
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          Säljare Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-600">Namn:</span>
                            <div className="font-medium">{listing.seller}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">E-post:</span>
                            <div className="font-medium">{listing.email}</div>
                          </div>
                          <div>
                            <span className="text-gray-600">Telefon:</span>
                            <div className="font-medium">{listing.phone}</div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-3">
                        {listing.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleApproveListing(listing.id)}
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Godkänn
                            </button>
                            <button
                              onClick={() => handleRejectListing(listing.id)}
                              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Avslå
                            </button>
                          </>
                        )}
                        
                        <button
                          onClick={() => handleViewListing(listing)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Visa Detaljer
                        </button>
                        
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === `promotion-${listing.id}` ? null : `promotion-${listing.id}`)}
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                          >
                            <Award className="w-4 h-4 mr-2" />
                            Promota Annons
                          </button>
                          {openDropdown === `promotion-${listing.id}` && (
                            <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-10">
                              <div className="p-4">
                                <h5 className="font-semibold text-gray-900 mb-3">Välj Marknadsföringspaket</h5>
                                <div className="space-y-2">
                                  <button
                                    onClick={() => {
                                      handleSetListingStatus(listing.id, 'vip');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left p-3 rounded-lg border border-purple-200 hover:bg-purple-50 transition-colors"
                                  >
                                    <div className="font-medium text-purple-800">👑 VIP Paket</div>
                                    <div className="text-sm text-gray-600">2,995 SEK - Högsta prioritet</div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSetListingStatus(listing.id, 'featured');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left p-3 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                                  >
                                    <div className="font-medium text-blue-800">⚡ Framhävd</div>
                                    <div className="text-sm text-gray-600">1,995 SEK - Framhävd placering</div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSetListingStatus(listing.id, 'premium');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left p-3 rounded-lg border border-yellow-200 hover:bg-yellow-50 transition-colors"
                                  >
                                    <div className="font-medium text-yellow-800">⭐ Premium</div>
                                    <div className="text-sm text-gray-600">995 SEK - Premium badge</div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSetListingStatus(listing.id, 'hot_sale');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left p-3 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                                  >
                                    <div className="font-medium text-red-800">🔥 Hot Sale</div>
                                    <div className="text-sm text-gray-600">Gratis - Brändheta annonser</div>
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleSetListingStatus(listing.id, 'normal');
                                      setOpenDropdown(null);
                                    }}
                                    className="w-full text-left p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                                  >
                                    <div className="font-medium text-gray-800">❌ Ta bort marknadsföring</div>
                                    <div className="text-sm text-gray-600">Normal status</div>
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <button
                          onClick={() => handleStarListing(listing.id)}
                          className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                            listing.starred 
                              ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                              : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                          }`}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          {listing.starred ? 'Ta bort stjärna' : 'Stjärnmärk'}
                        </button>
                        
                        <button
                          onClick={() => {
                            window.location.href = `mailto:${listing.email}?subject=Angående din annons: ${listing.title}&body=Hej ${listing.seller},%0D%0A%0D%0AJag kontaktar dig angående din annons "${listing.title}" på Hansa.%0D%0A%0D%0AMed vänliga hälsningar,%0D%0AWilli - Hansa Admin`;
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Kontakta Säljare
                        </button>
                        
                        <button
                          onClick={() => handleDeleteListing(listing.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Ta Bort
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Listing View Modal */}
            {viewingListing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Annonsdetaljer: {viewingListing.title}</h3>
                    <button
                      onClick={() => setViewingListing(null)}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Grundläggande Information</h4>
                        <div className="space-y-2">
                          <p><strong>Titel:</strong> {viewingListing.title}</p>
                          <p><strong>Pris:</strong> {viewingListing.price} SEK</p>
                          <p><strong>Kategori:</strong> {viewingListing.category}</p>
                          <p><strong>Plats:</strong> {viewingListing.location}</p>
                          <p><strong>Status:</strong> 
                            <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                              viewingListing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                              viewingListing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {viewingListing.status}
                            </span>
                          </p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Marknadsföring</h4>
                        <div className="space-y-2">
                          <p><strong>Stjärnmarkerad:</strong> {viewingListing.starred ? 'Ja' : 'Nej'}</p>
                          <p><strong>Promotion Status:</strong> {viewingListing.promotionStatus || 'Ingen'}</p>
                          <p><strong>Framhävd:</strong> {viewingListing.featured ? 'Ja' : 'Nej'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Säljare</h4>
                        <div className="space-y-2">
                          <p><strong>Namn:</strong> {viewingListing.seller}</p>
                          <p><strong>ID:</strong> {viewingListing.sellerId}</p>
                        </div>
                      </div>
                      
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-3">Statistik</h4>
                        <div className="space-y-2">
                          <p><strong>Visningar:</strong> {viewingListing.views}</p>
                          <p><strong>Skapad:</strong> {viewingListing.createdAt}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Beskrivning</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700">{viewingListing.description || 'Ingen beskrivning angiven'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-8">
                    <button
                      onClick={() => {
                        setViewingListing(null);
                        handleEditListing(viewingListing);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Redigera annons
                    </button>
                    <button
                      onClick={() => setViewingListing(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Stäng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Listing Edit Modal */}
            {editingListing && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-screen overflow-y-auto">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Redigera annons: {editingListing.title}</h3>
                    <button
                      onClick={handleCancelEdit}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Titel</label>
                      <input
                        type="text"
                        value={editingListing.title}
                        onChange={(e) => setEditingListing({...editingListing, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pris</label>
                      <input
                        type="text"
                        value={editingListing.price}
                        onChange={(e) => setEditingListing({...editingListing, price: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                      <input
                        type="text"
                        value={editingListing.category}
                        onChange={(e) => setEditingListing({...editingListing, category: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plats</label>
                      <input
                        type="text"
                        value={editingListing.location}
                        onChange={(e) => setEditingListing({...editingListing, location: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                      <select
                        value={editingListing.status}
                        onChange={(e) => setEditingListing({...editingListing, status: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="PENDING">Väntande</option>
                        <option value="ACTIVE">Aktiv</option>
                        <option value="REJECTED">Avvisad</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Promotion Status</label>
                      <select
                        value={editingListing.promotionStatus || 'normal'}
                        onChange={(e) => setEditingListing({...editingListing, promotionStatus: e.target.value})}
                        className="w-full border border-gray-300 rounded-md px-3 py-2"
                      >
                        <option value="normal">Normal</option>
                        <option value="hot_sale">Hot Sale</option>
                        <option value="premium">Premium</option>
                        <option value="featured">Framhävd</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Beskrivning</label>
                      <textarea
                        value={editingListing.description || ''}
                        onChange={(e) => setEditingListing({...editingListing, description: e.target.value})}
                        rows={4}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 resize-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingListing.starred}
                          onChange={(e) => setEditingListing({...editingListing, starred: e.target.checked})}
                          className="mr-2"
                        />
                        Stjärnmarkerad
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingListing.featured}
                          onChange={(e) => setEditingListing({...editingListing, featured: e.target.checked})}
                          className="mr-2"
                        />
                        Framhävd
                      </label>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 mt-6">
                    <button
                      onClick={handleCancelEdit}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={handleSaveListing}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Spara ändringar
                    </button>
                  </div>
                </div>
              </div>
            )}
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

        {/* Finance Tab with Escrow System */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Finansiell Hantering & Escrow</h2>
              <p className="text-gray-600">Hantera escrow-transaktioner och finansiell övervakning</p>
            </div>

            {/* Finance Stats */}
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
                  <Lock className="w-8 h-8 text-orange-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Escrow innehav</p>
                    <p className="text-2xl font-bold text-gray-900">{formatPrice(totalEscrowHeld)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Väntar godkännande</p>
                    <p className="text-2xl font-bold text-gray-900">{pendingEscrow.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center">
                  <Activity className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Transaktioner</p>
                    <p className="text-2xl font-bold text-gray-900">{escrowTransactions.length}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Escrow Transactions - Kompakt design */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Escrow Transaktioner</h3>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-600">
                      {pendingEscrow.length} väntar godkännande
                    </span>
                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                      {escrowTransactions.length} totalt
                    </span>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
                <div className="min-h-0">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Transaktion</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Belopp</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Parter</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Datum</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {escrowTransactions.map((transaction) => (
                      <tr key={transaction.id} className={`hover:bg-gray-50 ${transaction.status === 'PENDING_APPROVAL' ? 'bg-yellow-50' : ''}`}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center">
                            <CreditCard className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">#{transaction.id}</div>
                              <div className="text-xs text-gray-500">{transaction.listingTitle}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-base font-bold text-green-600">{formatPrice(transaction.amount)}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            <div className="text-xs text-gray-500">Köpare:</div>
                            <div className="font-medium">{transaction.buyer}</div>
                            <div className="text-xs text-gray-500 mt-1">Säljare:</div>
                            <div className="font-medium">{transaction.seller}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEscrowStatusColor(transaction.status)}`}>
                            {transaction.status === 'PENDING_APPROVAL' ? 'Väntar' :
                             transaction.status === 'APPROVED' ? 'Godkänd' :
                             transaction.status === 'RELEASED' ? 'Frisläppt' :
                             transaction.status === 'REFUNDED' ? 'Återbetald' : transaction.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-xs text-gray-900">
                            <div>{formatDate(transaction.createdAt)}</div>
                            {transaction.approvedAt && (
                              <div className="text-xs text-green-600">✓ {formatDate(transaction.approvedAt)}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {transaction.status === 'PENDING_APPROVAL' && (
                              <>
                                <button
                                  onClick={() => handleApproveEscrow(transaction.id)}
                                  className="inline-flex items-center px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700 transition-colors"
                                  title="Godkänn escrow-transaktion"
                                >
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Godkänn
                                </button>
                                <button
                                  onClick={() => handleRefundEscrow(transaction.id)}
                                  className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                  title="Återbetala till köpare"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Avslå
                                </button>
                              </>
                            )}
                            {transaction.status === 'APPROVED' && (
                              <>
                                <button
                                  onClick={() => handleReleaseEscrow(transaction.id)}
                                  className="inline-flex items-center px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
                                  title="Frisläpp medel till säljare"
                                >
                                  <Unlock className="w-3 h-3 mr-1" />
                                  Frisläpp
                                </button>
                                <button
                                  onClick={() => handleRefundEscrow(transaction.id)}
                                  className="inline-flex items-center px-2 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700 transition-colors"
                                  title="Återbetala till köpare"
                                >
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Återbetala
                                </button>
                              </>
                            )}
                            {(transaction.status === 'RELEASED' || transaction.status === 'REFUNDED') && (
                              <span className="text-sm text-gray-500">Genomförd</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            </div>

            {/* Escrow Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <Lock className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-blue-900">Escrow-systemet</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>Escrow-systemet håller köparens pengar säkert tills transaktionen är godkänd. Som admin kan du:</p>
                    <ul className="mt-2 space-y-1 list-disc list-inside">
                      <li><strong>Godkänn:</strong> Medel hålls säkert, väntar på leverans</li>
                      <li><strong>Frisläpp:</strong> Skicka pengar till säljaren efter genomförd affär</li>
                      <li><strong>Återbetala:</strong> Returnera pengar till köparen vid problem</li>
                      <li><strong>Övervaka:</strong> All transaktionshistorik loggas för säkerhet</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Marknadsföring & Betalningar</h2>
              <p className="text-gray-600">Hantera betalda annonsprioriteringar och framhävningar</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-yellow-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-800">Väntande förfrågningar</p>
                    <p className="text-2xl font-bold text-yellow-900">
                      {promotionRequests.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 rounded-lg p-6">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-800">Godkända idag</p>
                    <p className="text-2xl font-bold text-green-900">0</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-800">Intäkter denna månad</p>
                    <p className="text-2xl font-bold text-blue-900">0 SEK</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 rounded-lg p-6">
                <div className="flex items-center">
                  <Star className="w-8 h-8 text-purple-600" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-800">Aktiva kampanjer</p>
                    <p className="text-2xl font-bold text-purple-900">0</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotion Requests */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Betalningsförfrågningar</h3>
                <p className="text-sm text-gray-600">Granska och godkänn betalningar för annonsprioriteringar</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Annons
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Användare
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Typ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Belopp
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Åtgärder
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {promotionRequests.map((request) => (
                      <tr key={request.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{request.listingTitle}</div>
                            <div className="text-sm text-gray-500">ID: {request.listingId}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{request.userName}</div>
                          <div className="text-sm text-gray-500">{request.userId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.promotionType === 'premium' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {request.promotionType === 'premium' ? 'Premium' : 'Framhävd'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(request.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'pending' ? 'Väntande' :
                             request.status === 'approved' ? 'Godkänd' : 'Avvisad'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setPromotionRequests(prev => 
                                    prev.map(r => 
                                      r.id === request.id 
                                        ? { ...r, status: 'approved' }
                                        : r
                                    )
                                  );
                                  toast.success(`Betalning godkänd för ${request.listingTitle}`);
                                }}
                                className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs rounded-md hover:bg-green-700"
                              >
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Godkänn
                              </button>
                              <button
                                onClick={() => {
                                  setPromotionRequests(prev => 
                                    prev.map(r => 
                                      r.id === request.id 
                                        ? { ...r, status: 'rejected' }
                                        : r
                                    )
                                  );
                                  toast.error(`Betalning avvisad för ${request.listingTitle}`);
                                }}
                                className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs rounded-md hover:bg-red-700"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Avvisa
                              </button>
                            </>
                          )}
                          {request.status !== 'pending' && (
                            <span className="text-gray-500 text-xs">
                              {request.status === 'approved' ? 'Annons prioriterad' : 'Betalning återbetald'}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {promotionRequests.length === 0 && (
                <div className="text-center py-12">
                  <Star className="mx-auto h-16 w-16 text-gray-400" />
                  <h3 className="mt-4 text-lg font-medium text-gray-900">Inga förfrågningar</h3>
                  <p className="mt-2 text-sm text-gray-500">Det finns inga betalningsförfrågningar att granska just nu.</p>
                </div>
              )}
            </div>

            {/* All Listings Management */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Alla Annonser - Marknadsföring</h3>
                <p className="text-sm text-gray-600">Hantera promotion och marknadsföringsstatus för alla annonser</p>
              </div>
              
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Annons</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Marknadsföring</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statistik</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Åtgärder</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {listings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                              <div className="text-sm text-gray-500">{listing.category}</div>
                              <div className="text-xs text-gray-400">{listing.location}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              listing.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                              listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {listing.status}
                            </span>
                            <div className="text-xs text-gray-500">
                              {new Intl.NumberFormat('sv-SE', { style: 'currency', currency: 'SEK' }).format(listing.price)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            {listing.starred && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full mr-1">
                                <Star className="w-3 h-3 mr-1" />
                                Stjärnmarkerad
                              </span>
                            )}
                            {listing.promotionStatus && listing.promotionStatus !== 'normal' && (
                              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                listing.promotionStatus === 'hot_sale' ? 'bg-red-100 text-red-800' :
                                listing.promotionStatus === 'premium' ? 'bg-yellow-100 text-yellow-800' :
                                listing.promotionStatus === 'featured' ? 'bg-purple-100 text-purple-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {listing.promotionStatus === 'hot_sale' ? '🔥 Hot Sale' :
                                 listing.promotionStatus === 'premium' ? '⭐ Premium' :
                                 listing.promotionStatus === 'featured' ? '⚡ Framhävd' :
                                 listing.promotionStatus}
                              </span>
                            )}
                            {listing.featured && (
                              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full">
                                Utvald
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div>{listing.views} visningar</div>
                            <div className="text-xs text-gray-500">Risk: {listing.riskScore}%</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleStarListing(listing.id)}
                              className={`p-2 rounded ${listing.starred ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-100 text-gray-600'} hover:bg-opacity-80`}
                              title={listing.starred ? 'Ta bort stjärnmarkering' : 'Stjärnmarkera'}
                            >
                              <Star className="w-4 h-4" />
                            </button>
                            
                            <div className="relative">
                              <button
                                onClick={() => setOpenDropdown(openDropdown === `promo-${listing.id}` ? null : `promo-${listing.id}`)}
                                className="p-2 rounded bg-purple-100 text-purple-600 hover:bg-purple-200"
                                title="Marknadsföringsstatus"
                              >
                                <Award className="w-4 h-4" />
                              </button>
                              {openDropdown === `promo-${listing.id}` && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                                  <div className="py-1">
                                    <button
                                      onClick={() => {
                                        handleSetListingStatus(listing.id, 'hot_sale');
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-red-50"
                                    >
                                      🔥 Hot Sale
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleSetListingStatus(listing.id, 'premium');
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-yellow-50"
                                    >
                                      ⭐ Premium
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleSetListingStatus(listing.id, 'featured');
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-purple-50"
                                    >
                                      ⚡ Framhävd
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleSetListingStatus(listing.id, 'normal');
                                        setOpenDropdown(null);
                                      }}
                                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                    >
                                      ❌ Ta bort status
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleViewListing(listing)}
                              className="p-2 rounded bg-blue-100 text-blue-600 hover:bg-blue-200"
                              title="Visa detaljer"
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

            {/* URL-based Listing Promotion */}
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Snabb Annonsbefordran via URL</h3>
                <p className="text-sm text-gray-600">Klistra in en annons-URL för att snabbt tilldela badges och marknadsföringsstatus</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* URL Input Section */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Annons-URL</label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={listingUrl}
                          onChange={(e) => setListingUrl(e.target.value)}
                          placeholder="https://123hansa.se/listing/123"
                          className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={handleProcessListingUrl}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Ladda
                        </button>
                      </div>
                    </div>

                    {selectedPromotionListing && (
                      <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Laddad annons:</h4>
                        <div className="text-sm">
                          <p className="text-green-800"><strong>Titel:</strong> {selectedPromotionListing.title}</p>
                          <p className="text-green-700"><strong>ID:</strong> {selectedPromotionListing.id}</p>
                          <p className="text-green-700"><strong>Status:</strong> {selectedPromotionListing.status}</p>
                          <p className="text-green-700"><strong>Nuvarande badge:</strong> {selectedPromotionListing.promotionStatus || 'Ingen'}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Promotion Actions */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Tillgängliga badges:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleApplyPromotion('hot_sale')}
                        disabled={!selectedPromotionListing}
                        className="flex items-center justify-center px-4 py-3 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Award className="w-4 h-4 mr-2" />
                        Hot Sale
                      </button>
                      
                      <button
                        onClick={() => handleApplyPromotion('premium')}
                        disabled={!selectedPromotionListing}
                        className="flex items-center justify-center px-4 py-3 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Star className="w-4 h-4 mr-2" />
                        Premium
                      </button>
                      
                      <button
                        onClick={() => handleApplyPromotion('featured')}
                        disabled={!selectedPromotionListing}
                        className="flex items-center justify-center px-4 py-3 bg-purple-100 text-purple-800 rounded-lg hover:bg-purple-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Zap className="w-4 h-4 mr-2" />
                        Framhävd
                      </button>
                      
                      <button
                        onClick={() => handleApplyPromotion('normal')}
                        disabled={!selectedPromotionListing}
                        className="flex items-center justify-center px-4 py-3 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Ta bort badge
                      </button>
                    </div>
                    
                    {!selectedPromotionListing && (
                      <p className="text-sm text-gray-500 text-center mt-4">
                        Klistra in en annons-URL och klicka "Ladda" för att börja
                      </p>
                    )}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Allmänna inställningar</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plattformsnamn</label>
                    <input type="text" value="123Hansa" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Support e-post</label>
                    <input type="email" value="support@123hansa.se" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Escrow avgift (%)</label>
                    <input type="number" value="2.5" step="0.1" className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Säkerhetsinställningar</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Escrow-system</span>
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Aktiverat</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Automatisk verifiering</span>
                    <button className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm">Konfigura</button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Admin-notifieringar</span>
                    <button className="bg-green-100 text-green-800 px-3 py-1 rounded text-sm">Aktiverat</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Anteckningar & Minneslappar - Egen bred panel under alla tabs */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center">
              <StickyNote className="w-8 h-8 mr-4 text-blue-600" />
              Anteckningar & Minneslappar
            </h3>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 bg-gray-100 px-4 py-2 rounded-full font-medium">
                {notes.length} sparade anteckningar
              </span>
              <span className="text-xs text-gray-400">
                Synlig i alla admin-tabs
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add New Note - Full bredd på små skärmar */}
            <div className="lg:col-span-1 space-y-4">
              <label className="block text-lg font-semibold text-gray-800">Ny anteckning</label>
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Skriv en ny anteckning eller minneslappar..."
                rows={6}
                className="w-full text-base border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
              />
              <button
                onClick={handleAddNote}
                disabled={!newNote.trim()}
                className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-6 h-6 mr-3" />
                Spara anteckning
              </button>
            </div>

            {/* Notes List - Tar upp 2/3 av bredden */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold text-gray-800">Sparade anteckningar</h4>
                <span className="text-sm text-gray-500">Sorterat efter senast uppdaterad</span>
              </div>
              
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {notes.map((note) => (
                  <div key={note.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors shadow-sm">
                    {editingNote?.id === note.id ? (
                      <div className="space-y-4">
                        <textarea
                          value={editingNote.content}
                          onChange={(e) => setEditingNote({...editingNote, content: e.target.value})}
                          rows={5}
                          className="w-full text-base border border-gray-300 rounded-lg px-4 py-3 resize-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={handleSaveNote}
                            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors font-medium"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Spara ändringar
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg text-sm hover:bg-gray-700 transition-colors font-medium"
                          >
                            Avbryt
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-lg text-gray-900 leading-relaxed mb-3">{note.content}</p>
                            <div className="flex items-center mt-3 space-x-4">
                              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(note.category)}`}>
                                {note.category}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Calendar className="w-4 h-4 mr-1" />
                                {formatDate(note.updatedAt)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-6">
                            <button
                              onClick={() => handleEditNote(note)}
                              className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Redigera anteckning"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleDeleteNote(note.id)}
                              className="p-3 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Ta bort anteckning"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                {notes.length === 0 && (
                  <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <StickyNote className="mx-auto h-16 w-16 text-gray-400" />
                    <h3 className="mt-4 text-lg font-medium text-gray-900">Inga anteckningar än</h3>
                    <p className="mt-2 text-sm text-gray-500">Lägg till din första anteckning för att komma igång!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chat System */}
      <ChatSystem 
        currentUserId="admin_willi"
        currentUserName="Willi (Admin)"
        currentUserType="admin"
      />
    </div>
  );
};

export default AdvancedAdminPanel;