import { PrismaClient, ServiceCategory, ServiceType, ConsultationFormat } from '@prisma/client';
import { CustomError } from '../../utils/customError';

const prisma = new PrismaClient();

interface SearchServiceListingsParams {
  category?: ServiceCategory;
  serviceType?: ServiceType;
  priceMin?: number;
  priceMax?: number;
  consultationFormat?: ConsultationFormat;
  location?: string;
  keywords?: string;
  verified?: boolean;
  sortBy?: 'price' | 'rating' | 'popularity' | 'recent';
  limit?: number;
  offset?: number;
}

interface CreateServiceListingData {
  professionalId: string;
  userId: string;
  title: string;
  description: string;
  shortDescription?: string;
  category: ServiceCategory;
  serviceType: ServiceType;
  basePrice: number;
  pricingModel?: string;
  minimumEngagement?: number;
  estimatedDuration?: string;
  deliverables: string[];
  prerequisites: string[];
  consultationFormats: ConsultationFormat[];
  tags: string[];
  searchKeywords: string[];
  maxConcurrentJobs?: number;
  leadTime?: number;
}

export class ServiceListingService {
  /**
   * Search service listings
   */
  static async searchServiceListings(params: SearchServiceListingsParams) {
    const {
      category,
      serviceType,
      priceMin,
      priceMax,
      consultationFormat,
      location,
      keywords,
      verified,
      sortBy = 'rating',
      limit = 20,
      offset = 0
    } = params;

    // Build where clause
    const whereClause: any = {
      isActive: true,
      professional: {
        isActive: true,
        user: {
          isActive: true
        }
      }
    };

    // Filter by category
    if (category) {
      whereClause.category = category;
    }

    // Filter by service type
    if (serviceType) {
      whereClause.serviceType = serviceType;
    }

    // Filter by consultation format
    if (consultationFormat) {
      whereClause.consultationFormats = {
        has: consultationFormat
      };
    }

    // Filter by price range
    if (priceMin || priceMax) {
      whereClause.basePrice = {};
      if (priceMin) whereClause.basePrice.gte = priceMin;
      if (priceMax) whereClause.basePrice.lte = priceMax;
    }

    // Filter by verified professionals
    if (verified) {
      whereClause.professional.verificationStatus = 'VERIFIED';
    }

    // Filter by location (professional's location)
    if (location) {
      whereClause.professional.user = {
        ...whereClause.professional.user,
        OR: [
          { country: location },
          { companyName: { contains: location, mode: 'insensitive' } }
        ]
      };
    }

    // Filter by keywords
    if (keywords) {
      const keywordTerms = keywords.split(' ').filter(term => term.length > 2);
      if (keywordTerms.length > 0) {
        whereClause.OR = [
          {
            title: {
              contains: keywords,
              mode: 'insensitive'
            }
          },
          {
            description: {
              contains: keywords,
              mode: 'insensitive'
            }
          },
          {
            tags: {
              hasSome: keywordTerms
            }
          },
          {
            searchKeywords: {
              hasSome: keywordTerms
            }
          }
        ];
      }
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { basePrice: 'asc' };
        break;
      case 'rating':
        orderBy = { professional: { averageRating: 'desc' } };
        break;
      case 'popularity':
        orderBy = { bookingCount: 'desc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { professional: { averageRating: 'desc' } };
    }

    const services = await prisma.serviceListing.findMany({
      where: whereClause,
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                country: true,
                isOnline: true,
                lastSeenAt: true
              }
            }
          }
        },
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.serviceListing.count({
      where: whereClause
    });

