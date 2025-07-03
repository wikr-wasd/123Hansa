import { PrismaClient, BookingStatus, ServiceType, ConsultationFormat, PaymentStatus } from '@prisma/client';
import { CustomError } from '../../utils/customError';
import { NotificationService } from '../notificationService';

const prisma = new PrismaClient();

interface CreateBookingData {
  clientId: string;
  professionalId: string;
  serviceListingId?: string;
  bookingType: ServiceType;
  consultationFormat: ConsultationFormat;
  title: string;
  description: string;
  requirements: string[];
  deliverables: string[];
  requestedStartDate?: Date;
  agreedPrice: number;
  hourlyRate?: number;
  estimatedHours?: number;
  clientNotes?: string;
  depositRequired?: boolean;
  depositAmount?: number;
}

interface UpdateBookingData {
  status?: BookingStatus;
  confirmedStartDate?: Date;
  estimatedEndDate?: Date;
  professionalNotes?: string;
  meetingLink?: string;
  meetingPassword?: string;
  meetingLocation?: string;
  contractSigned?: boolean;
  ndaSigned?: boolean;
}

export class BookingService {
  /**
   * Create a new service booking
   */
  static async createBooking(data: CreateBookingData) {
    // Verify client exists
    const client = await prisma.user.findUnique({
      where: { id: data.clientId }
    });

    if (!client) {
      throw new CustomError('Client not found', 404);
    }

    // Verify professional exists and is active
    const professional = await prisma.user.findUnique({
      where: { id: data.professionalId },
      include: {
        professionalProfile: true
      }
    });

    if (!professional || !professional.professionalProfile) {
      throw new CustomError('Professional not found', 404);
    }

    if (!professional.professionalProfile.isActive || !professional.professionalProfile.acceptsNewClients) {
      throw new CustomError('Professional is not accepting new clients', 400);
    }

    // Verify service listing if provided
    let serviceListing = null;
    if (data.serviceListingId) {
      serviceListing = await prisma.serviceListing.findUnique({
        where: { id: data.serviceListingId }
      });

      if (!serviceListing || !serviceListing.isActive) {
        throw new CustomError('Service listing not found or inactive', 404);
      }

      if (serviceListing.professionalId !== professional.professionalProfile.id) {
        throw new CustomError('Service listing does not belong to this professional', 400);
      }
    }

    // Calculate commission
    const platformCommission = 10.0; // 10% platform commission
    const commissionAmount = (data.agreedPrice * platformCommission) / 100;

    const booking = await prisma.serviceBooking.create({
      data: {
        clientId: data.clientId,
        professionalId: data.professionalId,
        serviceListingId: data.serviceListingId,
        bookingType: data.bookingType,
        consultationFormat: data.consultationFormat,
        title: data.title,
        description: data.description,
        requirements: data.requirements,
        deliverables: data.deliverables,
        requestedStartDate: data.requestedStartDate,
        agreedPrice: data.agreedPrice,
        hourlyRate: data.hourlyRate,
        estimatedHours: data.estimatedHours,
        clientNotes: data.clientNotes,
        depositRequired: data.depositRequired || false,
        depositAmount: data.depositAmount,
        platformCommission,
        commissionAmount,
        bookedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true
              }
            }
          }
        },
        serviceListing: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      }
    });

    // Send notification to professional
    await NotificationService.createNotification({
      userId: data.professionalId,
      type: 'SYSTEM', // We might need to add a BOOKING type
      title: 'Ny bokningsförfrågan',
      content: `${client.firstName} ${client.lastName} har skickat en bokningsförfrågan för "${data.title}"`,
      data: { bookingId: booking.id },
      channel: 'IN_APP'
    });

    // Update service listing inquiry count
    if (data.serviceListingId) {
      await prisma.serviceListing.update({
        where: { id: data.serviceListingId },
        data: {
          inquiryCount: {
            increment: 1
          }
        }
      });
    }

    return booking;
  }

  /**
   * Update booking status and details
   */
  static async updateBooking(bookingId: string, userId: string, data: UpdateBookingData) {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        client: true,
        professional: true
      }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check authorization
    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new CustomError('Unauthorized to update this booking', 403);
    }

    const updatedBooking = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        ...data,
        confirmedAt: data.status === BookingStatus.CONFIRMED ? new Date() : booking.confirmedAt,
        startedAt: data.status === BookingStatus.IN_PROGRESS ? new Date() : booking.startedAt,
        completedAt: data.status === BookingStatus.COMPLETED ? new Date() : booking.completedAt,
        cancelledAt: data.status === BookingStatus.CANCELLED ? new Date() : booking.cancelledAt,
        updatedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true
          }
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
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

    // Send status update notifications
    const notificationUserId = userId === booking.clientId ? booking.professionalId : booking.clientId;
    const statusMessages = {
      [BookingStatus.CONFIRMED]: 'Din bokning har bekräftats',
      [BookingStatus.IN_PROGRESS]: 'Din bokning har startat',
      [BookingStatus.COMPLETED]: 'Din bokning har slutförts',
      [BookingStatus.CANCELLED]: 'Din bokning har avbokats',
      [BookingStatus.RESCHEDULED]: 'Din bokning har ombokats'
    };

    if (data.status && statusMessages[data.status]) {
      await NotificationService.createNotification({
        userId: notificationUserId,
        type: 'SYSTEM',
        title: 'Bokningsstatus uppdaterad',
        content: statusMessages[data.status],
        data: { bookingId: booking.id },
        channel: 'IN_APP'
      });
    }

    // Update professional statistics if booking completed
    if (data.status === BookingStatus.COMPLETED) {
      await this.updateProfessionalStats(booking.professionalId);
      
      // Update service listing stats
      if (booking.serviceListingId) {
        await this.updateServiceStats(booking.serviceListingId);
      }
    }

    return updatedBooking;
  }

  /**
   * Get booking by ID
   */
  static async getBookingById(bookingId: string, userId?: string) {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phone: true,
            companyName: true
          }
        },
        professional: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            phone: true,
            companyName: true,
            linkedinProfile: true,
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true,
                timezone: true
              }
            }
          }
        },
        serviceListing: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true
          }
        },
        payments: true,
        review: true
      }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    // Check authorization if userId provided
    if (userId && booking.clientId !== userId && booking.professionalId !== userId) {
      throw new CustomError('Unauthorized to view this booking', 403);
    }

    return booking;
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(userId: string, role: 'client' | 'professional' = 'client', status?: BookingStatus) {
    const whereClause: any = {};
    
    if (role === 'client') {
      whereClause.clientId = userId;
    } else {
      whereClause.professionalId = userId;
    }

    if (status) {
      whereClause.status = status;
    }

    const bookings = await prisma.serviceBooking.findMany({
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
        serviceListing: {
          select: {
            id: true,
            title: true,
            category: true
          }
        },
        review: {
          select: {
            rating: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return bookings;
  }

  /**
   * Cancel booking
   */
  static async cancelBooking(bookingId: string, userId: string, reason: string) {
    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId }
    });

    if (!booking) {
      throw new CustomError('Booking not found', 404);
    }

    if (booking.clientId !== userId && booking.professionalId !== userId) {
      throw new CustomError('Unauthorized to cancel this booking', 403);
    }

    if (booking.status === BookingStatus.COMPLETED) {
      throw new CustomError('Cannot cancel completed booking', 400);
    }

    const updatedBooking = await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        cancellationReason: reason,
        cancelledBy: userId,
        cancelledAt: new Date()
      }
    });

    // Calculate refund if payment was made
    if (booking.paymentStatus === PaymentStatus.SUCCEEDED) {
      // TODO: Process refund based on cancellation policy
    }

    // Notify the other party
    const notificationUserId = userId === booking.clientId ? booking.professionalId : booking.clientId;
    await NotificationService.createNotification({
      userId: notificationUserId,
      type: 'SYSTEM',
      title: 'Bokning avbokad',
      content: `Bokningen "${booking.title}" har avbokats. Anledning: ${reason}`,
      data: { bookingId: booking.id },
      channel: 'IN_APP'
    });

    return updatedBooking;
  }

  /**
   * Get professional's schedule
   */
  static async getProfessionalSchedule(professionalId: string, fromDate: Date, toDate: Date) {
    const bookings = await prisma.serviceBooking.findMany({
      where: {
        professionalId,
        status: {
          in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
        },
        confirmedStartDate: {
          gte: fromDate,
          lte: toDate
        }
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
        serviceListing: {
          select: {
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        confirmedStartDate: 'asc'
      }
    });

    return bookings;
  }

  /**
   * Update professional statistics
   */
  private static async updateProfessionalStats(professionalId: string) {
    const stats = await prisma.serviceBooking.aggregate({
      where: {
        professionalId,
        status: BookingStatus.COMPLETED
      },
      _count: { id: true }
    });

    const totalBookings = await prisma.serviceBooking.count({
      where: { professionalId }
    });

    await prisma.professionalProfile.update({
      where: { id: professionalId },
      data: {
        completedBookings: stats._count.id,
        totalBookings
      }
    });
  }

  /**
   * Update service listing statistics
   */
  private static async updateServiceStats(serviceListingId: string) {
    const bookingCount = await prisma.serviceBooking.count({
      where: { serviceListingId }
    });

    await prisma.serviceListing.update({
      where: { id: serviceListingId },
      data: { bookingCount }
    });
  }

  /**
   * Check booking conflicts
   */
  static async checkBookingConflicts(professionalId: string, startDate: Date, endDate: Date, excludeBookingId?: string) {
    const whereClause: any = {
      professionalId,
      status: {
        in: [BookingStatus.CONFIRMED, BookingStatus.IN_PROGRESS]
      },
      OR: [
        {
          confirmedStartDate: {
            lte: endDate
          },
          estimatedEndDate: {
            gte: startDate
          }
        }
      ]
    };

    if (excludeBookingId) {
      whereClause.id = { not: excludeBookingId };
    }

    const conflicts = await prisma.serviceBooking.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        confirmedStartDate: true,
        estimatedEndDate: true
      }
    });

    return conflicts;
  }
}