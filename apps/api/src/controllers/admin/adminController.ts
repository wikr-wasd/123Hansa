import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// Types for CMS
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    verificationLevel: string;
    adminProfile?: {
      role: string;
      permissions: any;
    };
  };
}

// Validation schemas
const createAdminSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['SUPER_ADMIN', 'CONTENT_MODERATOR', 'CUSTOMER_SUPPORT', 'FINANCIAL_ADMIN', 'ANALYTICS_TEAM']),
  permissions: z.object({}).optional(),
  ipWhitelist: z.array(z.string()).optional()
});

const moderationActionSchema = z.object({
  targetType: z.string(),
  targetId: z.string().uuid(),
  action: z.enum(['APPROVE', 'REJECT', 'SUSPEND', 'DELETE', 'EDIT', 'FEATURE', 'UNFLAG', 'ESCALATE']),
  reason: z.string().optional(),
  notes: z.string().optional()
});

// Admin Dashboard - Main overview
export const getDashboardStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get current date ranges
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Fetch comprehensive stats
    const [
      totalUsers,
      newUsersLast30Days,
      totalListings,
      pendingListings,
      activeListings,
      soldListings,
      totalTransactions,
      transactionVolume,
      openSupportTickets,
      pendingFlags,
      platformMetrics
    ] = await Promise.all([
      // Users
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      
      // Listings
      prisma.businessListing.count(),
      prisma.businessListing.count({ where: { status: 'PENDING_REVIEW' } }),
      prisma.businessListing.count({ where: { status: 'ACTIVE' } }),
      prisma.businessListing.count({ where: { status: 'SOLD' } }),
      
      // Transactions
      prisma.transaction.count(),
      prisma.transaction.aggregate({ _sum: { amount: true } }),
      
      // Support
      prisma.supportTicket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
      
      // Content flags
      prisma.contentFlag.count({ where: { status: 'PENDING' } }),
      
      // Latest platform metrics
      prisma.platformMetrics.findFirst({
        orderBy: { date: 'desc' }
      })
    ]);

    // Calculate growth percentages
    const usersLast7Days = await prisma.user.count({ 
      where: { createdAt: { gte: sevenDaysAgo } } 
    });
    const listingsLast7Days = await prisma.businessListing.count({ 
      where: { createdAt: { gte: sevenDaysAgo } } 
    });

    const stats = {
      users: {
        total: totalUsers,
        new30Days: newUsersLast30Days,
        new7Days: usersLast7Days,
        growthRate: totalUsers > 0 ? ((newUsersLast30Days / totalUsers) * 100) : 0
      },
      listings: {
        total: totalListings,
        pending: pendingListings,
        active: activeListings,
        sold: soldListings,
        new7Days: listingsLast7Days
      },
      transactions: {
        total: totalTransactions,
        volume: transactionVolume._sum.amount || 0,
        averageValue: totalTransactions > 0 ? (Number(transactionVolume._sum.amount) / totalTransactions) : 0
      },
      support: {
        openTickets: openSupportTickets,
        pendingFlags: pendingFlags
      },
      platformHealth: {
        uptime: platformMetrics?.systemUptime || 99.9,
        avgResponseTime: platformMetrics?.averageResponseTime || 120
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};

// Get pending listings for moderation
export const getPendingListings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { page = 1, limit = 20, category, riskLevel } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const whereClause: any = {
      status: 'PENDING_REVIEW'
    };

    if (category) {
      whereClause.category = category;
    }

    const pendingListings = await prisma.businessListing.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            verificationLevel: true
          }
        },
        images: true
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: Number(limit)
    });

    const totalCount = await prisma.businessListing.count({ where: whereClause });

    // Add AI risk analysis simulation (in real implementation, this would be actual AI analysis)
    const enrichedListings = pendingListings.map(listing => ({
      ...listing,
      adminReview: {
        autoAnalysis: {
          riskLevel: Math.random() > 0.7 ? 'HIGH' : Math.random() > 0.4 ? 'MEDIUM' : 'LOW',
          confidence: Math.round(Math.random() * 30 + 70), // 70-100%
          flags: Math.random() > 0.5 ? ['Incomplete financial data', 'Price seems high'] : [],
          aiNotes: 'Automated analysis completed'
        }
      }
    }));

    res.json({
      success: true,
      data: {
        listings: enrichedListings,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          hasMore: skip + Number(limit) < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Pending listings error:', error);
    res.status(500).json({ error: 'Failed to fetch pending listings' });
  }
};

// Moderate listing (approve/reject)
export const moderateListing = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { listingId } = req.params;
    const validation = moderationActionSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid moderation data', details: validation.error });
    }

    const { action, reason, notes } = validation.data;

    // Check if listing exists and is pending
    const listing = await prisma.businessListing.findUnique({
      where: { id: listingId },
      include: { owner: true }
    });

    if (!listing) {
      return res.status(404).json({ error: 'Listing not found' });
    }

    if (listing.status !== 'PENDING_REVIEW') {
      return res.status(400).json({ error: 'Listing is not pending review' });
    }

    // Determine new status based on action
    let newStatus: string;
    switch (action) {
      case 'APPROVE':
        newStatus = 'ACTIVE';
        break;
      case 'REJECT':
        newStatus = 'REMOVED';
        break;
      case 'SUSPEND':
        newStatus = 'REMOVED'; // Could be a different status
        break;
      default:
        return res.status(400).json({ error: 'Invalid action for listing moderation' });
    }

    // Update listing status
    const updatedListing = await prisma.businessListing.update({
      where: { id: listingId },
      data: {
        status: newStatus as any,
        publishedAt: action === 'APPROVE' ? new Date() : null
      }
    });

    // Log moderation action
    await prisma.moderationAction_Log.create({
      data: {
        adminId: adminUser.adminProfile.id,
        targetType: 'listing',
        targetId: listingId,
        action: action as any,
        reason,
        notes,
        metadata: {
          listingTitle: listing.title,
          ownerEmail: listing.owner.email,
          previousStatus: listing.status
        },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // Create admin log entry
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.adminProfile.id,
        action: 'UPDATE',
        resourceType: 'LISTING',
        resourceId: listingId,
        description: `${action} listing: ${listing.title}`,
        details: { action, reason, notes },
        oldValues: { status: listing.status },
        newValues: { status: newStatus },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // TODO: Send notification to listing owner
    // TODO: If approved, trigger SEO indexing
    // TODO: If rejected, send rejection email with reason

    res.json({
      success: true,
      data: {
        listingId,
        action,
        newStatus,
        message: `Listing ${action.toLowerCase()}ed successfully`
      }
    });
  } catch (error) {
    console.error('Listing moderation error:', error);
    res.status(500).json({ error: 'Failed to moderate listing' });
  }
};

// Get admin users (Super Admin only)
export const getAdminUsers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile || adminUser.adminProfile.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const adminUsers = await prisma.adminUser.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      data: adminUsers
    });
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ error: 'Failed to fetch admin users' });
  }
};

