import { prisma } from '@/config/database';
import { cacheService } from './cacheService';
import { logger } from '@/utils/logger';

// Optimized database queries for 1000+ users with caching and performance monitoring

export class OptimizedQueryService {
  
  // Optimized listing search with full-text search and pagination
  async searchListings({
    query,
    category,
    region,
    minPrice,
    maxPrice,
    page = 1,
    limit = 20,
    sortBy = 'publishedAt',
    sortOrder = 'desc'
  }: {
    query?: string;
    category?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const cacheKey = `listings:search:${JSON.stringify({
      query, category, region, minPrice, maxPrice, page, limit, sortBy, sortOrder
    })}`;

    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        const where: any = { status: 'ACTIVE' };

        // Build where clause for filtering
        if (category) where.category = category;
        if (region) where.region = region;
        if (minPrice || maxPrice) {
          where.askingPrice = {};
          if (minPrice) where.askingPrice.gte = minPrice;
          if (maxPrice) where.askingPrice.lte = maxPrice;
        }

        // Full-text search
        if (query) {
          where.OR = [
            { title: { search: query } },
            { description: { search: query } },
          ];
        }

        // Execute optimized queries in parallel
        const [listings, total] = await Promise.all([
          prisma.businessListing.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              subcategory: true,
              askingPrice: true,
              region: true,
              city: true,
              featured: true,
              viewCount: true,
              publishedAt: true,
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  verificationLevel: true,
                }
              }
            }
          }),
          prisma.businessListing.count({ where })
        ]);

        return {
          listings,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page * limit < total,
            hasPrev: page > 1
          }
        };
      },
      { ttl: 300 } // 5 minutes
    );
  }

  // Get featured listings with caching
  async getFeaturedListings(limit: number = 10) {
    return cacheService.getOrSet(
      'featured-listings',
      async () => {
        return prisma.businessListing.findMany({
          where: {
            status: 'ACTIVE',
            featured: true,
          },
          take: limit,
          orderBy: { publishedAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            askingPrice: true,
            region: true,
            featured: true,
            viewCount: true,
            publishedAt: true,
            owner: {
              select: {
                firstName: true,
                lastName: true,
                verificationLevel: true,
              }
            }
          }
        });
      },
      { ttl: 600 } // 10 minutes
    );
  }

  // Get listing with view count increment (optimized)
  async getListingById(id: string, incrementView: boolean = true) {
    const listing = await prisma.businessListing.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            verificationLevel: true,
            createdAt: true,
          }
        },
        inquiries: {
          where: { status: { in: ['NEW', 'RESPONDED'] } },
          select: { id: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });

    if (!listing) return null;

    // Increment view count asynchronously to avoid blocking
    if (incrementView && listing.status === 'ACTIVE') {
      this.incrementViewCount(id).catch(error => {
        logger.error('Failed to increment view count:', error);
      });
    }

    return listing;
  }

  // Async view count increment to avoid blocking
  private async incrementViewCount(listingId: string) {
    try {
      await prisma.businessListing.update({
        where: { id: listingId },
        data: { viewCount: { increment: 1 } }
      });
      
      // Invalidate related caches
      await cacheService.del(`listing:${listingId}`);
      await cacheService.del('featured-listings');
    } catch (error) {
      logger.error('Failed to increment view count:', error);
    }
  }

  // Get user's listings with pagination
  async getUserListings(userId: string, page: number = 1, limit: number = 10) {
    const cacheKey = `user-listings:${userId}:${page}:${limit}`;
    
    return cacheService.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        
        const [listings, total] = await Promise.all([
          prisma.businessListing.findMany({
            where: { ownerId: userId },
            skip,
            take: limit,
            orderBy: { createdAt: 'desc' },
            select: {
              id: true,
              title: true,
              category: true,
              askingPrice: true,
              status: true,
              viewCount: true,
              publishedAt: true,
              createdAt: true,
            }
          }),
          prisma.businessListing.count({ where: { ownerId: userId } })
        ]);

        return {
          listings,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit)
          }
        };
      },
      { ttl: 180 } // 3 minutes
    );
  }

  // Get dashboard statistics (cached)
  async getDashboardStats(userId?: string) {
    const cacheKey = userId ? `dashboard-stats:${userId}` : 'dashboard-stats:global';
    
    return cacheService.getOrSet(
      cacheKey,
      async () => {
        if (userId) {
          // User-specific stats
          const [listingsCount, inquiriesCount, viewsTotal] = await Promise.all([
            prisma.businessListing.count({
              where: { ownerId: userId }
            }),
            prisma.listingInquiry.count({
              where: {
                listing: { ownerId: userId }
              }
            }),
            prisma.businessListing.aggregate({
              where: { ownerId: userId },
              _sum: { viewCount: true }
            })
          ]);

          return {
            listingsCount,
            inquiriesCount,
            totalViews: viewsTotal._sum.viewCount || 0,
            type: 'user'
          };
        } else {
          // Global platform stats
          const [
            totalUsers,
            activeListings,
            totalListings,
            totalViews,
            totalInquiries
          ] = await Promise.all([
            prisma.user.count({ where: { isActive: true } }),
            prisma.businessListing.count({ where: { status: 'ACTIVE' } }),
            prisma.businessListing.count(),
            prisma.businessListing.aggregate({
              _sum: { viewCount: true }
            }),
            prisma.listingInquiry.count()
          ]);

          return {
            totalUsers,
            activeListings,
            totalListings,
            totalViews: totalViews._sum.viewCount || 0,
            totalInquiries,
            type: 'global'
          };
        }
      },
      { ttl: 1800 } // 30 minutes
    );
  }

  // Get categories with listing counts (cached)
  async getCategoriesWithCounts() {
    return cacheService.getOrSet(
      'categories-with-counts',
      async () => {
        const categories = await prisma.businessListing.groupBy({
          by: ['category'],
          where: { status: 'ACTIVE' },
          _count: { category: true },
          orderBy: { _count: { category: 'desc' } }
        });

        return categories.map(cat => ({
          name: cat.category,
          count: cat._count.category
        }));
      },
      { ttl: 3600 } // 1 hour
    );
  }

  // Get popular regions with listing counts
  async getRegionsWithCounts() {
    return cacheService.getOrSet(
      'regions-with-counts',
      async () => {
        const regions = await prisma.businessListing.groupBy({
          by: ['region'],
          where: { 
            status: 'ACTIVE',
            region: { not: null }
          },
          _count: { region: true },
          orderBy: { _count: { region: 'desc' } },
          take: 20
        });

        return regions.map(region => ({
          name: region.region,
          count: region._count.region
        }));
      },
      { ttl: 3600 } // 1 hour
    );
  }

  // Optimized admin queries
  async getAdminOverview() {
    return cacheService.getOrSet(
      'admin-overview',
      async () => {
        const [
          pendingListings,
          flaggedContent,
          openTickets,
          recentUsers,
          topListings
        ] = await Promise.all([
          prisma.businessListing.count({
            where: { status: 'PENDING_REVIEW' }
          }),
          prisma.contentFlag.count({
            where: { status: 'PENDING' }
          }),
          prisma.supportTicket.count({
            where: { status: { in: ['OPEN', 'IN_PROGRESS'] } }
          }),
          prisma.user.count({
            where: {
              createdAt: {
                gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          }),
          prisma.businessListing.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { viewCount: 'desc' },
            take: 5,
            select: {
              id: true,
              title: true,
              viewCount: true,
              category: true,
              askingPrice: true,
            }
          })
        ]);

        return {
          pendingListings,
          flaggedContent,
          openTickets,
          recentUsers,
          topListings,
          timestamp: new Date().toISOString()
        };
      },
      { ttl: 300 } // 5 minutes
    );
  }

  // Bulk operations for admin efficiency
  async bulkUpdateListingStatus(listingIds: string[], status: string, adminId: string) {
    const transaction = await prisma.$transaction(async (tx) => {
      // Update listings
      const updated = await tx.businessListing.updateMany({
        where: { id: { in: listingIds } },
        data: { status }
      });

      // Log moderation actions
      const moderationLogs = listingIds.map(listingId => ({
        adminId,
        targetType: 'listing',
        targetId: listingId,
        action: status === 'ACTIVE' ? 'APPROVE' : 'REJECT',
        notes: `Bulk ${status.toLowerCase()} operation`,
      }));

      await tx.moderationAction_Log.createMany({
        data: moderationLogs
      });

      return updated;
    });

    // Invalidate caches
    await Promise.all([
      cacheService.del('admin-overview'),
      cacheService.del('featured-listings'),
      ...listingIds.map(id => cacheService.del(`listing:${id}`))
    ]);

    return transaction;
  }

  // Performance monitoring query
  async getSlowQueries(limit: number = 10) {
    return prisma.performanceMetrics.findMany({
      where: {
        responseTime: { gt: 1000 }, // Queries taking more than 1 second
        timestamp: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      orderBy: { responseTime: 'desc' },
      take: limit,
      select: {
        endpoint: true,
        httpMethod: true,
        responseTime: true,
        timestamp: true,
        userId: true,
      }
    });
  }
}

export const optimizedQueries = new OptimizedQueryService();