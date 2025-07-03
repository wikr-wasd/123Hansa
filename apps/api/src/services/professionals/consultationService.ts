import { PrismaClient, ServiceCategory, ConsultationFormat } from '@prisma/client';
import { CustomError } from '../../utils/customError';
import { NotificationService } from '../notificationService';

const prisma = new PrismaClient();

interface CreateConsultationRequestData {
  clientId: string;
  professionalId?: string;
  serviceListingId?: string;
  title: string;
  description: string;
  urgency: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  budget?: number;
  preferredFormat: ConsultationFormat;
  preferredDates: any[];
  estimatedDuration?: string;
  requiredExpertise: ServiceCategory[];
  specificRequirements: string[];
  confidentiality: boolean;
  preferredLocation?: string;
  canTravel: boolean;
}

interface RespondToConsultationData {
  professionalResponse: string;
  quotedPrice: number;
  quotedDuration: string;
  proposedDates: any[];
}

export class ConsultationService {
  /**
   * Create consultation request
   */
  static async createConsultationRequest(data: CreateConsultationRequestData) {
    // Verify client exists
    const client = await prisma.user.findUnique({
      where: { id: data.clientId }
    });

    if (!client) {
      throw new CustomError('Client not found', 404);
    }

    // If professional specified, verify they exist and are active
    if (data.professionalId) {
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
        throw new CustomError('Professional is not accepting new consultations', 400);
      }
    }

    // If service listing specified, verify it exists
    if (data.serviceListingId) {
      const serviceListing = await prisma.serviceListing.findUnique({
        where: { id: data.serviceListingId }
      });

      if (!serviceListing || !serviceListing.isActive) {
        throw new CustomError('Service listing not found or inactive', 404);
      }

      // Auto-assign professional from service listing if not specified
      if (!data.professionalId) {
        data.professionalId = serviceListing.userId;
      }
    }

    // Set response deadline based on urgency
    const responseDeadline = new Date();
    switch (data.urgency) {
      case 'URGENT':
        responseDeadline.setHours(responseDeadline.getHours() + 24); // 24 hours
        break;
      case 'HIGH':
        responseDeadline.setDate(responseDeadline.getDate() + 2); // 2 days
        break;
      case 'NORMAL':
        responseDeadline.setDate(responseDeadline.getDate() + 5); // 5 days
        break;
      case 'LOW':
        responseDeadline.setDate(responseDeadline.getDate() + 7); // 7 days
        break;
    }

    const consultationRequest = await prisma.consultationRequest.create({
      data: {
        clientId: data.clientId,
        professionalId: data.professionalId,
        serviceListingId: data.serviceListingId,
        title: data.title,
        description: data.description,
        urgency: data.urgency,
        budget: data.budget,
        preferredFormat: data.preferredFormat,
        preferredDates: data.preferredDates,
        estimatedDuration: data.estimatedDuration,
        requiredExpertise: data.requiredExpertise,
        specificRequirements: data.specificRequirements,
        confidentiality: data.confidentiality,
        preferredLocation: data.preferredLocation,
        canTravel: data.canTravel,
        responseDeadline,
        status: data.professionalId ? 'ASSIGNED' : 'OPEN'
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
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

    // Send notification to professional or broadcast to matching professionals
    if (data.professionalId) {
      await NotificationService.createNotification({
        userId: data.professionalId,
        type: 'SYSTEM',
        title: 'Ny konsultationsförfrågan',
        content: `${client.firstName} ${client.lastName} har skickat en konsultationsförfrågan: "${data.title}"`,
        data: { consultationRequestId: consultationRequest.id },
        channel: 'IN_APP'
      });
    } else {
      // Find matching professionals and notify them
      await this.notifyMatchingProfessionals(consultationRequest.id, data.requiredExpertise);
    }

    return consultationRequest;
  }

  /**
   * Professional responds to consultation request
   */
  static async respondToConsultationRequest(
    requestId: string, 
    professionalId: string, 
    data: RespondToConsultationData
  ) {
    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: {
        client: true
      }
    });

    if (!request) {
      throw new CustomError('Consultation request not found', 404);
    }

    if (request.status === 'ACCEPTED' || request.status === 'DECLINED') {
      throw new CustomError('Consultation request has already been responded to', 400);
    }

    // Check if professional is authorized to respond
    if (request.professionalId && request.professionalId !== professionalId) {
      throw new CustomError('Unauthorized to respond to this consultation request', 403);
    }

    const updatedRequest = await prisma.consultationRequest.update({
      where: { id: requestId },
      data: {
        professionalId,
        professionalResponse: data.professionalResponse,
        quotedPrice: data.quotedPrice,
        quotedDuration: data.quotedDuration,
        proposedDates: data.proposedDates,
        status: 'QUOTED',
        respondedAt: new Date()
      },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
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

    // Notify client of response
    await NotificationService.createNotification({
      userId: request.clientId,
      type: 'SYSTEM',
      title: 'Svar på konsultationsförfrågan',
      content: `${updatedRequest.professional?.firstName} ${updatedRequest.professional?.lastName} har svarat på din förfrågan "${request.title}"`,
      data: { consultationRequestId: requestId },
      channel: 'IN_APP'
    });

    return updatedRequest;
  }

  /**
   * Client accepts or declines consultation quote
   */
  static async updateConsultationStatus(
    requestId: string, 
    clientId: string, 
    status: 'ACCEPTED' | 'DECLINED',
    declineReason?: string
  ) {
    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: {
        professional: true
      }
    });

    if (!request) {
      throw new CustomError('Consultation request not found', 404);
    }

    if (request.clientId !== clientId) {
      throw new CustomError('Unauthorized to update this consultation request', 403);
    }

    if (request.status !== 'QUOTED') {
      throw new CustomError('Consultation request is not in quoted status', 400);
    }

    const updatedRequest = await prisma.consultationRequest.update({
      where: { id: requestId },
      data: {
        status,
        acceptedAt: status === 'ACCEPTED' ? new Date() : null,
        declinedAt: status === 'DECLINED' ? new Date() : null
      }
    });

    // Create booking if accepted
    if (status === 'ACCEPTED' && request.professionalId && request.quotedPrice) {
      const booking = await prisma.serviceBooking.create({
        data: {
          clientId,
          professionalId: request.professionalId,
          serviceListingId: request.serviceListingId,
          bookingType: 'CONSULTATION',
          consultationFormat: request.preferredFormat,
          title: request.title,
          description: request.description,
          requirements: request.specificRequirements,
          deliverables: [], // Will be defined during booking
          agreedPrice: request.quotedPrice,
          clientNotes: request.description,
          platformCommission: 10.0,
          commissionAmount: (request.quotedPrice * 10.0) / 100
        }
      });

      // Notify professional of acceptance and booking creation
      await NotificationService.createNotification({
        userId: request.professionalId,
        type: 'SYSTEM',
        title: 'Konsultation accepterad',
        content: `Din offert för "${request.title}" har accepterats och en bokning har skapats`,
        data: { 
          consultationRequestId: requestId,
          bookingId: booking.id 
        },
        channel: 'IN_APP'
      });
    } else if (status === 'DECLINED' && request.professionalId) {
      // Notify professional of decline
      await NotificationService.createNotification({
        userId: request.professionalId,
        type: 'SYSTEM',
        title: 'Konsultation avböjd',
        content: `Din offert för "${request.title}" har avböjts. ${declineReason ? `Anledning: ${declineReason}` : ''}`,
        data: { consultationRequestId: requestId },
        channel: 'IN_APP'
      });
    }

    return updatedRequest;
  }