// Create admin user (Super Admin only)
export const createAdminUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile || adminUser.adminProfile.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Super admin access required' });
    }

    const validation = createAdminSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid admin data', details: validation.error });
    }

    const { userId, role, permissions, ipWhitelist } = validation.data;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if user already has admin profile
    const existingAdmin = await prisma.adminUser.findUnique({ where: { userId } });
    if (existingAdmin) {
      return res.status(400).json({ error: 'User already has admin privileges' });
    }

    // Create admin profile
    const newAdmin = await prisma.adminUser.create({
      data: {
        userId,
        role: role as any,
        permissions: permissions || {},
        ipWhitelist: ipWhitelist || [],
        createdBy: adminUser.adminProfile.id
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Log admin creation
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.adminProfile.id,
        action: 'CREATE',
        resourceType: 'ADMIN_USER',
        resourceId: newAdmin.id,
        description: `Created admin user: ${user.email} with role: ${role}`,
        details: { userId, role, permissions },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    res.status(201).json({
      success: true,
      data: newAdmin
    });
  } catch (error) {
    console.error('Create admin user error:', error);
    res.status(500).json({ error: 'Failed to create admin user' });
  }
};

// Get platform metrics for analytics
export const getPlatformMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { days = 30 } = req.query;
    const daysBack = Math.min(Number(days), 365); // Max 1 year

    const endDate = new Date();
    const startDate = new Date(endDate.getTime() - daysBack * 24 * 60 * 60 * 1000);

    const metrics = await prisma.platformMetrics.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { date: 'asc' }
    });

    // Calculate trends and aggregates
    const totals = metrics.reduce((acc, metric) => ({
      totalUsers: acc.totalUsers + metric.newUsers,
      totalListings: acc.totalListings + metric.newListings,
      totalTransactions: acc.totalTransactions + metric.totalTransactions,
      totalVolume: acc.totalVolume + Number(metric.transactionVolume),
      totalRevenue: acc.totalRevenue + Number(metric.commissionRevenue)
    }), {
      totalUsers: 0,
      totalListings: 0,
      totalTransactions: 0,
      totalVolume: 0,
      totalRevenue: 0
    });

    res.json({
      success: true,
      data: {
        metrics,
        summary: {
          period: `${daysBack} days`,
          totals,
          averages: {
            dailyUsers: totals.totalUsers / daysBack,
            dailyListings: totals.totalListings / daysBack,
            dailyVolume: totals.totalVolume / daysBack
          }
        }
      }
    });
  } catch (error) {
    console.error('Platform metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch platform metrics' });
  }
};

// Recent activity feed
export const getRecentActivity = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { limit = 50 } = req.query;

    // Get recent admin actions
    const recentActions = await prisma.moderationAction_Log.findMany({
      include: {
        admin: {
          include: {
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: Number(limit)
    });

    // Format for frontend
    const activities = recentActions.map(action => ({
      id: action.id,
      type: 'moderation',
      action: action.action,
      targetType: action.targetType,
      targetId: action.targetId,
      adminName: `${action.admin.user.firstName} ${action.admin.user.lastName}`,
      description: `${action.action} ${action.targetType}`,
      reason: action.reason,
      createdAt: action.createdAt
    }));

    res.json({
      success: true,
      data: activities
    });
  } catch (error) {
    console.error('Recent activity error:', error);
    res.status(500).json({ error: 'Failed to fetch recent activity' });
  }
};

export default {
  getDashboardStats,
  getPendingListings,
  moderateListing,
  getAdminUsers,
  createAdminUser,
  getPlatformMetrics,
  getRecentActivity
};