import React, { useState, useEffect, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuthStore } from '../../stores/authStore';
import type { AdminProfile } from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Building2,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Download,
  Settings,
  BarChart3,
  TrendingUp,
  DollarSign,
  Activity,
  UserCheck,
  AlertTriangle,
  Calendar,
  Globe,
  FileText,
  MapPin,
  Briefcase,
  ShoppingCart,
  MessageSquare,
  Star,
  HeartHandshake,
  Award,
  Clock,
  Shield,
  Zap,
  Phone,
  Mail,
  User,
  Timer,
  Archive,
  Send,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import EnhancedSupportChat from '../../components/admin/EnhancedSupportChat';
import { demoCampaigns, campaignCategories } from '../../data/crowdfundingData';
import type { Campaign } from '../../components/crowdfunding/CampaignCard';

// Types
interface AdminStats {
  totalUsers: number;
  activeListings: number;
  totalTransactions: number;
  totalRevenue: number;
  pendingApprovals: number;
  reportedListings: number;
}

interface AdminListing {
  id: string;
  title: string;
  category: string;
  price: number;
  seller: string;
  sellerId?: string;
  sellerEmail?: string;
  status: 'ACTIVE' | 'PENDING' | 'REJECTED' | 'SOLD';
  createdAt: string;
  views: number;
  reports: number;
  inquiries?: number;
  featured?: boolean;
  priority?: boolean;
  archived?: boolean;
  approvedAt?: string;
  rejectedAt?: string;
  featuredAt?: string;
  priorityAt?: string;
  archivedAt?: string;
  rejectionScheduledDeletion?: string; // ISO string for when rejected listing should be deleted
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  provider: string;
  joinedDate: string;
  listingsCount: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
  lastLogin: string;
  verified: boolean;
}