  /**
   * Get consultation requests for client
   */
  static async getClientConsultationRequests(clientId: string, status?: string) {
    const whereClause: any = { clientId };
    if (status) {
      whereClause.status = status;
    }

    const requests = await prisma.consultationRequest.findMany({
      where: whereClause,
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
                businessName: true,
                averageRating: true
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return requests;
  }

  /**
   * Get consultation requests for professional
   */
  static async getProfessionalConsultationRequests(professionalId: string, status?: string) {
    const whereClause: any = {
      OR: [
        { professionalId },
        { 
          status: 'OPEN',
          requiredExpertise: {
            hasSome: [] // Will be populated with professional's categories
          }
        }
      ]
    };

    if (status) {
      whereClause.status = status;
    }

    // Get professional's service categories
    const professional = await prisma.professionalProfile.findUnique({
      where: { id: professionalId },
      select: { serviceCategories: true }
    });

    if (professional) {
      // Update the query to include open requests matching professional's expertise
      whereClause.OR[1].requiredExpertise.hasSome = professional.serviceCategories;
    }

    const requests = await prisma.consultationRequest.findMany({
      where: whereClause,
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
            companyName: true
          }
        },
        serviceListing: {
          select: {
            id: true,
            title: true,
            category: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return requests;
  }

  /**
   * Get consultation request by ID
   */
  static async getConsultationRequestById(requestId: string, userId: string) {
    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: {
        client: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            companyName: true,
            phone: true
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
            professionalProfile: {
              select: {
                professionalTitle: true,
                businessName: true,
                averageRating: true,
                hourlyRate: true
              }
            }
          }
        },
        serviceListing: {
          select: {
            id: true,
            title: true,
            category: true,
            description: true,
            basePrice: true
          }
        }
      }
    });

    if (!request) {
      throw new CustomError('Consultation request not found', 404);
    }

    // Check authorization
    if (request.clientId !== userId && request.professionalId !== userId) {
      // Allow professionals to view open requests in their expertise area
      if (request.status !== 'OPEN') {
        throw new CustomError('Unauthorized to view this consultation request', 403);
      }
    }

    return request;
  }

  /**
   * Notify matching professionals of new consultation request
   */
  private static async notifyMatchingProfessionals(requestId: string, requiredExpertise: ServiceCategory[]) {
    const matchingProfessionals = await prisma.professionalProfile.findMany({
      where: {
        isActive: true,
        acceptsNewClients: true,
        verificationStatus: 'VERIFIED',
        serviceCategories: {
          hasSome: requiredExpertise
        }
      },
      select: {
        userId: true,
        professionalTitle: true
      },
      take: 20 // Limit to prevent spam
    });

    const request = await prisma.consultationRequest.findUnique({
      where: { id: requestId },
      include: {
        client: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    if (!request) return;

    // Send notifications to matching professionals
    for (const professional of matchingProfessionals) {
      await NotificationService.createNotification({
        userId: professional.userId,
        type: 'SYSTEM',
        title: 'Ny konsultationsmöjlighet',
        content: `${request.client.firstName} ${request.client.lastName} söker en ${professional.professionalTitle.toLowerCase()} för "${request.title}"`,
        data: { consultationRequestId: requestId },
        channel: 'IN_APP'
      });
    }
  }

  /**
   * Get consultation statistics
   */
  static async getConsultationStats(userId: string, role: 'client' | 'professional') {
    const whereClause = role === 'client' 
      ? { clientId: userId }
      : { professionalId: userId };

    const stats = await prisma.consultationRequest.groupBy({
      by: ['status'],
      where: whereClause,
      _count: {
        status: true
      }
    });

    const totalRequests = await prisma.consultationRequest.count({
      where: whereClause
    });

    return {
      totalRequests,
      byStatus: stats.reduce((acc, stat) => {
        acc[stat.status] = stat._count.status;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}