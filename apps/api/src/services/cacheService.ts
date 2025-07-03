import Redis from 'redis';
import { config } from '@/config/app';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  json?: boolean; // Whether to JSON serialize/deserialize
}

class CacheService {
  private redis: Redis.RedisClientType | null = null;
  private memoryCache = new Map<string, { value: any; expires: number }>();
  private readonly defaultTTL = 300; // 5 minutes default

  constructor() {
    this.initializeRedis();
  }

  private async initializeRedis() {
    if (config.redisUrl) {
      try {
        this.redis = Redis.createClient({ url: config.redisUrl });
        await this.redis.connect();
        logger.info('✅ Redis cache connected successfully');
      } catch (error) {
        logger.warn('Redis connection failed, falling back to memory cache:', error);
        this.redis = null;
      }
    } else {
      logger.info('No Redis URL provided, using memory cache');
    }
  }

  async get<T = any>(key: string, options: CacheOptions = {}): Promise<T | null> {
    const { json = true } = options;

    try {
      let value: string | null = null;

      if (this.redis) {
        value = await this.redis.get(key);
      } else {
        // Memory cache fallback
        const cached = this.memoryCache.get(key);
        if (cached && cached.expires > Date.now()) {
          return cached.value;
        } else if (cached) {
          this.memoryCache.delete(key);
        }
        return null;
      }

      if (value === null) return null;

      return json ? JSON.parse(value) : value;
    } catch (error) {
      logger.error('Cache get error:', error);
      return null;
    }
  }

  async set(key: string, value: any, options: CacheOptions = {}): Promise<boolean> {
    const { ttl = this.defaultTTL, json = true } = options;

    try {
      const serializedValue = json ? JSON.stringify(value) : value;

      if (this.redis) {
        await this.redis.setEx(key, ttl, serializedValue);
      } else {
        // Memory cache fallback
        this.memoryCache.set(key, {
          value,
          expires: Date.now() + (ttl * 1000)
        });
        
        // Cleanup expired entries periodically
        if (this.memoryCache.size > 1000) {
          this.cleanupMemoryCache();
        }
      }

      return true;
    } catch (error) {
      logger.error('Cache set error:', error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.del(key);
      } else {
        this.memoryCache.delete(key);
      }
      return true;
    } catch (error) {
      logger.error('Cache delete error:', error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      if (this.redis) {
        await this.redis.flushAll();
      } else {
        this.memoryCache.clear();
      }
      return true;
    } catch (error) {
      logger.error('Cache clear error:', error);
      return false;
    }
  }

  private cleanupMemoryCache() {
    const now = Date.now();
    for (const [key, data] of this.memoryCache.entries()) {
      if (data.expires <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  // Utility methods for common cache patterns
  async getOrSet<T>(
    key: string,
    getter: () => Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = await this.get<T>(key, options);
    if (cached !== null) {
      return cached;
    }

    const value = await getter();
    await this.set(key, value, options);
    return value;
  }

  // Cache keys generator
  keys = {
    listing: (id: string) => `listing:${id}`,
    listings: (params: string) => `listings:${params}`,
    user: (id: string) => `user:${id}`,
    userListings: (userId: string) => `user_listings:${userId}`,
    featuredListings: () => 'featured_listings',
    categories: () => 'categories',
    regions: () => 'regions',
    platformStats: () => 'platform_stats',
    searchResults: (query: string) => `search:${Buffer.from(query).toString('base64')}`,
  };
}

// Database cache integration
export class DatabaseCacheService extends CacheService {
  async getCachedListings(page: number = 1, limit: number = 20, filters: any = {}) {
    const cacheKey = this.keys.listings(`page:${page}:limit:${limit}:${JSON.stringify(filters)}`);
    
    return this.getOrSet(
      cacheKey,
      async () => {
        const skip = (page - 1) * limit;
        const where = this.buildListingWhere(filters);
        
        const [listings, total] = await Promise.all([
          prisma.businessListing.findMany({
            where,
            skip,
            take: limit,
            orderBy: { publishedAt: 'desc' },
            include: {
              owner: {
                select: {
                  firstName: true,
                  lastName: true,
                  verificationLevel: true,
                }
              }
            }
          }),
          prisma.businessListing.count({ where })
        ]);

        return { listings, total, page, limit };
      },
      { ttl: 180 } // 3 minutes for listings
    );
  }

  async getCachedFeaturedListings() {
    return this.getOrSet(
      this.keys.featuredListings(),
      async () => {
        return prisma.businessListing.findMany({
          where: {
            status: 'ACTIVE',
            featured: true,
          },
          take: 10,
          orderBy: { publishedAt: 'desc' },
          include: {
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
      { ttl: 600 } // 10 minutes for featured listings
    );
  }

  async getCachedPlatformStats() {
    return this.getOrSet(
      this.keys.platformStats(),
      async () => {
        const [
          totalUsers,
          activeListings,
          totalListings,
          totalViews
        ] = await Promise.all([
          prisma.user.count({ where: { isActive: true } }),
          prisma.businessListing.count({ where: { status: 'ACTIVE' } }),
          prisma.businessListing.count(),
          prisma.businessListing.aggregate({
            _sum: { viewCount: true }
          })
        ]);

        return {
          totalUsers,
          activeListings,
          totalListings,
          totalViews: totalViews._sum.viewCount || 0,
          timestamp: new Date().toISOString(),
        };
      },
      { ttl: 1800 } // 30 minutes for platform stats
    );
  }

  private buildListingWhere(filters: any) {
    const where: any = { status: 'ACTIVE' };

    if (filters.category) where.category = filters.category;
    if (filters.region) where.region = filters.region;
    if (filters.minPrice) where.askingPrice = { gte: filters.minPrice };
    if (filters.maxPrice) {
      where.askingPrice = where.askingPrice || {};
      where.askingPrice.lte = filters.maxPrice;
    }
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  // Invalidate cache when data changes
  async invalidateListingCache(listingId?: string) {
    const patterns = [
      'listings:*',
      'featured_listings',
      'platform_stats',
    ];

    if (listingId) {
      patterns.push(this.keys.listing(listingId));
    }

    // Note: In production with Redis, you'd use SCAN with pattern matching
    // For now, we'll clear related caches manually
    for (const pattern of patterns) {
      if (pattern.includes('*')) {
        // Pattern matching would require Redis SCAN
        continue;
      }
      await this.del(pattern);
    }
  }
}

export const cacheService = new DatabaseCacheService();
export default cacheService;