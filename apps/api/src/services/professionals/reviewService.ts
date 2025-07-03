import { PrismaClient } from '@prisma/client';
import { CustomError } from '../../utils/customError';
import { NotificationService } from '../notificationService';

const prisma = new PrismaClient();

interface CreateReviewData {
  bookingId: string;
  clientId: string;
  professionalId: string;
  rating: number;
  title?: string;
  comment?: string;
  communicationRating?: number;
  expertiseRating?: number;
  timelinessRating?: number;
  valueRating?: number;
  wouldRecommend: boolean;
  isAnonymous: boolean;
}

interface ProfessionalResponseData {
  professionalResponse: string;
}

export class ReviewService {
  /**
   * Create a review for a completed booking
   */
  static async createReview(data: CreateReviewData) {
    // Verify booking exists and is completed
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: data.bookingId },
      include: {
        client: true,
        professional: {
          include: {
            professionalProfile: true
          }
        }
      }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.status !== 'COMPLETED') {
      throw new CustomError('Can only review completed bookings', 400);
    }

    if (booking.clientId !== data.clientId) {
      throw new CustomError('Unauthorized to review this booking', 403);
    }

    if (booking.professionalId !== data.professionalId) {
      throw new CustomError('Professional ID mismatch', 400);
    }

    // Check if review already exists
    const existingReview = await prisma.professionalReview.findUnique({
      where: { bookingId: data.bookingId }
    });

    if (existingReview) {
      throw new CustomError('Review already exists for this booking', 400);
    }

    // Validate rating values
    if (data.rating < 1 || data.rating > 5) {
      throw new CustomError('Rating must be between 1 and 5', 400);
    }

    const ratingFields = [
      data.communicationRating,
      data.expertiseRating,
      data.timelinessRating,
      data.valueRating
    ];

    for (const rating of ratingFields) {
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        throw new CustomError('All ratings must be between 1 and 5', 400);
      }
    }

    const review = await prisma.professionalReview.create({
      data: {
        bookingId: data.bookingId,
        clientId: data.clientId,
        professionalId: data.professionalId,
        rating: data.rating,
        title: data.title,
        comment: data.comment,
        communicationRating: data.communicationRating,
        expertiseRating: data.expertiseRating,
        timelinessRating: data.timelinessRating,
        valueRating: data.valueRating,
        wouldRecommend: data.wouldRecommend,
        isAnonymous: data.isAnonymous,
        isVerified: true // Since it's from a completed booking
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        booking: {
          select: {
            title: true,
            completedAt: true
          }
        }
      }
    });

    // Update professional's average rating and review count
    await this.updateProfessionalRatingStats(data.professionalId);

    // Notify professional of new review
    await NotificationService.createNotification({
      userId: data.professionalId,
      type: 'SYSTEM',
      title: 'Ny recension',
      content: `Du har fått en ny ${data.rating}-stjärnig recension ${data.title ? `för "${data.title}"` : ''}`,
      data: { reviewId: review.id, bookingId: data.bookingId },
      channel: 'IN_APP'
    });

    return review;
  }

  /**
   * Professional responds to a review
   */
  static async respondToReview(reviewId: string, professionalId: string, data: ProfessionalResponseData) {
    const review = await prisma.professionalReview.findUnique({
      where: { id: reviewId },
      include: {
        client: true
      }
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    if (review.professionalId !== professionalId) {
      throw new CustomError('Unauthorized to respond to this review', 403);
    }

    if (review.professionalResponse) {
      throw new CustomError('Review has already been responded to', 400);
    }

    const updatedReview = await prisma.professionalReview.update({
      where: { id: reviewId },
      data: {
        professionalResponse: data.professionalResponse,
        respondedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true
              }
            }
          }
        }
      }
    });

    // Notify client of professional response
    await NotificationService.createNotification({
      userId: review.clientId,
      type: 'SYSTEM',
      title: 'Svar på din recension',
      content: `${updatedReview.professional?.firstName} ${updatedReview.professional?.lastName} har svarat på din recension`,
      data: { reviewId: reviewId },
      channel: 'IN_APP'
    });

    return updatedReview;
  }

  /**
   * Get reviews for a professional
   */
  static async getProfessionalReviews(
    professionalId: string, 
    options: {
      limit?: number;
      offset?: number;
      rating?: number;
      includeAnonymous?: boolean;
      sortBy?: 'date' | 'rating';
    } = {}
  ) {
    const {
      limit = 20,
      offset = 0,
      rating,
      includeAnonymous = true,
      sortBy = 'date'
    } = options;

    const whereClause: any = {
      professionalId,
      isApproved: true
    };

    if (rating) {
      whereClause.rating = rating;
    }

    if (!includeAnonymous) {
      whereClause.isAnonymous = false;
    }

    const orderBy = sortBy === 'rating' 
      ? { rating: 'desc' as const }
      : { createdAt: 'desc' as const };

    const reviews = await prisma.professionalReview.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        booking: {
          select: {
            title: true,
            completedAt: true,
            serviceListingId: true,
            serviceListing: {
              select: {
                title: true,
                category: true
              }
            }
          }
        }
      },
      orderBy,
      take: limit,
      skip: offset
    });

    const totalCount = await prisma.professionalReview.count({
      where: whereClause
    });

    return {
      reviews,
      totalCount,
      hasMore: offset + limit < totalCount
    };
  }

  /**
   * Get review by ID
   */
  static async getReviewById(reviewId: string) {
    const review = await prisma.professionalReview.findUnique({
      where: { id: reviewId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true
              }
            }
          }
        },
        booking: {
          select: {
            title: true,
            completedAt: true,
            serviceListing: {
              select: {
                title: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    return review;
  }

  /**
   * Get reviews written by a client
   */
  static async getClientReviews(clientId: string) {
    const reviews = await prisma.professionalReview.findMany({
      where: { clientId },
      include: {
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true
              }
            }
          }
        },
        booking: {
          select: {
            title: true,
            completedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return reviews;
  }

  /**
   * Get professional's review statistics
   */
  static async getProfessionalReviewStats(professionalId: string) {
    const stats = await prisma.professionalReview.aggregate({
      where: {
        professionalId,
        isApproved: true
      },
      _count: { id: true },
      _avg: {
        rating: true,
        communicationRating: true,
        expertiseRating: true,
        timelinessRating: true,
        valueRating: true
      }
    });

    const ratingDistribution = await prisma.professionalReview.groupBy({
      by: ['rating'],
      where: {
        professionalId,
        isApproved: true
      },
      _count: {
        rating: true
      }
    });

    const recommendationCount = await prisma.professionalReview.count({
      where: {
        professionalId,
        isApproved: true,
        wouldRecommend: true
      }
    });

    const recommendationRate = stats._count.id > 0 
      ? (recommendationCount / stats._count.id) * 100 
      : 0;

    return {
      totalReviews: stats._count.id,
      averageRating: stats._avg.rating,
      averageRatings: {
        communication: stats._avg.communicationRating,
        expertise: stats._avg.expertiseRating,
        timeliness: stats._avg.timelinessRating,
        value: stats._avg.valueRating
      },
      ratingDistribution: ratingDistribution.reduce((acc, item) => {
        acc[item.rating] = item._count.rating;
        return acc;
      }, {} as Record<number, number>),
      recommendationRate
    };
  }

  /**
   * Update professional's rating statistics
   */
  private static async updateProfessionalRatingStats(professionalId: string) {
    const stats = await prisma.professionalReview.aggregate({
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
        totalReviews: stats._count.id,
        averageRating: stats._avg.rating
      }
    });
  }

  /**
   * Flag review for moderation
   */
  static async flagReview(reviewId: string, reason: string, reportedBy: string) {
    const review = await prisma.professionalReview.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      throw new CustomError('Review not found', 404);
    }

    // For now, just update the review as flagged
    // In a full implementation, you'd create a separate moderation table
    await prisma.professionalReview.update({
      where: { id: reviewId },
      data: {
        isApproved: false,
        moderatedAt: new Date(),
        moderatedBy: reportedBy
      }
    });

    // TODO: Notify moderators
    return { success: true };
  }

  /**
   * Get pending reviews for moderation (admin only)
   */
  static async getPendingReviews() {
    const reviews = await prisma.professionalReview.findMany({
      where: {
        isApproved: false,
        moderatedAt: null
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true
              }
            }
          }
        },
        booking: {
          select: {
            title: true,
            completedAt: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return reviews;
  }

  /**
   * Moderate review (admin only)
   */
  static async moderateReview(reviewId: string, approved: boolean, moderatorId: string) {
    const review = await prisma.professionalReview.update({
      where: { id: reviewId },
      data: {
        isApproved: approved,
        moderatedAt: new Date(),
        moderatedBy: moderatorId
      }
    });

    // Update professional stats if approved
    if (approved) {
      await this.updateProfessionalRatingStats(review.professionalId);
    }

    return review;
  }
}