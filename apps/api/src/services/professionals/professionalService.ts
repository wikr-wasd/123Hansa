import { PrismaClient, ServiceCategory, ProfessionalVerificationStatus, UserRole } from '@prisma/client';
import { CustomError } from '../../utils/customError';

const prisma = new PrismaClient();

interface SearchProfessionalsParams {
  category?: ServiceCategory;
  location?: string;
  priceMin?: number;
  priceMax?: number;
  rating?: number;
  verified?: boolean;
  languages?: string[];
  availability?: 'immediate' | 'this_week' | 'this_month';
  sortBy?: 'rating' | 'price' | 'experience' | 'recent';
  limit?: number;
  offset?: number;
}

interface CreateProfessionalProfileData {
  userId: string;
  businessName?: string;
  registrationNumber?: string;
  vatNumber?: string;
  professionalTitle: string;
  serviceCategories: ServiceCategory[];
  specializations: string[];
  languages: string[];
  credentials: any;
  experience: any;
  hourlyRate?: number;
  consultationFee?: number;
  bio?: string;
  workingHours?: any;
}

export class ProfessionalService {
  /**
   * Search for professionals based on criteria
   */
  static async searchProfessionals(params: SearchProfessionalsParams) {
    const {
      category,
      location,
      priceMin,
      priceMax,
      rating,
      verified,
      languages,
      availability,
      sortBy = 'rating',
      limit = 20,
      offset = 0
    } = params;

    // Build where clause
    const whereClause: any = {
      isActive: true,
      user: {
        isActive: true,
        role: {
          in: [
            UserRole.LEGAL_ADVISOR,
            UserRole.BUSINESS_BROKER,
            UserRole.ACCOUNTANT,
            UserRole.FINANCIAL_ADVISOR,
            UserRole.CONSULTANT,
            UserRole.VALUATION_EXPERT
          ]
        }
      }
    };

    // Filter by category
    if (category) {
      whereClause.serviceCategories = {
        has: category
      };
    }

    // Filter by verification status
    if (verified) {
      whereClause.verificationStatus = ProfessionalVerificationStatus.VERIFIED;
    }

    // Filter by hourly rate
    if (priceMin || priceMax) {
      whereClause.hourlyRate = {};
      if (priceMin) whereClause.hourlyRate.gte = priceMin;
      if (priceMax) whereClause.hourlyRate.lte = priceMax;
    }

    // Filter by rating
    if (rating) {
      whereClause.averageRating = {
        gte: rating
      };
    }

    // Filter by languages
    if (languages && languages.length > 0) {
      whereClause.languages = {
        hasSome: languages
      };
    }

    // Filter by location (user's country or city)
    if (location) {
      whereClause.user = {
        ...whereClause.user,
        OR: [
          { country: location },
          { companyName: { contains: location, mode: 'insensitive' } }
        ]
      };
    }

    // Determine sort order
    let orderBy: any = {};
    switch (sortBy) {
      case 'rating':
        orderBy = { averageRating: 'desc' };
        break;
      case 'price':
        orderBy = { hourlyRate: 'asc' };
        break;
      case 'experience':
        orderBy = { totalBookings: 'desc' };
        break;
      case 'recent':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { averageRating: 'desc' };
    }

    const professionals = await prisma.professionalProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
            avatar: true,
            companyName: true,
            linkedinProfile: true,
            isOnline: true,
            lastSeenAt: true
          }
        },
        serviceListings: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
            category: true,
            basePrice: true,
            currency: true,
            estimatedDuration: true
          },
          take: 3
        },
        reviews: {
          where: { isApproved: true },
          select: {
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          },
          take: 3,
          orderBy: { createdAt: 'desc' }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.professionalProfile.count({
      where: whereClause
    });

    return {
      professionals,
      totalCount,
      hasMore: offset + limit < totalCount
    };
  }

  /**
   * Get professional profile by ID
   */
  static async getProfessionalById(professionalId: string) {
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
            avatar: true,
            companyName: true,
            linkedinProfile: true,
            website: true,
            isOnline: true,
            lastSeenAt: true,
            createdAt: true
          }
        },
        serviceListings: {
          where: { isActive: true },
          include: {
            _count: {
              select: {
                bookings: true
              }
            }
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
          orderBy: { createdAt: 'desc' }
        },
        _count: {
          select: {
            serviceListings: true,
            bookings: true,
            reviews: true
          }
        }
      }
    });

    if (!professional) {
      throw new CustomError('Professional not found', 404);
    }

    return professional;
  }

  /**
   * Create professional profile
   */
  static async createProfessionalProfile(data: CreateProfessionalProfileData) {
    // Verify user exists and has appropriate role
    const user = await prisma.user.findUnique({
      where: { id: data.userId }
    });

    if (!user) {
      throw new CustomError('User not found', 404);
    }

    const professionalRoles = [
      UserRole.LEGAL_ADVISOR,
      UserRole.BUSINESS_BROKER,
      UserRole.ACCOUNTANT,
      UserRole.FINANCIAL_ADVISOR,
      UserRole.CONSULTANT,
      UserRole.VALUATION_EXPERT
    ];

    if (!professionalRoles.includes(user.role)) {
      throw new CustomError('User must have a professional role', 400);
    }

    // Check if profile already exists
    const existingProfile = await prisma.professionalProfile.findUnique({
      where: { userId: data.userId }
    });

    if (existingProfile) {
      throw new CustomError('Professional profile already exists', 400);
    }

    const profile = await prisma.professionalProfile.create({
      data: {
        userId: data.userId,
        businessName: data.businessName,
        registrationNumber: data.registrationNumber,
        vatNumber: data.vatNumber,
        professionalTitle: data.professionalTitle,
        serviceCategories: data.serviceCategories,
        specializations: data.specializations,
        languages: data.languages,
        credentials: data.credentials,
        experience: data.experience,
        hourlyRate: data.hourlyRate,
        consultationFee: data.consultationFee,
        bio: data.bio,
        workingHours: data.workingHours
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
            avatar: true
          }
        }
      }
    });

    return profile;
  }

  /**
   * Update professional profile
   */
  static async updateProfessionalProfile(professionalId: string, data: Partial<CreateProfessionalProfileData>) {
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: professionalId }
    });

    if (!profile) {
      throw new CustomError('Professional profile not found', 404);
    }

    const updatedProfile = await prisma.professionalProfile.update({
      where: { id: professionalId },
      data: {
        ...data,
        updatedAt: new Date()
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            country: true,
            avatar: true
          }
        }
      }
    });

    return updatedProfile;
  }

  /**
   * Get professional's availability
   */
  static async getProfessionalAvailability(professionalId: string, fromDate?: Date, toDate?: Date) {
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      select: {
        workingHours: true,
        unavailablePeriods: true,
        timezone: true
      }
    });

    if (!professional) {
      throw new CustomError('Professional not found', 404);
    }

    // Get existing bookings for the period
    const startDate = fromDate || new Date();
    const endDate = toDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days ahead

    const existingBookings = await prisma.serviceBooking.findMany({
      where: {
        professionalId,
        status: {
          in: ['CONFIRMED', 'IN_PROGRESS']
        },
        confirmedStartDate: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        confirmedStartDate: true,
        estimatedEndDate: true,
        consultationFormat: true
      }
    });

    return {
      workingHours: professional.workingHours,
      unavailablePeriods: professional.unavailablePeriods,
      timezone: professional.timezone,
      existingBookings
    };
  }

  /**
   * Submit professional for verification
   */
  static async submitForVerification(professionalId: string, documents: any[]) {
    const profile = await prisma.professionalProfile.findUnique({
      where: { id: professionalId }
    });

    if (!profile) {
      throw new CustomError('Professional profile not found', 404);
    }

    if (profile.verificationStatus === ProfessionalVerificationStatus.VERIFIED) {
      throw new CustomError('Professional is already verified', 400);
    }

    const updatedProfile = await prisma.professionalProfile.update({
      where: { id: professionalId },
      data: {
        verificationStatus: ProfessionalVerificationStatus.PENDING,
        verificationDocuments: { documents }
      }
    });

    // TODO: Trigger admin notification for verification review

    return updatedProfile;
  }

  /**
   * Get service categories with professional counts
   */
  static async getServiceCategoriesWithCounts() {
    const categories = await prisma.professionalProfile.groupBy({
      by: ['serviceCategories'],
      where: {
        isActive: true,
        verificationStatus: ProfessionalVerificationStatus.VERIFIED
      },
      _count: {
        serviceCategories: true
      }
    });

    // Process the grouped results to count professionals per category
    const categoryStats: { [key: string]: number } = {};
    
    categories.forEach(item => {
      item.serviceCategories.forEach(category => {
        categoryStats[category] = (categoryStats[category] || 0) + 1;
      });
    });

    return Object.entries(ServiceCategory).map(([key, value]) => ({
      category: value,
      name: key,
      count: categoryStats[value] || 0
    }));
  }

  /**
   * Update professional statistics (called after booking completion)
   */
  static async updateProfessionalStats(professionalId: string) {
    const stats = await prisma.serviceBooking.aggregate({
      where: {
        professionalId,
        status: 'COMPLETED'
      },
      _count: { id: true }
    });

    const reviews = await prisma.professionalReview.aggregate({
      where: {
        professionalId,
        isApproved: true
      },
      _count: { id: true },
      _avg: { rating: true }
    });

    await prisma.professionalProfile.update({
      where: { id: professionalId },
      data: {
        completedBookings: stats._count.id,
        totalReviews: reviews._count.id,
        averageRating: reviews._avg.rating
      }
    });
  }
}