    return {
      services,
      totalCount,
      hasMore: offset + limit < totalCount
    };
  }

  /**
   * Get service listing by ID
   */
  static async getServiceListingById(serviceId: string, userId?: string) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                country: true,
                companyName: true,
                linkedinProfile: true,
                website: true,
                isOnline: true,
                lastSeenAt: true,
                createdAt: true
              }
            },
            reviews: {
              where: { isApproved: true },
              include: {
                client: {
                  select: {
                    firstName: true,
                    lastName: true,
                    avatar: true
                  }
                }
              },
              orderBy: { createdAt: 'desc' },
              take: 5
            }
          }
        },
        bookings: {
          where: {
            status: 'COMPLETED'
          },
          select: {
            id: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            },
            completedAt: true
          },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            consultationRequests: true
          }
        }
      }
    });

    if (!service) {
      throw new CustomError('Service listing not found', 404);
    }

    // Increment view count if not the owner
    if (userId && userId !== service.userId) {
      await prisma.serviceListing.update({
        where: { id: serviceId },
        data: {
          viewCount: {
            increment: 1
          }
        }
      });
    }

    return service;
  }

  /**
   * Create service listing
   */
  static async createServiceListing(data: CreateServiceListingData) {
    // Verify professional exists
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: data.professionalId },
      include: {
        user: true
      }
    });

    if (!professional) {
      throw new CustomError('Professional profile not found', 404);
    }

    if (professional.userId !== data.userId) {
      throw new CustomError('Unauthorized to create listing for this professional', 403);
    }

    if (!professional.isActive) {
      throw new CustomError('Professional profile is not active', 400);
    }

    const service = await prisma.serviceListing.create({
      data: {
        professionalId: data.professionalId,
        userId: data.userId,
        title: data.title,
        description: data.description,
        shortDescription: data.shortDescription,
        category: data.category,
        serviceType: data.serviceType,
        basePrice: data.basePrice,
        pricingModel: data.pricingModel || 'HOURLY',
        minimumEngagement: data.minimumEngagement,
        estimatedDuration: data.estimatedDuration,
        deliverables: data.deliverables,
        prerequisites: data.prerequisites,
        consultationFormats: data.consultationFormats,
        tags: data.tags,
        searchKeywords: data.searchKeywords,
        maxConcurrentJobs: data.maxConcurrentJobs,
        leadTime: data.leadTime
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return service;
  }

  /**
   * Update service listing
   */
  static async updateServiceListing(serviceId: string, userId: string, data: Partial<CreateServiceListingData>) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new CustomError('Service listing not found', 404);
    }

    if (service.userId !== userId) {
      throw new CustomError('Unauthorized to update this service listing', 403);
    }

    const updatedService = await prisma.serviceListing.update({
      where: { id: serviceId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        }
      }
    });

    return updatedService;
  }

  /**
   * Delete service listing
   */
  static async deleteServiceListing(serviceId: string, userId: string) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId }
    });

    if (!service) {
      throw new CustomError('Service listing not found', 404);
    }

    if (service.userId !== userId) {
      throw new CustomError('Unauthorized to delete this service listing', 403);
    }

    // Check for active bookings
    const activeBookings = await prisma.serviceBooking.count({
      where: {
        serviceListingId: serviceId,
        status: {
          in: ['PENDING', 'CONFIRMED', 'IN_PROGRESS']
        }
      }
    });

    if (activeBookings > 0) {
      throw new CustomError('Cannot delete service with active bookings', 400);
    }

    await prisma.serviceListing.update({
      where: { id: serviceId },
      data: {
        isActive: false
      }
    });

    return { success: true };
  }

  /**
   * Get similar services
   */
  static async getSimilarServices(serviceId: string, limit = 5) {
    const service = await prisma.serviceListing.findUnique({
      where: { id: serviceId },
      select: {
        category: true,
        serviceType: true,
        tags: true,
        basePrice: true
      }
    });

    if (!service) {
      throw new CustomError('Service not found', 404);
    }

    const priceRange = service.basePrice * 0.3; // 30% price range

    const similarServices = await prisma.serviceListing.findMany({
      where: {
        id: { not: serviceId },
        isActive: true,
        OR: [
          { category: service.category },
          { serviceType: service.serviceType },
          {
            tags: {
              hasSome: service.tags
            }
          },
          {
            basePrice: {
              gte: service.basePrice - priceRange,
              lte: service.basePrice + priceRange
            }
          }
        ],
        professional: {
          isActive: true,
          verificationStatus: 'VERIFIED'
        }
      },
      include: {
        professional: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
                isOnline: true
              }
            }
          }
        }
      },
      orderBy: {
        professional: {
          averageRating: 'desc'
        }
      },
      take: limit
    });

    return similarServices;
  }

  /**
   * Get professional's service listings
   */
  static async getProfessionalServices(professionalId: string, includeInactive = false) {
    const whereClause: any = {
      professionalId
    };

    if (!includeInactive) {
      whereClause.isActive = true;
    }

    const services = await prisma.serviceListing.findMany({
      where: whereClause,
      include: {
        _count: {
          select: {
            bookings: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return services;
  }

  /**
   * Get service categories with counts
   */
  static async getServiceCategoriesWithCounts() {
    const categoryCounts = await prisma.serviceListing.groupBy({
      by: ['category'],
      where: {
        isActive: true,
        professional: {
          isActive: true,
          verificationStatus: 'VERIFIED'
        }
      },
      _count: {
        category: true
      }
    });

    return categoryCounts.map(item => ({
      category: item.category,
      count: item._count.category
    }));
  }

  /**
   * Update service statistics
   */
  static async updateServiceStats(serviceId: string) {
    const bookingStats = await prisma.serviceBooking.aggregate({
      where: {
        serviceListingId: serviceId
      },
      _count: { id: true }
    });

    const inquiryStats = await prisma.consultationRequest.aggregate({
      where: {
        serviceListingId: serviceId
      },
      _count: { id: true }
    });

    await prisma.serviceListing.update({
      where: { id: serviceId },
      data: {
        bookingCount: bookingStats._count.id,
        inquiryCount: inquiryStats._count.id
      }
    });
  }
}