const AdminPanel: React.FC = () => {
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [listings, setListings] = useState<AdminListing[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pendingListings, setPendingListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [realTimeData, setRealTimeData] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(30000); // 30 seconds
  const [supportTickets, setSupportTickets] = useState<any[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [ticketResponse, setTicketResponse] = useState('');
  const [ticketFilter, setTicketFilter] = useState('all');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [financialData, setFinancialData] = useState<any>(null);
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedListings, setSelectedListings] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [listingFilter, setListingFilter] = useState('all');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState('');
  const [bulkOperationInProgress, setBulkOperationInProgress] = useState(false);
  const [adminInitialized, setAdminInitialized] = useState(false);
  const [showSupportChat, setShowSupportChat] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [selectedCampaigns, setSelectedCampaigns] = useState<string[]>([]);
  const [crowdfundingStats, setCrowdfundingStats] = useState<any>(null);
  const [selectedListing, setSelectedListing] = useState<AdminListing | null>(null);
  const [showListingModal, setShowListingModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showUserEditModal, setShowUserEditModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Delete listing function
  const handleDeleteListing = async (listingId: string) => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setListings(prev => prev.filter(listing => listing.id !== listingId));
      toast.success('Annonsen har tagits bort');
    } catch (error) {
      toast.error('Fel vid borttagning av annons');
    } finally {
      setLoading(false);
    }
  };

  // Customer notification service
  const sendCustomerNotification = async (listingId: string, sellerId: string, sellerEmail: string, notificationType: string, listingTitle: string) => {
    try {
      const notifications = {
        'approve': {
          title: '✅ Din annons har godkänts!',
          message: `Din annons "${listingTitle}" har godkänts och är nu aktiv på 123hansa.se. Kunder kan nu hitta och kontakta dig genom din annons.`,
          type: 'success'
        },
        'reject': {
          title: '❌ Din annons har avslås',
          message: `Din annons "${listingTitle}" har tyvärr avslås. Den kommer att tas bort från systemet inom 12 timmar. Kontakta support om du har frågor.`,
          type: 'error'
        },
        'feature': {
          title: '⭐ Din annons har markerats som utvald!',
          message: `Grattis! Din annons "${listingTitle}" har markerats som utvald och kommer att få extra synlighet på 123hansa.se.`,
          type: 'success'
        },
        'priority': {
          title: '🚀 Din annons har prioriterats!',
          message: `Din annons "${listingTitle}" har fått prioriterad status och kommer att visas högre upp i sökresultaten.`,
          type: 'success'
        },
        'archive': {
          title: '📦 Din annons har arkiverats',
          message: `Din annons "${listingTitle}" har arkiverats och är inte längre synlig för kunder. Du kan återaktivera den när som helst.`,
          type: 'info'
        }
      };

      const notification = notifications[notificationType];
      if (!notification) return;

      // In a real application, this would send to your notification service
      // For now, we'll simulate the API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log(`Notification sent to ${sellerEmail}:`, notification);
      
      // You could also send email notification here
      // await sendEmail(sellerEmail, notification.title, notification.message);
      
    } catch (error) {
      console.error('Failed to send customer notification:', error);
    }
  };

  // Auto-delete rejected listings after 12 hours
  const scheduleRejectedListingDeletion = (listingId: string) => {
    const deletionTime = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
    
    // In a real application, you would schedule this in your backend
    // For demonstration, we'll use setTimeout (note: this won't survive page refresh)
    setTimeout(() => {
      setListings(prev => {
        const updatedListings = prev.filter(listing => listing.id !== listingId);
        console.log(`Auto-deleted rejected listing ${listingId}`);
        return updatedListings;
      });
    }, 12 * 60 * 60 * 1000); // 12 hours
    
    return deletionTime.toISOString();
  };

  // Process rejected listings cleanup on load
  useEffect(() => {
    const cleanupRejectedListings = () => {
      const now = new Date();
      setListings(prev => prev.filter(listing => {
        if (listing.status === 'REJECTED' && listing.rejectionScheduledDeletion) {
          const scheduledTime = new Date(listing.rejectionScheduledDeletion);
          if (now >= scheduledTime) {
            console.log(`Cleaning up expired rejected listing: ${listing.id}`);
            return false; // Remove from listings
          }
        }
        return true; // Keep listing
      }));
    };

    // Run cleanup on component mount
    cleanupRejectedListings();
    
    // Set up interval to check for expired rejected listings every hour
    const interval = setInterval(cleanupRejectedListings, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Development admin auto-login
  useEffect(() => {
    if (!user && !adminInitialized) {
      // Create mock admin user for development
      const mockAdminUser = {
        id: 'admin-dev-001',
        email: 'willi@admin.com',
        name: 'willi',
        firstName: 'Willi',
        lastName: 'Admin',
        country: 'SE' as const,
        language: 'sv' as const,
        role: 'ADMIN' as const,
        verificationLevel: 'BANKID' as const,
        isEmailVerified: true,
        createdAt: new Date().toISOString(),
        adminProfile: {
          id: 'admin-profile-001',
          role: 'SUPER_ADMIN' as const,
          permissions: { all: true },
          isActive: true
        }
      };
      
      // Set the mock user in auth store manually for development
      setUser(mockAdminUser);
      setAdminInitialized(true);
      toast.success('Admin access granted (Development Mode)');
      return;
    }
    
    // Check admin access - allow both email and username 'willi'
    if (user && !(user.email === 'william.krakic@gmail.com' || user.name === 'willi' || user.email === 'willi' || user.email === 'willi@admin.com' || user.role === 'ADMIN')) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
  }, [user, navigate, setUser, adminInitialized]);

  // For development, always allow access if we have any user
  const hasAdminAccess = user && (
    user.email === 'william.krakic@gmail.com' || 
    user.name === 'willi' || 
    user.email === 'willi' || 
    user.email === 'willi@admin.com' ||
    user.role === 'ADMIN'
  );

  // Prevent rendering if not admin (but allow development access)
  if (!hasAdminAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Admin Panel Access</h2>
          <p className="text-gray-600 mb-4">Loading admin interface...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  // Load data from API and mock data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Fetch pending listings from API
        const pendingResponse = await fetch('/api/admin/pending-listings');
        if (pendingResponse.ok) {
          const pendingData = await pendingResponse.json();
          setPendingListings(pendingData.data);
        }
      } catch (error) {
        console.error('Error fetching pending listings:', error);
      }

      // Load mock data
      setStats({
        totalUsers: 1247,
        activeListings: 89,
        totalTransactions: 156,
        totalRevenue: 45600000,
        pendingApprovals: pendingListings.length || 12,
        reportedListings: 3
      });

      setListings([
        {
          id: 'comp-001',
          title: 'TechStartup AB - AI Betalningslösningar',
          category: 'companies',
          price: 12500000,
          seller: 'Magnus Eriksson',
          sellerId: 'user-001',
          sellerEmail: 'magnus@techstartup.se',
          status: 'ACTIVE',
          createdAt: '2024-06-20T10:00:00Z',
          views: 247,
          reports: 0,
          inquiries: 23,
          featured: true,
          priority: false,
          archived: false
        },
        {
          id: 'ecom-001',
          title: 'NordicHome.se - Premium Heminredning E-handel',
          category: 'ecommerce',
          price: 4500000,
          seller: 'Emma Johansson',
          sellerId: 'user-002',
          sellerEmail: 'emma@nordichome.se',
          status: 'ACTIVE',
          createdAt: '2024-06-19T14:30:00Z',
          views: 156,
          reports: 0,
          inquiries: 12,
          featured: false,
          priority: true,
          archived: false
        },
        {
          id: 'domain-001',
          title: 'Swedish.com - Premium Global Domain',
          category: 'domains',
          price: 850000,
          seller: 'International Domain Holdings',
          sellerId: 'user-004',
          sellerEmail: 'contact@domainholdings.com',
          status: 'PENDING',
          createdAt: '2024-06-21T09:15:00Z',
          views: 203,
          reports: 0,
          inquiries: 8,
          featured: false,
          priority: false,
          archived: false
        },
        {
          id: 'social-001',
          title: '@SvenskMode - 180k följare Instagram Modekonto',
          category: 'social',
          price: 650000,
          seller: 'Sofia Andersson',
          sellerId: 'user-003',
          sellerEmail: 'sofia@svenskmode.se',
          status: 'ACTIVE',
          createdAt: '2024-06-17T11:45:00Z',
          views: 167,
          reports: 1,
          inquiries: 5,
          featured: false,
          priority: false,
          archived: false
        }
      ]);

      setUsers([
        {
          id: 'user-001',
          name: 'Magnus Eriksson',
          email: 'magnus@techstartup.se',
          provider: 'LINKEDIN',
          joinedDate: '2019-01-15',
          listingsCount: 3,
          status: 'ACTIVE',
          lastLogin: '2024-06-25T10:30:00Z',
          verified: true
        },
        {
          id: 'user-002',
          name: 'Emma Johansson',
          email: 'emma@nordichome.se',
          provider: 'GOOGLE',
          joinedDate: '2020-05-12',
          listingsCount: 1,
          status: 'ACTIVE',
          lastLogin: '2024-06-24T16:45:00Z',
          verified: true
        },
        {
          id: 'user-003',
          name: 'Sofia Andersson',
          email: 'sofia@svenskmode.se',
          provider: 'FACEBOOK',
          joinedDate: '2020-11-05',
          listingsCount: 2,
          status: 'ACTIVE',
          lastLogin: '2024-06-25T08:20:00Z',
          verified: true
        }
      ]);

      // Load mock support tickets
      setSupportTickets([
        {
          id: 'ticket-001',
          subject: 'Problem med betalning',
          description: 'Jag kan inte slutföra betalningen för min annons. Får felmeddelande 400.',
          status: 'open',
          priority: 'high',
          category: 'payment',
          user: {
            name: 'Anna Svensson',
            email: 'anna@example.se',
            id: 'user-123'
          },
          assignedTo: null,
          createdAt: '2024-06-26T08:30:00Z',
          updatedAt: '2024-06-26T08:30:00Z',
          responses: []
        },
        {
          id: 'ticket-002',
          subject: 'Fråga om annonsgodkännande',
          description: 'Min annons har varit under granskning i 3 dagar. När kommer den att godkännas?',
          status: 'in_progress',
          priority: 'medium',
          category: 'listing',
          user: {
            name: 'Erik Johansson', 
            email: 'erik@techstartup.se',
            id: 'user-456'
          },
          assignedTo: 'admin-001',
          createdAt: '2024-06-24T10:15:00Z',
          updatedAt: '2024-06-25T14:20:00Z',
          responses: [
            {
              id: 'resp-001',
              message: 'Hej Erik! Vi tittar på din annons och kommer att ge svar inom 24 timmar.',
              author: 'Support Team',
              timestamp: '2024-06-25T14:20:00Z',
              isInternal: false
            }
          ]
        },
        {
          id: 'ticket-003',
          subject: 'Kontoinformation uppdatering',
          description: 'Jag behöver hjälp med att uppdatera min kontoinformation och betalningsmetod.',
          status: 'resolved',
          priority: 'low',
          category: 'account',
          user: {
            name: 'Maria Lindgren',
            email: 'maria@design.se', 
            id: 'user-789'
          },
          assignedTo: 'admin-002',
          createdAt: '2024-06-23T09:00:00Z',
          updatedAt: '2024-06-23T16:45:00Z',
          responses: [
            {
              id: 'resp-002',
              message: 'Hej Maria! Du kan uppdatera din kontoinformation under "Mitt konto" -> "Inställningar".',
              author: 'Support Team',
              timestamp: '2024-06-23T11:30:00Z',
              isInternal: false
            },
            {
              id: 'resp-003',
              message: 'Tack så mycket! Det fungerade perfekt.',
              author: 'Maria Lindgren',
              timestamp: '2024-06-23T16:45:00Z',
              isInternal: false
            }
          ]
        }
      ]);

      // Load mock financial data
      setTransactions([
        {
          id: 'txn-001',
          type: 'listing_fee',
          amount: 5000,
          currency: 'SEK',
          status: 'completed',
          user: {
            name: 'Anna Svensson',
            email: 'anna@example.se',
            id: 'user-123'
          },
          listing: {
            title: 'TechStartup AB - SaaS Platform',
            id: 'listing-001'
          },
          paymentMethod: 'card',
          processingFee: 150,
          netAmount: 4850,
          createdAt: '2024-06-26T10:30:00Z',
          completedAt: '2024-06-26T10:31:00Z'
        },
        {
          id: 'txn-002',
          type: 'sale_commission',
          amount: 250000,
          currency: 'SEK',
          status: 'pending_payout',
          user: {
            name: 'Erik Johansson',
            email: 'erik@techstartup.se',
            id: 'user-456'
          },
          listing: {
            title: 'E-commerce Store - Fashion',
            id: 'listing-002'
          },
          paymentMethod: 'bank_transfer',
          processingFee: 7500,
          netAmount: 242500,
          escrowReleaseDate: '2024-06-30T00:00:00Z',
          createdAt: '2024-06-24T14:20:00Z'
        },
        {
          id: 'txn-003',
          type: 'refund',
          amount: -15000,
          currency: 'SEK',
          status: 'completed',
          user: {
            name: 'Maria Lindgren',
            email: 'maria@design.se',
            id: 'user-789'
          },
          listing: {
            title: 'Design Agency Partnership',
            id: 'listing-003'
          },
          paymentMethod: 'card',
          processingFee: -450,
          netAmount: -14550,
          reason: 'Listing cancelled by seller',
          createdAt: '2024-06-23T09:15:00Z',
          completedAt: '2024-06-23T09:20:00Z'
        }
      ]);

      setFinancialData({
        totalRevenue: 2456780,
        monthlyRevenue: 156420,
        pendingPayouts: 485200,
        escrowBalance: 1247800,
        processingFees: 28450,
        refundsIssued: 45600,
        averageTransactionValue: 125000,
        totalTransactions: 1247,
        conversionRate: 3.2
      });

      // Load crowdfunding data
      setCampaigns(demoCampaigns.map(campaign => ({
        ...campaign,
        status: campaign.currentAmount >= campaign.fundingGoal ? 'FUNDED' : 
                campaign.daysLeft <= 7 ? 'URGENT' : 'ACTIVE',
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        adminNotes: '',
        approved: true,
        featured: campaign.featured || false
      })));

      // Calculate crowdfunding statistics
      const totalCampaigns = demoCampaigns.length;
      const activeCampaigns = demoCampaigns.filter(c => c.daysLeft > 0).length;
      const fundedCampaigns = demoCampaigns.filter(c => c.currentAmount >= c.fundingGoal).length;
      const totalRaised = demoCampaigns.reduce((sum, c) => sum + c.currentAmount, 0);
      const totalBackers = demoCampaigns.reduce((sum, c) => sum + c.backers, 0);
      const averageFunding = totalRaised / totalCampaigns;

      setCrowdfundingStats({
        totalCampaigns,
        activeCampaigns,
        fundedCampaigns,
        totalRaised,
        totalBackers,
        averageFunding,
        successRate: Math.round((fundedCampaigns / totalCampaigns) * 100),
        pendingApproval: Math.floor(Math.random() * 5) + 2,
        totalFees: totalRaised * 0.05, // 5% platform fee
        monthlyGrowth: 23.5
      });

      setLoading(false);
    };

    loadData();
  }, []);

  // Real-time data fetching
  const fetchRealTimeData = useCallback(async () => {
    try {
      const [dashboardResponse, activityResponse] = await Promise.all([
        fetch('/api/admin/dashboard/stats'),
        fetch('/api/admin/dashboard/activity')
      ]);
      
      if (dashboardResponse.ok) {
        const dashboardData = await dashboardResponse.json();
        setStats(prevStats => ({
          ...prevStats,
          ...dashboardData.data
        }));
      }
      
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRealTimeData(activityData.data);
      }
    } catch (error) {
      console.error('Error fetching real-time data:', error);
    }
  }, []);

  // Set up real-time data polling
  useEffect(() => {
    const interval = setInterval(fetchRealTimeData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchRealTimeData, refreshInterval]);

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}M SEK`;
    }
    return `${(price / 1000).toFixed(0)}k SEK`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };

  const getStatusColor = (status: string) => {
    const colors = {
      ACTIVE: 'bg-green-100 text-green-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      REJECTED: 'bg-red-100 text-red-800',
      SOLD: 'bg-blue-100 text-blue-800',
      SUSPENDED: 'bg-orange-100 text-orange-800',
      BANNED: 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      companies: Building2,
      ecommerce: ShoppingCart,
      domains: Globe,
      content: FileText,
      social: Users,
      affiliate: TrendingUp,
      digital: Building2,
      documents: FileText,
      properties: MapPin,
      services: Briefcase
    };
    const IconComponent = icons[category as keyof typeof icons] || Building2;
    return <IconComponent className="w-4 h-4" />;
  };

  const handleApprove = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'APPROVE', adminNotes: 'Approved by admin' })
      });
      
      if (response.ok) {
        setPendingListings(prev => prev.filter(listing => listing.id !== listingId));
        toast.success('Annons godkänd och publicerad!');
      }
    } catch (error) {
      toast.error('Kunde inte godkänna annons');
    }
  };

  const handleReject = async (listingId: string) => {
    try {
      const response = await fetch(`/api/admin/listings/${listingId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'REJECT', adminNotes: 'Rejected by admin' })
      });
      
      if (response.ok) {
        setPendingListings(prev => prev.map(listing => 
          listing.id === listingId ? { ...listing, status: 'REJECTED' } : listing
        ));
        toast.success('Annons avslagen!');
      }
    } catch (error) {
      toast.error('Kunde inte avslå annons');
    }
  };

  const handleSuspendUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: 'SUSPENDED' as const } : user
    ));
    toast.success('Användare avstängd!');
  };

  // Support Ticket Functions
  const handleTicketResponse = async (ticketId: string) => {
    if (!ticketResponse.trim()) return;
    
    const newResponse = {
      id: `resp-${Date.now()}`,
      message: ticketResponse,
      author: 'Support Team',
      timestamp: new Date().toISOString(),
      isInternal: false
    };
    
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { 
            ...ticket, 
            responses: [...ticket.responses, newResponse],
            status: 'in_progress',
            updatedAt: new Date().toISOString()
          }
        : ticket
    ));
    
    setTicketResponse('');
    toast.success('Svar skickat!');
  };

  const handleTicketStatusChange = (ticketId: string, newStatus: string) => {
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, status: newStatus, updatedAt: new Date().toISOString() }
        : ticket
    ));
    toast.success(`Ticket status uppdaterad till ${newStatus}`);
  };

  const handleAssignTicket = (ticketId: string, adminId: string) => {
    setSupportTickets(prev => prev.map(ticket => 
      ticket.id === ticketId 
        ? { ...ticket, assignedTo: adminId, updatedAt: new Date().toISOString() }
        : ticket
    ));
    toast.success('Ticket tilldelad!');
  };

  const filteredTickets = supportTickets.filter(ticket => {
    if (ticketFilter === 'all') return true;
    return ticket.status === ticketFilter;
  });

  const getTicketPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTicketStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in_progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  // Financial Management Functions
  const getTransactionStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'pending_payout': return 'text-blue-600 bg-blue-100';
      case 'failed': return 'text-red-600 bg-red-100';
      case 'refunded': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getTransactionTypeIcon = (type: string) => {
    switch (type) {
      case 'listing_fee': return <Building2 className="w-4 h-4" />;
      case 'sale_commission': return <TrendingUp className="w-4 h-4" />;
      case 'refund': return <XCircle className="w-4 h-4" />;
      case 'payout': return <DollarSign className="w-4 h-4" />;
      default: return <Activity className="w-4 h-4" />;
    }
  };

  const handleProcessPayout = (transactionId: string) => {
    setTransactions(prev => prev.map(txn => 
      txn.id === transactionId 
        ? { ...txn, status: 'completed', completedAt: new Date().toISOString() }
        : txn
    ));
    toast.success('Utbetalning genomförd!');
  };

  const handleRefundTransaction = (transactionId: string) => {
    setTransactions(prev => prev.map(txn => 
      txn.id === transactionId 
        ? { ...txn, status: 'refunded', completedAt: new Date().toISOString() }
        : txn
    ));
    toast.success('Återbetalning genomförd!');
  };

  const filteredTransactions = transactions.filter(txn => {
    if (paymentFilter === 'all') return true;
    return txn.status === paymentFilter;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sv-SE', {
      style: 'currency',
      currency: 'SEK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Bulk Operations Functions
  const handleSelectListing = (listingId: string) => {
    setSelectedListings(prev => 
      prev.includes(listingId) 
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleSelectAllListings = () => {
    const filteredListingIds = allFilteredListings.map(listing => listing.id);
    setSelectedListings(prev => 
      prev.length === filteredListingIds.length 
        ? [] 
        : filteredListingIds
    );
  };

  const initiateQuickAction = (action: string) => {
    if (!action || selectedListings.length === 0) {
      toast.error('Välj åtminstone en annons först');
      return;
    }

    // Destructive actions require confirmation
    if (['delete', 'reject'].includes(action)) {
      setPendingBulkAction(action);
      setShowConfirmDialog(true);
    } else {
      setBulkAction(action);
      handleBulkAction(action);
    }
  };

  const handleBulkAction = async (actionType?: string) => {
    const action = actionType || bulkAction;
    if (!action || selectedListings.length === 0) return;
    
    setBulkOperationInProgress(true);
    
    try {
      // Get selected listings data for notifications
      const selectedListingsData = listings.filter(listing => selectedListings.includes(listing.id));
      
      // Simulate API delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      switch (action) {
        case 'approve':
          setListings(prev => prev.map(listing => 
            selectedListings.includes(listing.id) 
              ? { ...listing, status: 'ACTIVE' as const, approvedAt: new Date().toISOString() }
              : listing
          ));
          
          // Send notifications to customers
          for (const listing of selectedListingsData) {
            if (listing.sellerId && listing.sellerEmail) {
              await sendCustomerNotification(
                listing.id,
                listing.sellerId,
                listing.sellerEmail,
                'approve',
                listing.title
              );
            }
          }
          
          toast.success(`✅ ${selectedListings.length} annonser godkända! Kunder har notifierats.`);
          break;
          
        case 'reject':
          setListings(prev => prev.map(listing => {
            if (selectedListings.includes(listing.id)) {
              const scheduledDeletion = scheduleRejectedListingDeletion(listing.id);
              return { 
                ...listing, 
                status: 'REJECTED' as const, 
                rejectedAt: new Date().toISOString(),
                rejectionScheduledDeletion: scheduledDeletion
              };
            }
            return listing;
          }));
          
          // Send notifications to customers
          for (const listing of selectedListingsData) {
            if (listing.sellerId && listing.sellerEmail) {
              await sendCustomerNotification(
                listing.id,
                listing.sellerId,
                listing.sellerEmail,
                'reject',
                listing.title
              );
            }
          }
          
          toast.success(`❌ ${selectedListings.length} annonser avslagna! Kunder har notifierats. Raderas automatiskt om 12h.`);
          break;
          
        case 'feature':
          setListings(prev => prev.map(listing => 
            selectedListings.includes(listing.id) 
              ? { ...listing, featured: true, featuredAt: new Date().toISOString() }
              : listing
          ));
          
          // Send notifications to customers
          for (const listing of selectedListingsData) {
            if (listing.sellerId && listing.sellerEmail) {
              await sendCustomerNotification(
                listing.id,
                listing.sellerId,
                listing.sellerEmail,
                'feature',
                listing.title
              );
            }
          }
          
          toast.success(`⭐ ${selectedListings.length} annonser markerade som utvalda! Kunder har notifierats.`);
          break;
          
        case 'unfeature':
          setListings(prev => prev.map(listing => 
            selectedListings.includes(listing.id) 
              ? { ...listing, featured: false, featuredAt: undefined }
              : listing
          ));
          toast.success(`📝 ${selectedListings.length} annonser avmarkerade som utvalda!`);
          break;
          
        case 'priority':
          setListings(prev => prev.map(listing => 
            selectedListings.includes(listing.id) 
              ? { ...listing, priority: true, priorityAt: new Date().toISOString() }
              : listing
          ));
          
          // Send notifications to customers
          for (const listing of selectedListingsData) {
            if (listing.sellerId && listing.sellerEmail) {
              await sendCustomerNotification(
                listing.id,
                listing.sellerId,
                listing.sellerEmail,
                'priority',
                listing.title
              );
            }
          }
          
          toast.success(`🚀 ${selectedListings.length} annonser prioriterade! Kunder har notifierats.`);
          break;
          
        case 'archive':
          setListings(prev => prev.map(listing => 
            selectedListings.includes(listing.id) 
              ? { ...listing, archived: true, archivedAt: new Date().toISOString() }
              : listing
          ));
          
          // Send notifications to customers
          for (const listing of selectedListingsData) {
            if (listing.sellerId && listing.sellerEmail) {
              await sendCustomerNotification(
                listing.id,
                listing.sellerId,
                listing.sellerEmail,
                'archive',
                listing.title
              );
            }
          }
          
          toast.success(`📦 ${selectedListings.length} annonser arkiverade! Kunder har notifierats.`);
          break;
          
        case 'delete':
          setListings(prev => prev.filter(listing => !selectedListings.includes(listing.id)));
          toast.success(`🗑️ ${selectedListings.length} annonser permanent borttagna!`);
          break;
          
        case 'notify_sellers':
          // Send custom notifications to sellers
          for (const listing of selectedListingsData) {
            if (listing.sellerId && listing.sellerEmail) {
              // This would normally be a custom notification system
              console.log(`Manual notification sent to ${listing.sellerEmail} for listing ${listing.title}`);
            }
          }
          toast.success(`📧 Notifikationer skickade till ${selectedListings.length} säljare!`);
          break;
          
        case 'export':
          // Simulate data export
          const selectedData = listings.filter(listing => selectedListings.includes(listing.id));
          const exportData = JSON.stringify(selectedData, null, 2);
          const blob = new Blob([exportData], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `selected_listings_${new Date().toISOString().split('T')[0]}.json`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          toast.success(`📊 ${selectedListings.length} annonser exporterade!`);
          break;
          
        default:
          toast.error('Okänd åtgärd');
          return;
      }
      
      // Update stats after bulk operation
      setTimeout(() => {
        setStats(prev => {
          const updatedListings = listings.filter(l => l.status !== 'REJECTED' || (l.rejectionScheduledDeletion && new Date(l.rejectionScheduledDeletion) > new Date()));
          return {
            ...prev,
            pendingApprovals: updatedListings.filter(l => l.status === 'PENDING').length,
            activeListings: updatedListings.filter(l => l.status === 'ACTIVE').length,
            reportedListings: updatedListings.filter(l => l.reports && l.reports > 0).length
          };
        });
      }, 1500);
      
      setSelectedListings([]);
      setBulkAction('');
      setShowConfirmDialog(false);
      setPendingBulkAction('');
      
    } catch (error) {
      console.error('Bulk operation failed:', error);
      toast.error('Masshantering misslyckades. Försök igen.');
    } finally {
      setBulkOperationInProgress(false);
    }
  };

  const confirmBulkAction = () => {
    setBulkAction(pendingBulkAction);
    handleBulkAction(pendingBulkAction);
  };

  const cancelBulkAction = () => {
    setShowConfirmDialog(false);
    setPendingBulkAction('');
  };

  // Quick Actions for specific scenarios
  const quickApproveAll = () => {
    const pendingListings = allFilteredListings.filter(l => l.status === 'PENDING').map(l => l.id);
    setSelectedListings(pendingListings);
    setTimeout(() => initiateQuickAction('approve'), 100);
  };

  const quickRejectReported = () => {
    const reportedListings = allFilteredListings.filter(l => l.reports && l.reports > 0).map(l => l.id);
    setSelectedListings(reportedListings);
    setTimeout(() => initiateQuickAction('reject'), 100);
  };

  const quickFeatureHighPerforming = () => {
    const highPerformingListings = allFilteredListings.filter(l => l.views > 100 && l.inquiries > 10).map(l => l.id);
    setSelectedListings(highPerformingListings);
    setTimeout(() => initiateQuickAction('feature'), 100);
  };

  const allFilteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.seller.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = listingFilter === 'all' || listing.status === listingFilter;
    return matchesSearch && matchesFilter;
  });

  // Pagination calculations
  const totalPages = Math.ceil(allFilteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const filteredListings = allFilteredListings.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, listingFilter]);

  const rejectedListings = listings.filter(listing => listing.status === 'REJECTED');
  const rejectedCount = rejectedListings.length;
  const rejectedScheduledForDeletion = rejectedListings.filter(l => l.rejectionScheduledDeletion).length;

  const getListingStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'PENDING': return 'text-yellow-600 bg-yellow-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'SOLD': return 'text-purple-600 bg-purple-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getRiskScore = (listing: any) => {
    let score = 0;
    if (listing.reports > 0) score += listing.reports * 20;
    if (listing.price < 10000) score += 10;
    if (listing.views < 50) score += 15;
    return Math.min(score, 100);
  };

  const getRiskColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-100';
    if (score >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Laddar admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Admin Panel - 123hansa</title>
        <meta name="description" content="Administrera användare, annonser och transaktioner på 123hansa." />
      </Helmet>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <Settings className="w-6 h-6 text-blue-600 mr-3" />
                <h1 className="text-xl font-bold text-gray-900">123hansa CMS</h1>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.adminProfile?.role} - {user.firstName} {user.lastName}
                </span>
                <span className="text-sm text-gray-500">|</span>
                <span className="text-sm text-gray-600">Senast uppdaterad: {formatDate(new Date().toISOString())}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex space-x-8">
              {[
                { id: 'overview', name: 'Dashboard', icon: BarChart3, roles: ['SUPER_ADMIN', 'CONTENT_MODERATOR', 'CUSTOMER_SUPPORT', 'FINANCIAL_ADMIN', 'ANALYTICS_TEAM'] },
                { id: 'listings', name: 'Moderation', icon: Building2, roles: ['SUPER_ADMIN', 'CONTENT_MODERATOR'] },
                { id: 'users', name: 'Användare', icon: Users, roles: ['SUPER_ADMIN'] },
                { id: 'crowdfunding', name: 'Crowdfunding', icon: TrendingUp, roles: ['SUPER_ADMIN', 'CONTENT_MODERATOR'] },
                { id: 'support', name: 'Support', icon: MessageSquare, roles: ['SUPER_ADMIN', 'CUSTOMER_SUPPORT'] },
                { id: 'settings', name: 'Inställningar', icon: Settings, roles: ['SUPER_ADMIN'] }
              ].filter(tab => tab.roles.includes(user.adminProfile?.role || '')).map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center px-3 py-4 text-sm font-medium border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <IconComponent className="w-4 h-4 mr-2" />
                    {tab.name}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Dashboard Header with Controls */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Dashboard Översikt</h2>
                <div className="flex items-center space-x-3">
                  <select 
                    value={refreshInterval} 
                    onChange={(e) => setRefreshInterval(Number(e.target.value))}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value={10000}>10s</option>
                    <option value={30000}>30s</option>
                    <option value={60000}>1min</option>
                    <option value={300000}>5min</option>
                  </select>
                  <button 
                    onClick={fetchRealTimeData}
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                  >
                    <Activity className="w-4 h-4 mr-1" />
                    Uppdatera nu
                  </button>
                </div>
              </div>
              
              {/* Stats Cards with Real-time Updates */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totala användare</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers.toLocaleString('sv-SE')}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Building2 className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktiva annonser</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.activeListings}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total omsättning</p>
                      <p className="text-2xl font-bold text-gray-900">{formatPrice(stats?.totalRevenue || 0)}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Transaktioner</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.totalTransactions}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Väntar godkännande</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.pendingApprovals}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Rapporterade annonser</p>
                      <p className="text-2xl font-bold text-gray-900">{stats?.reportedListings}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Real-time Activity */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Live aktivitet</h3>
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                      <span className="text-xs text-gray-500">Uppdateras var {refreshInterval/1000}s</span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {realTimeData?.recentActivity ? realTimeData.recentActivity.map((activity: any, index: number) => (
                      <div key={index} className="flex items-center">
                        <UserCheck className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-sm text-gray-700">{activity.description}</span>
                        <span className="ml-auto text-xs text-gray-500">{activity.timeAgo}</span>
                      </div>
                    )) : (
                      <>
                        <div className="flex items-center">
                          <UserCheck className="w-5 h-5 text-green-500 mr-3" />
                          <span className="text-sm text-gray-700">Ny användare registrerad: Emma Johansson</span>
                          <span className="ml-auto text-xs text-gray-500">2 timmar sedan</span>
                        </div>
                        <div className="flex items-center">
                          <Building2 className="w-5 h-5 text-blue-500 mr-3" />
                          <span className="text-sm text-gray-700">Ny annons skapad: TechStartup AB</span>
                          <span className="ml-auto text-xs text-gray-500">4 timmar sedan</span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="w-5 h-5 text-purple-500 mr-3" />
                          <span className="text-sm text-gray-700">Transaktion genomförd: 5.8M SEK</span>
                          <span className="ml-auto text-xs text-gray-500">1 dag sedan</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              {/* System Health Monitor */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">System hälsa</h3>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4">
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
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time</span>
                      <span className="text-sm font-medium text-gray-900">&lt; 100ms</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Listings Tab with Bulk Operations */}
          {activeTab === 'listings' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Content Moderation</h2>
                <div className="flex items-center space-x-3">
                  <select 
                    value={listingFilter} 
                    onChange={(e) => setListingFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">Alla status</option>
                    <option value="PENDING">Väntar granskning</option>
                    <option value="ACTIVE">Aktiva</option>
                    <option value="REJECTED">Avslagna</option>
                    <option value="SOLD">Sålda</option>
                  </select>
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
                </div>
              </div>

              {/* Enhanced Snabbåtgärder & Masshantering Section */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">🚀 Snabbåtgärder & Masshantering</h3>
                  <div className="flex items-center space-x-2">
                    {bulkOperationInProgress && (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span className="text-sm">Bearbetar...</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <button
                    onClick={quickApproveAll}
                    disabled={bulkOperationInProgress || allFilteredListings.filter(l => l.status === 'PENDING').length === 0}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Godkänn alla väntande ({allFilteredListings.filter(l => l.status === 'PENDING').length})
                  </button>
                  
                  <button
                    onClick={quickRejectReported}
                    disabled={bulkOperationInProgress || allFilteredListings.filter(l => l.reports && l.reports > 0).length === 0}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Avslå rapporterade ({allFilteredListings.filter(l => l.reports && l.reports > 0).length})
                  </button>
                  
                  <button
                    onClick={quickFeatureHighPerforming}
                    disabled={bulkOperationInProgress || allFilteredListings.filter(l => l.views > 100 && l.inquiries > 10).length === 0}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 px-4 py-3 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
                  >
                    <Star className="w-5 h-5 mr-2" />
                    Framhäv högpresterande ({allFilteredListings.filter(l => l.views > 100 && l.inquiries > 10).length})
                  </button>
                </div>
              </div>

              {/* Bulk Operations Bar */}
              {selectedListings.length > 0 && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-bold text-sm">{selectedListings.length}</span>
                      </div>
                      <span className="text-lg font-semibold text-gray-900">
                        {selectedListings.length} annonser valda
                      </span>
                    </div>
                    <button 
                      onClick={() => setSelectedListings([])}
                      className="text-gray-600 hover:text-gray-800 text-sm flex items-center"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Rensa urval
                    </button>
                  </div>
                  
                  {/* Enhanced Action Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                    <button
                      onClick={() => initiateQuickAction('approve')}
                      disabled={bulkOperationInProgress}
                      className="bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Godkänn
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('reject')}
                      disabled={bulkOperationInProgress}
                      className="bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Avslå
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('feature')}
                      disabled={bulkOperationInProgress}
                      className="bg-yellow-600 text-white px-4 py-3 rounded-lg hover:bg-yellow-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <Star className="w-4 h-4 mr-1" />
                      Framhäv
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('priority')}
                      disabled={bulkOperationInProgress}
                      className="bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      Prioritera
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('archive')}
                      disabled={bulkOperationInProgress}
                      className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      Arkivera
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('notify_sellers')}
                      disabled={bulkOperationInProgress}
                      className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      Meddela
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('export')}
                      disabled={bulkOperationInProgress}
                      className="bg-indigo-600 text-white px-4 py-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <Download className="w-4 h-4 mr-1" />
                      Exportera
                    </button>
                    
                    <button
                      onClick={() => initiateQuickAction('delete')}
                      disabled={bulkOperationInProgress}
                      className="bg-red-700 text-white px-4 py-3 rounded-lg hover:bg-red-800 disabled:opacity-50 text-sm flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Radera
                    </button>
                  </div>
                </div>
              )}

              {/* Moderation Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Väntar granskning</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {allFilteredListings.filter(l => l.status === 'PENDING').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Godkända idag</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {allFilteredListings.filter(l => l.status === 'ACTIVE').length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <XCircle className="w-8 h-8 text-red-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Högrisk annonser</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {allFilteredListings.filter(l => getRiskScore(l) >= 70).length}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totalt annonser</p>
                      <p className="text-2xl font-bold text-gray-900">{allFilteredListings.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Listings Table with Bulk Operations */}
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left">
                          <input
                            type="checkbox"
                            checked={selectedListings.length === allFilteredListings.length && allFilteredListings.length > 0}
                            onChange={handleSelectAllListings}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annons & Risk</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pris</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Säljare</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aktivitet</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredListings.map((listing) => {
                        const riskScore = getRiskScore(listing);
                        const riskColor = getRiskColor(riskScore);
                        const isSelected = selectedListings.includes(listing.id);
                        
                        return (
                          <tr 
                            key={listing.id} 
                            className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${
                              listing.status === 'PENDING' ? 'bg-yellow-50' : ''
                            }`}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectListing(listing.id)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getCategoryIcon(listing.category)}
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                                  <div className="text-sm text-gray-500">
                                    {formatDate(listing.createdAt)} • {listing.reports || 0} rapporter
                                  </div>
                                  {/* Risk Indicator */}
                                  <div className="flex items-center mt-1 space-x-2">
                                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${riskColor}`}>
                                      Risk: {riskScore}%
                                    </span>
                                    {riskScore >= 70 && (
                                      <AlertTriangle className="w-4 h-4 text-red-500" />
                                    )}
                                    {listing.reports > 0 && (
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                        {listing.reports} rapport{listing.reports > 1 ? 'er' : ''}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm text-gray-900 capitalize">{listing.category}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-gray-900">{formatPrice(listing.price)}</span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-8 w-8">
                                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-xs font-medium text-gray-600">
                                      {listing.seller.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm text-gray-900">{listing.seller}</div>
                                  <div className="text-xs text-gray-500">Verifierad</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(listing.status)}`}>
                                {listing.status === 'PENDING' ? 'Väntar' : 
                                 listing.status === 'ACTIVE' ? 'Aktiv' :
                                 listing.status === 'REJECTED' ? 'Avvisad' :
                                 listing.status === 'SOLD' ? 'Såld' : listing.status}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center">
                                  <Eye className="w-4 h-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-900">{listing.views}</span>
                                </div>
                                <div className="flex items-center">
                                  <MessageSquare className="w-4 h-4 text-gray-400 mr-1" />
                                  <span className="text-sm text-gray-900">0</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                {listing.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(listing.id)}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                                      title="Godkänn annons"
                                    >
                                      <CheckCircle className="w-3 h-3 mr-1" />
                                      Godkänn
                                    </button>
                                    <button
                                      onClick={() => handleReject(listing.id)}
                                      className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                                      title="Avslå annons"
                                    >
                                      <XCircle className="w-3 h-3 mr-1" />
                                      Avslå
                                    </button>
                                  </>
                                )}
                                {listing.status !== 'PENDING' && (
                                  <div className="flex items-center space-x-1">
                                    <button 
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setShowListingModal(true);
                                      }}
                                      className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-100 rounded"
                                      title="Visa detaljer"
                                    >
                                      <Eye className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        setSelectedListing(listing);
                                        setShowEditModal(true);
                                      }}
                                      className="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded"
                                      title="Redigera"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => {
                                        if (window.confirm(`Är du säker på att du vill ta bort annonsen "${listing.title}"?`)) {
                                          handleDeleteListing(listing.id);
                                        }
                                      }}
                                      className="p-1 text-red-600 hover:text-red-900 hover:bg-red-100 rounded"
                                      title="Ta bort"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {filteredListings.length === 0 && allFilteredListings.length === 0 && (
                        <tr>
                          <td colSpan={8} className="px-6 py-12 text-center">
                            <div className="text-gray-500">
                              <Building2 className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                              <h3 className="text-lg font-medium text-gray-900 mb-2">Inga annonser hittades</h3>
                              <p className="text-sm">Försök justera dina filter eller sökterm.</p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                {allFilteredListings.length > itemsPerPage && (
                  <div className="bg-white px-6 py-3 border-t border-gray-200 flex items-center justify-between">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Föregående
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(allFilteredListings.length / itemsPerPage)))}
                        disabled={currentPage === Math.ceil(allFilteredListings.length / itemsPerPage)}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Nästa
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Visar{' '}
                          <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span>
                          {' '}till{' '}
                          <span className="font-medium">
                            {Math.min(currentPage * itemsPerPage, allFilteredListings.length)}
                          </span>
                          {' '}av{' '}
                          <span className="font-medium">{allFilteredListings.length}</span>
                          {' '}resultat
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                          <button
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Föregående</span>
                            <span className="h-5 w-5" aria-hidden="true">‹</span>
                          </button>
                          
                          {Array.from({ length: Math.ceil(allFilteredListings.length / itemsPerPage) }, (_, i) => i + 1)
                            .filter(page => {
                              const totalPages = Math.ceil(allFilteredListings.length / itemsPerPage);
                              return (
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 2 && page <= currentPage + 2)
                              );
                            })
                            .map((page, index, filteredPages) => {
                              const prevPage = filteredPages[index - 1];
                              const showEllipsis = prevPage && page - prevPage > 1;
                              
                              return (
                                <React.Fragment key={page}>
                                  {showEllipsis && (
                                    <span className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                      ...
                                    </span>
                                  )}
                                  <button
                                    onClick={() => setCurrentPage(page)}
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                      currentPage === page
                                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    {page}
                                  </button>
                                </React.Fragment>
                              );
                            })}
                          
                          <button
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.ceil(allFilteredListings.length / itemsPerPage)))}
                            disabled={currentPage === Math.ceil(allFilteredListings.length / itemsPerPage)}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            <span className="sr-only">Nästa</span>
                            <span className="h-5 w-5" aria-hidden="true">›</span>
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Hantera användare</h2>
              </div>

              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Användare</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Provider</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Annonser</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Senaste inloggning</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                  <Users className="w-5 h-5 text-gray-600" />
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  {user.name}
                                  {user.verified && <CheckCircle className="w-4 h-4 text-green-500 ml-2" />}
                                </div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{user.provider}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{user.listingsCount}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(user.status)}`}>
                              {user.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="text-sm text-gray-900">{formatDate(user.lastLogin)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserModal(true);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Visa användardetaljer"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => {
                                setSelectedUser(user);
                                setShowUserEditModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-900"
                              title="Redigera användare"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            {user.status === 'ACTIVE' && (
                              <button
                                onClick={() => handleSuspendUser(user.id)}
                                className="text-orange-600 hover:text-orange-900"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
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
            <div className="space-y-8">
              {/* Header Section */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Support & Kundservice 🎯</h2>
                    <p className="text-blue-100 text-lg">Professionell support för alla våra användare</p>
                    <div className="flex items-center mt-4 text-blue-100">
                      <HeartHandshake className="w-5 h-5 mr-2" />
                      <span className="text-sm">Vi hjälper dig att lyckas</span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-20 h-20 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                      <MessageSquare className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Stats with Beautiful Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Öppna Tickets</p>
                          <p className="text-3xl font-bold text-gray-900">{supportTickets.filter(t => t.status === 'open').length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-blue-600 text-sm font-medium">
                      <Activity className="w-4 h-4 inline mr-1" />
                      Aktiv
                    </div>
                  </div>
                  <div className="mt-4 bg-blue-50 rounded-lg p-3">
                    <p className="text-xs text-blue-700">📨 Nya förfrågningar från kunder</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                          <AlertTriangle className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Hög Prioritet</p>
                          <p className="text-3xl font-bold text-gray-900">{supportTickets.filter(t => t.priority === 'high').length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-yellow-600 text-sm font-medium">
                      <Zap className="w-4 h-4 inline mr-1" />
                      Brådskande
                    </div>
                  </div>
                  <div className="mt-4 bg-yellow-50 rounded-lg p-3">
                    <p className="text-xs text-yellow-700">⚡ Kräver omedelbar uppmärksamhet</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <Clock className="w-6 h-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Pågående</p>
                          <p className="text-3xl font-bold text-gray-900">{supportTickets.filter(t => t.status === 'in_progress').length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-orange-600 text-sm font-medium">
                      <Timer className="w-4 h-4 inline mr-1" />
                      Arbetar
                    </div>
                  </div>
                  <div className="mt-4 bg-orange-50 rounded-lg p-3">
                    <p className="text-xs text-orange-700">🔄 Aktivt bearbetas av teamet</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-600">Lösta</p>
                          <p className="text-3xl font-bold text-gray-900">{supportTickets.filter(t => t.status === 'resolved').length}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-green-600 text-sm font-medium">
                      <Award className="w-4 h-4 inline mr-1" />
                      Klart
                    </div>
                  </div>
                  <div className="mt-4 bg-green-50 rounded-lg p-3">
                    <p className="text-xs text-green-700">✅ Framgångsrikt hanterade ärenden</p>
                  </div>
                </div>
              </div>

              {/* Team Section */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center">
                    <Users className="w-6 h-6 mr-2 text-blue-600" />
                    Support Team
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Alla teammedlemmar</span>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      id: 'team-001',
                      name: 'Anna Lindberg',
                      role: 'Senior Support Manager',
                      avatar: 'AL',
                      status: 'online',
                      activeTickets: 12,
                      resolvedToday: 8,
                      responseTime: '2 min',
                      expertise: ['Teknisk Support', 'Betalningar', 'Premium Accounts'],
                      contact: { email: 'anna@123hansa.se', phone: '+46 70 123 4567' }
                    },
                    {
                      id: 'team-002',
                      name: 'Erik Johansson',
                      role: 'Technical Support Specialist',
                      avatar: 'EJ',
                      status: 'online',
                      activeTickets: 8,
                      resolvedToday: 5,
                      responseTime: '3 min',
                      expertise: ['API Integration', 'Tekniska Problem', 'Utvecklarstöd'],
                      contact: { email: 'erik@123hansa.se', phone: '+46 70 987 6543' }
                    },
                    {
                      id: 'team-003',
                      name: 'Sofia Andersson',
                      role: 'Customer Success Agent',
                      avatar: 'SA',
                      status: 'online',
                      activeTickets: 6,
                      resolvedToday: 11,
                      responseTime: '1 min',
                      expertise: ['Kundframgång', 'Onboarding', 'Marknadsföring'],
                      contact: { email: 'sofia@123hansa.se', phone: '+46 70 555 9876' }
                    }
                  ].map((member, index) => (
                    <div key={member.id} className="bg-gray-50 rounded-xl p-6 hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="relative">
                          <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${
                            index === 0 ? 'from-blue-500 to-purple-600' : 
                            index === 1 ? 'from-green-500 to-teal-600' : 
                            'from-purple-500 to-pink-600'
                          } flex items-center justify-center text-white font-bold text-lg`}>
                            {member.avatar}
                          </div>
                          {member.status === 'online' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{member.name}</h4>
                          <p className="text-sm text-gray-600">{member.role}</p>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-lg font-bold text-blue-600">{member.activeTickets}</div>
                            <div className="text-xs text-gray-500">Aktiva</div>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-lg font-bold text-green-600">{member.resolvedToday}</div>
                            <div className="text-xs text-gray-500">Lösta idag</div>
                          </div>
                          <div className="bg-white rounded-lg p-2">
                            <div className="text-lg font-bold text-orange-600">{member.responseTime}</div>
                            <div className="text-xs text-gray-500">Svarstid</div>
                          </div>
                        </div>

                        <div>
                          <h5 className="text-sm font-medium text-gray-700 mb-2">Specialområden:</h5>
                          <div className="flex flex-wrap gap-1">
                            {member.expertise.map((skill, skillIndex) => (
                              <span key={skillIndex} className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <button 
                            onClick={() => window.open(`mailto:${member.email}?subject=Support%20Ärende`, '_blank')}
                            className="flex items-center text-blue-600 hover:text-blue-700"
                          >
                            <Mail className="w-4 h-4 mr-1" />
                            <span className="text-sm">E-post</span>
                          </button>
                          <button 
                            onClick={() => window.open(`tel:${member.phone}`, '_blank')}
                            className="flex items-center text-green-600 hover:text-green-700"
                          >
                            <Phone className="w-4 h-4 mr-1" />
                            <span className="text-sm">Ring</span>
                          </button>
                          <button 
                            onClick={() => {
                              setSelectedCustomer(member);
                              setShowSupportChat(true);
                            }}
                            className="flex items-center text-purple-600 hover:text-purple-700"
                          >
                            <MessageSquare className="w-4 h-4 mr-1" />
                            <span className="text-sm">Chatta</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tickets Management */}
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
                <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">Support Tickets</h3>
                    <div className="flex items-center space-x-3">
                      <select 
                        value={ticketFilter} 
                        onChange={(e) => setTicketFilter(e.target.value)}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
                      >
                        <option value="all">Alla tickets</option>
                        <option value="open">Öppna</option>
                        <option value="in_progress">Pågående</option>
                        <option value="resolved">Lösta</option>
                        <option value="closed">Stängda</option>
                      </select>
                      <span className="text-sm text-gray-600">
                        {filteredTickets.length} av {supportTickets.length} tickets
                      </span>
                    </div>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ticket</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kund</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Prioritet</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tilldelad</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Åtgärder</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredTickets.map((ticket) => (
                        <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-4">
                                <MessageSquare className="w-5 h-5 text-white" />
                              </div>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-gray-900 truncate">#{ticket.id}</div>
                                <div className="text-sm text-gray-600 mt-1">{ticket.subject}</div>
                                <div className="text-xs text-gray-400 mt-1">{formatDate(ticket.createdAt)}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                                <User className="w-4 h-4 text-gray-600" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{ticket.user.name}</div>
                                <div className="text-xs text-gray-500">{ticket.category}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTicketStatusColor(ticket.status)}`}>
                              {ticket.status === 'open' ? 'Öppen' : 
                               ticket.status === 'in_progress' ? 'Pågående' : 
                               ticket.status === 'resolved' ? 'Löst' : 'Stängd'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getTicketPriorityColor(ticket.priority)}`}>
                              {ticket.priority === 'high' ? 'Hög' : ticket.priority === 'medium' ? 'Medium' : 'Låg'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-900">
                              {ticket.assignedTo ? 'Tilldelad' : 'Ej tilldelad'}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <button 
                                onClick={() => setSelectedTicket(ticket)}
                                className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                                title="Visa detaljer"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedCustomer({
                                    id: ticket.user.id,
                                    name: ticket.user.name,
                                    email: ticket.user.email,
                                    status: 'online',
                                    priority: ticket.priority,
                                    category: ticket.category,
                                    ticketId: ticket.id
                                  });
                                  setShowSupportChat(true);
                                }}
                                className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                title="Starta chatt"
                              >
                                <MessageSquare className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedTicket(ticket);
                                  setTicketResponse('');
                                }}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                title="Redigera ticket"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSupportTickets(prev => 
                                    prev.map(t => t.id === ticket.id 
                                      ? { ...t, status: 'resolved', resolvedAt: new Date().toISOString() }
                                      : t
                                    )
                                  );
                                  toast.success('Ticket markerat som löst');
                                }}
                                className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                title="Markera som löst"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between border-t border-gray-200">
                  <div className="flex items-center text-sm text-gray-700">
                    <span>Visar {filteredTickets.length} av {supportTickets.length} tickets</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Föregående</button>
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded">1</span>
                    <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">Nästa</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Crowdfunding Tab */}
          {activeTab === 'crowdfunding' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Crowdfunding Management</h2>
                <div className="flex items-center space-x-3">
                  <select 
                    value={campaignFilter} 
                    onChange={(e) => setCampaignFilter(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="all">Alla kampanjer</option>
                    <option value="ACTIVE">Aktiva</option>
                    <option value="FUNDED">Finansierade</option>
                    <option value="URGENT">Brådskande</option>
                    <option value="pending">Väntar godkännande</option>
                  </select>
                  <span className="text-sm text-gray-600">
                    {campaigns.filter(c => campaignFilter === 'all' || c.status === campaignFilter).length} av {campaigns.length} kampanjer
                  </span>
                </div>
              </div>

              {/* Crowdfunding Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totalt insamlat</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crowdfundingStats ? `${(crowdfundingStats.totalRaised / 1000000).toFixed(1)}M SEK` : '0 SEK'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <BarChart3 className="w-8 h-8 text-blue-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Aktiva kampanjer</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crowdfundingStats?.activeCampaigns || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Users className="w-8 h-8 text-purple-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Totala backers</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crowdfundingStats?.totalBackers || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Award className="w-8 h-8 text-yellow-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Framgångsgrad</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crowdfundingStats?.successRate || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Plattformsavgifter</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crowdfundingStats ? `${(crowdfundingStats.totalFees / 1000).toFixed(0)}k SEK` : '0 SEK'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <AlertTriangle className="w-8 h-8 text-orange-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Väntar godkännande</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {crowdfundingStats?.pendingApproval || 0}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center">
                    <Activity className="w-8 h-8 text-indigo-600" />
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Månadstillväxt</p>
                      <p className="text-2xl font-bold text-gray-900">
                        +{crowdfundingStats?.monthlyGrowth || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Campaign Management */}
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900">Kampanjhantering</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Kampanj
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Skapare
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Finansieringsmål
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dagar kvar
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Åtgärder
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.filter(campaign => {
                        if (campaignFilter === 'all') return true;
                        if (campaignFilter === 'active') return campaign.daysLeft > 0;
                        if (campaignFilter === 'funded') return campaign.currentAmount >= campaign.fundingGoal;
                        if (campaignFilter === 'urgent') return campaign.daysLeft <= 7;
                        return true;
                      }).map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <img 
                                src={campaign.image} 
                                alt={campaign.title}
                                className="w-12 h-12 rounded-lg object-cover mr-3"
                              />
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {campaign.title}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {campaign.category} • #{campaign.id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{campaign.creator.name}</div>
                            <div className="text-sm text-gray-500">{campaign.location}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {(campaign.currentAmount / 1000).toFixed(0)}k SEK
                            </div>
                            <div className="text-sm text-gray-500">
                              av {(campaign.fundingGoal / 1000).toFixed(0)}k SEK
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                              <div 
                                className="bg-emerald-500 h-2 rounded-full" 
                                style={{ width: `${Math.min((campaign.currentAmount / campaign.fundingGoal) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                              campaign.currentAmount >= campaign.fundingGoal 
                                ? 'bg-green-100 text-green-800' 
                                : campaign.daysLeft <= 7 
                                ? 'bg-red-100 text-red-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {campaign.currentAmount >= campaign.fundingGoal 
                                ? 'Finansierad' 
                                : campaign.daysLeft <= 7 
                                ? 'Brådskande' 
                                : 'Aktiv'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div>{campaign.daysLeft} dagar</div>
                            <div className="text-xs text-gray-400">
                              {campaign.backers} stödjare
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button 
                              onClick={() => {
                                setCampaigns(prev => 
                                  prev.map(c => c.id === campaign.id 
                                    ? { ...c, featured: !c.featured }
                                    : c
                                  )
                                );
                                toast.success(campaign.featured ? 'Kampanj inte längre framhävd' : 'Kampanj framhävd');
                              }}
                              className="text-emerald-600 hover:text-emerald-900"
                            >
                              {campaign.featured ? 'Ta bort framhävning' : 'Framhäv'}
                            </button>
                            <button 
                              onClick={() => {
                                window.open(`/crowdfunding/campaigns/${campaign.id}/edit`, '_blank');
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Redigera
                            </button>
                            <button 
                              onClick={() => {
                                if (window.confirm('Vill du pausa denna kampanj?')) {
                                  setCampaigns(prev => 
                                    prev.map(c => c.id === campaign.id 
                                      ? { ...c, status: 'paused' }
                                      : c
                                    )
                                  );
                                  toast.success('Kampanj pausad');
                                }
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Pausa
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Crowdfunding Analytics Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Crowdfunding-rapporter</h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => {
                        const data = JSON.stringify(crowdfundingStats, null, 2);
                        const blob = new Blob([data], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `crowdfunding-monthly-report-${new Date().toISOString().slice(0, 7)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Rapport nedladdad');
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-900">Månadsrapport Crowdfunding</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => {
                        const data = campaigns.map(c => ({
                          id: c.id,
                          title: c.title,
                          goal: c.fundingGoal,
                          raised: c.currentAmount,
                          progress: ((c.currentAmount / c.fundingGoal) * 100).toFixed(1),
                          backers: c.backers,
                          daysLeft: c.daysLeft
                        }));
                        const csv = [['ID', 'Title', 'Goal', 'Raised', 'Progress%', 'Backers', 'Days Left'], ...data.map(Object.values)].map(row => row.join(',')).join('\n');
                        const blob = new Blob([csv], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `campaign-statistics-${new Date().toISOString().slice(0, 10)}.csv`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Kampanjstatistik nedladdad');
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-900">Kampanjstatistik</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                    <button 
                      onClick={() => {
                        const creators = [...new Set(campaigns.map(c => c.creator.name))];
                        const data = creators.map(name => {
                          const creatorCampaigns = campaigns.filter(c => c.creator.name === name);
                          return {
                            name,
                            campaigns: creatorCampaigns.length,
                            totalRaised: creatorCampaigns.reduce((sum, c) => sum + c.currentAmount, 0),
                            avgBackers: Math.round(creatorCampaigns.reduce((sum, c) => sum + c.backers, 0) / creatorCampaigns.length)
                          };
                        });
                        const report = JSON.stringify(data, null, 2);
                        const blob = new Blob([report], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `creator-analysis-${new Date().toISOString().slice(0, 10)}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                        toast.success('Skaparanalys nedladdad');
                      }}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span className="text-sm font-medium text-gray-900">Skaparanalys</span>
                      <Download className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Kampanjkategorier</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm">💻</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Tech Startups</div>
                          <div className="text-xs text-gray-500">3 aktiva kampanjer</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-emerald-600">1.7M SEK</div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm">🏪</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Fysiska verksamheter</div>
                          <div className="text-xs text-gray-500">4 aktiva kampanjer</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-emerald-600">2.9M SEK</div>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                          <span className="text-sm">💡</span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">Innovation & Tech</div>
                          <div className="text-xs text-gray-500">5 aktiva kampanjer</div>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-emerald-600">8.2M SEK</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Systeminställningar</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">OAuth Inställningar</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Google Client ID</label>
                      <input
                        type="text"
                        placeholder="Lägg till din Google OAuth Client ID här"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Client ID</label>
                      <input
                        type="text"
                        placeholder="Lägg till din LinkedIn OAuth Client ID här"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Microsoft Client ID</label>
                      <input
                        type="text"
                        placeholder="Lägg till din Microsoft OAuth Client ID här"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Facebook App ID</label>
                      <input
                        type="text"
                        placeholder="Lägg till din Facebook App ID här"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Allmänna inställningar</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Automatiskt godkänn annonser</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Email-notifikationer</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-blue-600">
                        <span className="inline-block h-4 w-4 transform translate-x-6 rounded-full bg-white transition" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Underhållsläge</span>
                      <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200">
                        <span className="inline-block h-4 w-4 transform rounded-full bg-white transition" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-mx-4 mx-4">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Bekräfta åtgärd</h3>
                <p className="text-sm text-gray-600">
                  {pendingBulkAction === 'delete' 
                    ? 'Är du säker på att du vill ta bort dessa annonser permanent?' 
                    : 'Är du säker på att du vill avslå dessa annonser?'
                  }
                </p>
              </div>
            </div>
            
            <div className="mb-4">
              <p className="text-sm text-gray-700">
                Denna åtgärd kommer att påverka <strong>{selectedListings.length}</strong> annonser:
              </p>
              <div className="max-h-32 overflow-y-auto mt-2 bg-gray-50 rounded-lg p-3">
                {listings
                  .filter(listing => selectedListings.includes(listing.id))
                  .slice(0, 5)
                  .map(listing => (
                    <div key={listing.id} className="text-xs text-gray-600 py-1">
                      • {listing.title}
                    </div>
                  ))
                }
                {selectedListings.length > 5 && (
                  <div className="text-xs text-gray-500 py-1">
                    ... och {selectedListings.length - 5} till
                  </div>
                )}
              </div>
            </div>

            <div className="flex space-x-3 justify-end">
              <button
                onClick={cancelBulkAction}
                disabled={bulkOperationInProgress}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={confirmBulkAction}
                disabled={bulkOperationInProgress}
                className={`px-6 py-2 rounded-lg text-white font-medium disabled:opacity-50 ${
                  pendingBulkAction === 'delete' 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-orange-600 hover:bg-orange-700'
                } flex items-center`}
              >
                {bulkOperationInProgress && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {pendingBulkAction === 'delete' ? 'Ta bort permanent' : 'Avslå alla'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Support Chat Button */}
      {!showSupportChat && (
        <button
          onClick={() => setShowSupportChat(true)}
          className="fixed bottom-4 right-4 z-40 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          title="Starta supportchatt"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}

      {/* Enhanced Support Chat */}
      <EnhancedSupportChat
        isOpen={showSupportChat}
        onClose={() => {
          setShowSupportChat(false);
          setSelectedCustomer(null);
        }}
        customer={selectedCustomer}
        ticketId={selectedCustomer?.ticketId}
      />

      {/* Listing Details Modal */}
      {showListingModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Annonsdetaljer</h3>
                <button
                  onClick={() => {
                    setShowListingModal(false);
                    setSelectedListing(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">{selectedListing.title}</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pris:</span>
                      <span className="text-sm font-medium">{formatPrice(selectedListing.price)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Kategori:</span>
                      <span className="text-sm font-medium">{selectedListing.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(selectedListing.status)}`}>
                        {selectedListing.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Visningar:</span>
                      <span className="text-sm font-medium">{selectedListing.views}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Förfrågningar:</span>
                      <span className="text-sm font-medium">{selectedListing.inquiries || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rapporter:</span>
                      <span className="text-sm font-medium">{selectedListing.reports}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Säljare</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Namn:</span>
                      <span className="text-sm font-medium">{selectedListing.seller}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{selectedListing.sellerEmail}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Skapad:</span>
                      <span className="text-sm font-medium">{formatDate(selectedListing.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleApproveListing(selectedListing.id);
                    setShowListingModal(false);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Godkänn
                </button>
                <button
                  onClick={() => {
                    handleRejectListing(selectedListing.id);
                    setShowListingModal(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Avslå
                </button>
                <button
                  onClick={() => {
                    setShowListingModal(false);
                    setShowEditModal(true);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Redigera
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Användardetaljer</h3>
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Grundinformation</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Namn:</span>
                      <span className="text-sm font-medium">{selectedUser.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">{selectedUser.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Provider:</span>
                      <span className="text-sm font-medium">{selectedUser.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(selectedUser.status)}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Verifierad:</span>
                      <span className="text-sm font-medium">
                        {selectedUser.verified ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Ja
                          </span>
                        ) : (
                          <span className="text-red-600">Nej</span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-4">Aktivitet</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Annonser:</span>
                      <span className="text-sm font-medium">{selectedUser.listingsCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Medlem sedan:</span>
                      <span className="text-sm font-medium">{formatDate(selectedUser.joinedDate)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Senast inloggad:</span>
                      <span className="text-sm font-medium">{formatDate(selectedUser.lastLogin)}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowUserModal(false);
                    setShowUserEditModal(true);
                  }}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Redigera användare
                </button>
                <button
                  onClick={() => {
                    // Send message to user
                    window.open(`mailto:${selectedUser.email}?subject=Meddelande från 123hansa Admin`);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Skicka email
                </button>
                {selectedUser.status === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      handleSuspendUser(selectedUser.id);
                      setShowUserModal(false);
                    }}
                    className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Stäng av
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Edit Modal */}
      {showUserEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Redigera användare</h3>
                <button
                  onClick={() => {
                    setShowUserEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Namn</label>
                  <input
                    type="text"
                    defaultValue={selectedUser.name}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    defaultValue={selectedUser.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={selectedUser.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Aktiv</option>
                    <option value="SUSPENDED">Avstängd</option>
                    <option value="BANNED">Bannlyst</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="verified"
                    defaultChecked={selectedUser.verified}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="verified" className="ml-2 text-sm text-gray-700">Verifierad användare</label>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    toast.success('Användarinformation uppdaterad');
                    setShowUserEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Spara ändringar
                </button>
                <button
                  onClick={() => {
                    setShowUserEditModal(false);
                    setSelectedUser(null);
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Listing Edit Modal */}
      {showEditModal && selectedListing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900">Redigera annons</h3>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedListing(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
                  <input
                    type="text"
                    defaultValue={selectedListing.title}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pris (SEK)</label>
                  <input
                    type="number"
                    defaultValue={selectedListing.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
                  <select
                    defaultValue={selectedListing.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="companies">Företag</option>
                    <option value="ecommerce">E-handel</option>
                    <option value="domains">Domäner</option>
                    <option value="social">Sociala medier</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    defaultValue={selectedListing.status}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="PENDING">Väntar granskning</option>
                    <option value="ACTIVE">Aktiv</option>
                    <option value="REJECTED">Avslågen</option>
                    <option value="SOLD">Såld</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="featured"
                      defaultChecked={selectedListing.featured}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="ml-2 text-sm text-gray-700">Utvald annons</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="priority"
                      defaultChecked={selectedListing.priority}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="priority" className="ml-2 text-sm text-gray-700">Prioriterad</label>
                  </div>
                </div>
              </div>
              <div className="flex space-x-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    toast.success('Annons uppdaterad');
                    setShowEditModal(false);
                    setSelectedListing(null);
                  }}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  Spara ändringar
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedListing(null);
                  }}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Avbryt
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminPanel;