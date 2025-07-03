import { prisma } from '@/config/database';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import {
  CreateListingRequest,
  UpdateListingRequest,
  SearchListingsRequest,
} from '@/validators/listing';
import { Prisma } from '@prisma/client';

export class ListingService {
  /**
   * Create a new business listing
   */
  static async createListing(userId: string, data: CreateListingRequest) {
    try {
      const listing = await prisma.businessListing.create({
        data: {
          userId,
          title: data.title,
          description: data.description,
          shortDescription: data.shortDescription,
          category: data.category,
          subcategory: data.subcategory,
          businessType: data.businessType,
          askingPrice: data.askingPrice,
          currency: data.currency,
          isNegotiable: data.isNegotiable,
          monthlyRevenue: data.monthlyRevenue,
          monthlyProfit: data.monthlyProfit,
          employees: data.employees,
          establishedYear: data.establishedYear,
          website: data.website,
          location: data.location,
          isRemote: data.isRemote,
          reasonForSale: data.reasonForSale,
          includedAssets: data.includedAssets,
          status: 'DRAFT',
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              country: true,
            },
          },
          documents: true,
        },
      });

      logger.info(`Listing created: ${listing.id} by user: ${userId}`);
      return listing;
    } catch (error) {
      logger.error('Create listing error:', error);
      throw error;
    }
  }

  /**
   * Get listing by ID
   */
  static async getListingById(id: string, userId?: string) {
    try {
      const listing = await prisma.businessListing.findUnique({
        where: { id },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              country: true,
              createdAt: true,
            },
          },
          images: {
            orderBy: { order: 'asc' },
          },
          documents: {
            where: userId ? { isPublic: true } : undefined,
          },
          savedBy: userId ? {
            where: { userId },
            select: { id: true },
          } : false,
        },
      });

      if (!listing) {
        throw createError.notFound('Listing not found');
      }

      // Check if listing is active or user is owner
      if (listing.status !== 'ACTIVE' && listing.ownerId !== userId) {
        throw createError.forbidden('Listing not available');
      }

      // Increment view count if not owner
      if (userId && listing.userId !== userId) {
        await prisma.businessListing.update({
          where: { id },
          data: { viewCount: { increment: 1 } },
        });
      }

      return listing;
    } catch (error) {
      logger.error('Get listing error:', error);
      throw error;
    }
  }

  /**
   * Update listing
   */
  static async updateListing(id: string, userId: string, data: UpdateListingRequest) {
    try {
      // Check if user owns the listing
      const existingListing = await prisma.businessListing.findUnique({
        where: { id },
        select: { userId: true, status: true },
      });

      if (!existingListing) {
        throw createError.notFound('Listing not found');
      }

      if (existingListing.userId !== userId) {
        throw createError.forbidden('You can only update your own listings');
      }

      // Don't allow editing sold listings
      if (existingListing.status === 'SOLD') {
        throw createError.badRequest('Cannot edit sold listings');
      }

      const updatedListing = await prisma.businessListing.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
        include: {
          owner: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              country: true,
            },
          },
          documents: true,
        },
      });

      logger.info(`Listing updated: ${id} by user: ${userId}`);
      return updatedListing;
    } catch (error) {
      logger.error('Update listing error:', error);
      throw error;
    }
  }

  /**
   * Delete listing
   */
  static async deleteListing(id: string, userId: string) {
    try {
      // Check if user owns the listing
      const existingListing = await prisma.businessListing.findUnique({
        where: { id },
        select: { userId: true, status: true },
      });

      if (!existingListing) {
        throw createError.notFound('Listing not found');
      }

      if (existingListing.userId !== userId) {
        throw createError.forbidden('You can only delete your own listings');
      }

      // Update status to REMOVED
      await prisma.businessListing.update({
        where: { id },
        data: {
          status: 'REMOVED',
        },
      });

      logger.info(`Listing deleted: ${id} by user: ${userId}`);
    } catch (error) {
      logger.error('Delete listing error:', error);
      throw error;
    }
  }

  /**
   * Search and filter listings
   */
  static async searchListings(params: SearchListingsRequest) {
    try {
      const {
        query,
        category,
        businessType,
        country,
        minPrice,
        maxPrice,
        currency,
        isRemote,
        sortBy,
        sortOrder,
        page,
        limit,
      } = params;

      // Build where clause
      const where: Prisma.BusinessListingWhereInput = {
        status: 'ACTIVE',
      };

      // Text search
      if (query) {
        where.OR = [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { shortDescription: { contains: query, mode: 'insensitive' } },
        ];
      }

      // Category filter
      if (category) {
        where.category = category;
      }

      // Business type filter
      if (businessType) {
        where.businessType = businessType;
      }

      // Country filter (through owner)
      if (country) {
        where.owner = {
          country,
        };
      }

      // Price range filter
      if (minPrice || maxPrice) {
        where.askingPrice = {};
        if (minPrice) where.askingPrice.gte = minPrice;
        if (maxPrice) where.askingPrice.lte = maxPrice;
      }

      // Currency filter
      if (currency) {
        where.currency = currency;
      }

      // Remote filter
      if (isRemote !== undefined) {
        where.isRemote = isRemote;
      }

      // Build order by clause
      const orderBy: Prisma.BusinessListingOrderByWithRelationInput = {};
      if (sortBy === 'askingPrice' || sortBy === 'monthlyRevenue') {
        orderBy[sortBy] = sortOrder;
      } else if (sortBy === 'viewCount' || sortBy === 'inquiryCount') {
        orderBy[sortBy] = sortOrder;
      } else if (sortBy === 'newest' || sortBy === 'createdAt') {
        orderBy.createdAt = sortOrder;
      } else {
        orderBy.createdAt = sortOrder;
      }

      // Calculate offset
      const offset = (page - 1) * limit;

      // Execute query
      const [listings, total] = await Promise.all([
        prisma.businessListing.findMany({
          where,
          include: {
            owner: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                country: true,
              },
            },
          },
          orderBy,
          skip: offset,
          take: limit,
        }),
        prisma.businessListing.count({ where }),
      ]);

      const totalPages = Math.ceil(total / limit);
      const hasNext = page < totalPages;
      const hasPrev = page > 1;

      return {
        listings,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext,
          hasPrev,
        },
      };
    } catch (error) {
      logger.error('Search listings error:', error);
      throw error;
    }
  }

  /**
   * Get user's listings
   */
  static async getUserListings(userId: string, status?: string) {
    try {
      const where: Prisma.BusinessListingWhereInput = {
        userId,
      };

      if (status) {
        where.status = status as any;
      }

      const listings = await prisma.businessListing.findMany({
        where,
        include: {
          images: {
            where: { isMain: true },
            take: 1,
          },
          _count: {
            select: {
              savedBy: true,
            },
          },
        },
        orderBy: { updatedAt: 'desc' },
      });

      return listings;
    } catch (error) {
      logger.error('Get user listings error:', error);
      throw error;
    }
  }

  /**
   * Publish listing (change from draft to pending review)
   */
  static async publishListing(id: string, userId: string) {
    try {
      const listing = await prisma.businessListing.findUnique({
        where: { id },
        select: { userId: true, status: true },
      });

      if (!listing) {
        throw createError.notFound('Listing not found');
      }

      if (listing.userId !== userId) {
        throw createError.forbidden('You can only publish your own listings');
      }

      if (listing.status !== 'DRAFT') {
        throw createError.badRequest('Only draft listings can be published');
      }

      const updatedListing = await prisma.businessListing.update({
        where: { id },
        data: {
          status: 'PENDING_REVIEW',
          publishedAt: new Date(),
        },
      });

      logger.info(`Listing published: ${id} by user: ${userId}`);
      return updatedListing;
    } catch (error) {
      logger.error('Publish listing error:', error);
      throw error;
    }
  }

  /**
   * Save/unsave listing
   */
  static async toggleSaveListing(listingId: string, userId: string) {
    try {
      // Check if listing exists and is active
      const listing = await prisma.businessListing.findUnique({
        where: { id: listingId, status: 'ACTIVE' },
        select: { id: true, userId: true },
      });

      if (!listing) {
        throw createError.notFound('Listing not found');
      }

      if (listing.userId === userId) {
        throw createError.badRequest('You cannot save your own listing');
      }

      // Check if already saved
      const existingSave = await prisma.savedListing.findUnique({
        where: {
          userId_listingId: {
            userId,
            listingId,
          },
        },
      });

      if (existingSave) {
        // Unsave
        await prisma.savedListing.delete({
          where: {
            userId_listingId: {
              userId,
              listingId,
            },
          },
        });
        return { saved: false };
      } else {
        // Save
        await prisma.savedListing.create({
          data: {
            userId,
            listingId,
          },
        });
        return { saved: true };
      }
    } catch (error) {
      logger.error('Toggle save listing error:', error);
      throw error;
    }
  }

  /**
   * Get saved listings for user
   */
  static async getSavedListings(userId: string) {
    try {
      const savedListings = await prisma.savedListing.findMany({
        where: { userId },
        include: {
          listing: {
            include: {
              owner: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  country: true,
                        },
              },
              images: {
                where: { isMain: true },
                take: 1,
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      return savedListings.map(saved => saved.listing);
    } catch (error) {
      logger.error('Get saved listings error:', error);
      throw error;
    }
  }
}