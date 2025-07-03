import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    verificationLevel: string;
    adminProfile?: {
      id: string;
      role: string;
      permissions: any;
    };
  };
}

// Validation schemas
const createTicketSchema = z.object({
  category: z.string(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  subject: z.string().min(1),
  description: z.string().min(10),
  attachments: z.array(z.string()).optional()
});

const updateTicketSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER', 'RESOLVED', 'CLOSED', 'ESCALATED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT', 'CRITICAL']).optional(),
  assignedTo: z.string().uuid().optional(),
  tags: z.array(z.string()).optional(),
  internalNotes: z.string().optional()
});

const responseSchema = z.object({
  content: z.string().min(1),
  attachments: z.array(z.string()).optional(),
  isInternal: z.boolean().optional()
});

// Get all support tickets (with filtering)
export const getSupportTickets = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { 
      page = 1, 
      limit = 20, 
      status, 
      priority, 
      category,
      assignedTo,
      search 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    // Build where clause based on role and filters
    const whereClause: any = {};

    // Role-based filtering
    if (adminUser.adminProfile.role === 'CUSTOMER_SUPPORT') {
      // Support agents can only see assigned tickets or unassigned ones
      whereClause.OR = [
        { assignedTo: adminUser.adminProfile.id },
        { assignedTo: null }
      ];
    }

    // Apply filters
    if (status) whereClause.status = status;
    if (priority) whereClause.priority = priority;
    if (category) whereClause.category = category;
    if (assignedTo) whereClause.assignedTo = assignedTo;
    
    if (search) {
      whereClause.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { user: { email: { contains: search, mode: 'insensitive' } } }
      ];
    }

    const [tickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              firstName: true,
              lastName: true
            }
          },
          assignedAdmin: {
            include: {
              user: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            }
          },
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              content: true,
              createdAt: true,
              responderType: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: Number(limit)
      }),
      prisma.supportTicket.count({ where: whereClause })
    ]);

    // Calculate SLA status for each ticket
    const enrichedTickets = tickets.map(ticket => {
      const now = new Date();
      const timeSinceCreated = now.getTime() - ticket.createdAt.getTime();
      const hoursSinceCreated = timeSinceCreated / (1000 * 60 * 60);
      
      // SLA targets based on priority
      const slaTargets = {
        CRITICAL: 1, // 1 hour
        URGENT: 4,   // 4 hours
        HIGH: 8,     // 8 hours
        MEDIUM: 24,  // 24 hours
        LOW: 48      // 48 hours
      };

      const slaTarget = slaTargets[ticket.priority as keyof typeof slaTargets];
      const slaStatus = ticket.firstResponseAt ? 'MET' : 
                       hoursSinceCreated > slaTarget ? 'BREACHED' : 'AT_RISK';

      return {
        ...ticket,
        slaStatus,
        hoursSinceCreated: Math.round(hoursSinceCreated),
        slaTarget,
        lastResponse: ticket.responses[0] || null
      };
    });

    res.json({
      success: true,
      data: {
        tickets: enrichedTickets,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          hasMore: skip + Number(limit) < totalCount
        }
      }
    });
  } catch (error) {
    console.error('Get support tickets error:', error);
    res.status(500).json({ error: 'Failed to fetch support tickets' });
  }
};

// Get specific support ticket with full details
export const getSupportTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ticketId } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            createdAt: true,
            verificationLevel: true
          }
        },
        assignedAdmin: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                email: true
              }
            }
          }
        },
        responses: {
          orderBy: { createdAt: 'asc' },
          include: {
            // We'll need to handle both admin and user responders
          }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    // Check permission to view this ticket
    if (adminUser.adminProfile.role === 'CUSTOMER_SUPPORT') {
      if (ticket.assignedTo && ticket.assignedTo !== adminUser.adminProfile.id) {
        return res.status(403).json({ error: 'Not authorized to view this ticket' });
      }
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Get support ticket error:', error);
    res.status(500).json({ error: 'Failed to fetch support ticket' });
  }
};

// Create support ticket (for testing - usually users create these)
export const createSupportTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validation = createTicketSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid ticket data', details: validation.error });
    }

    const { category, priority, subject, description, attachments } = validation.data;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Calculate SLA deadline based on priority
    const now = new Date();
    const slaHours = {
      CRITICAL: 1,
      URGENT: 4,
      HIGH: 8,
      MEDIUM: 24,
      LOW: 48
    };

    const slaDeadline = new Date(now.getTime() + (slaHours[priority || 'MEDIUM'] * 60 * 60 * 1000));

    const ticket = await prisma.supportTicket.create({
      data: {
        userId,
        category,
        priority: priority || 'MEDIUM',
        subject,
        description,
        attachments: attachments || [],
        slaDeadline,
        source: 'WEB'
      },
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // TODO: Send notification to support team
    // TODO: Auto-assign based on category and workload

    res.status(201).json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Create support ticket error:', error);
    res.status(500).json({ error: 'Failed to create support ticket' });
  }
};

// Update support ticket (assign, change status, etc.)
export const updateSupportTicket = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ticketId } = req.params;
    const validation = updateTicketSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid update data', details: validation.error });
    }

    const updateData = validation.data;

    // Get current ticket
    const currentTicket = await prisma.supportTicket.findUnique({
      where: { id: ticketId }
    });

    if (!currentTicket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    // Check permissions
    if (adminUser.adminProfile.role === 'CUSTOMER_SUPPORT') {
      if (currentTicket.assignedTo && currentTicket.assignedTo !== adminUser.adminProfile.id) {
        return res.status(403).json({ error: 'Not authorized to update this ticket' });
      }
    }

    // Prepare update data with special handling for status changes
    const updateFields: any = { ...updateData };

    // Handle status changes
    if (updateData.status) {
      if (updateData.status === 'IN_PROGRESS' && !currentTicket.assignedTo && !updateData.assignedTo) {
        // Auto-assign to current admin if moving to in progress
        updateFields.assignedTo = adminUser.adminProfile.id;
        updateFields.assignedAt = new Date();
      }

      if (updateData.status === 'RESOLVED') {
        updateFields.resolvedAt = new Date();
      }

      if (updateData.status === 'CLOSED') {
        updateFields.closedAt = new Date();
      }
    }

    // Handle assignment
    if (updateData.assignedTo && updateData.assignedTo !== currentTicket.assignedTo) {
      updateFields.assignedAt = new Date();
    }

    const updatedTicket = await prisma.supportTicket.update({
      where: { id: ticketId },
      data: updateFields,
      include: {
        user: {
          select: {
            email: true,
            firstName: true,
            lastName: true
          }
        },
        assignedAdmin: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    });

    // Log the update
    await prisma.adminLog.create({
      data: {
        adminId: adminUser.adminProfile.id,
        action: 'UPDATE',
        resourceType: 'SUPPORT_TICKET',
        resourceId: ticketId,
        description: `Updated support ticket: ${currentTicket.subject}`,
        details: updateData,
        oldValues: {
          status: currentTicket.status,
          priority: currentTicket.priority,
          assignedTo: currentTicket.assignedTo
        },
        newValues: updateFields,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    });

    // TODO: Send notifications based on status change
    // TODO: Update SLA tracking

    res.json({
      success: true,
      data: updatedTicket
    });
  } catch (error) {
    console.error('Update support ticket error:', error);
    res.status(500).json({ error: 'Failed to update support ticket' });
  }
};

// Add response to support ticket
export const addTicketResponse = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ticketId } = req.params;
    const validation = responseSchema.safeParse(req.body);
    
    if (!validation.success) {
      return res.status(400).json({ error: 'Invalid response data', details: validation.error });
    }

    const { content, attachments, isInternal } = validation.data;

    // Get ticket and check permissions
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: {
        responses: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ error: 'Support ticket not found' });
    }

    // Calculate response time
    const lastResponse = ticket.responses[0];
    const responseTime = lastResponse ? 
      Math.round((new Date().getTime() - lastResponse.createdAt.getTime()) / 1000) : 
      Math.round((new Date().getTime() - ticket.createdAt.getTime()) / 1000);

    // Create response
    const response = await prisma.supportTicketResponse.create({
      data: {
        ticketId,
        responderId: adminUser.adminProfile.id,
        responderType: 'ADMIN',
        content,
        attachments: attachments || [],
        isInternal: isInternal || false,
        responseTime
      }
    });

    // Update ticket with first response time if this is the first admin response
    const updateData: any = {};
    if (!ticket.firstResponseAt) {
      updateData.firstResponseAt = new Date();
    }

    // Auto-assign ticket if not assigned
    if (!ticket.assignedTo) {
      updateData.assignedTo = adminUser.adminProfile.id;
      updateData.assignedAt = new Date();
    }

    // Move to in progress if it was open
    if (ticket.status === 'OPEN') {
      updateData.status = 'IN_PROGRESS';
    }

    if (Object.keys(updateData).length > 0) {
      await prisma.supportTicket.update({
        where: { id: ticketId },
        data: updateData
      });
    }

    // TODO: Send email notification to user (if not internal)
    // TODO: Update SLA metrics

    res.status(201).json({
      success: true,
      data: response
    });
  } catch (error) {
    console.error('Add ticket response error:', error);
    res.status(500).json({ error: 'Failed to add response' });
  }
};

// Get support analytics
export const getSupportAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const adminUser = req.user;
    if (!adminUser?.adminProfile) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { days = 30 } = req.query;
    const daysBack = Math.min(Number(days), 365);
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResponseTime,
      ticketsByCategory,
      ticketsByPriority,
      slaPerformance
    ] = await Promise.all([
      // Total tickets in period
      prisma.supportTicket.count({
        where: { createdAt: { gte: startDate } }
      }),
      
      // Open tickets
      prisma.supportTicket.count({
        where: { status: { in: ['OPEN', 'IN_PROGRESS', 'WAITING_FOR_USER'] } }
      }),
      
      // Resolved tickets in period
      prisma.supportTicket.count({
        where: { 
          resolvedAt: { gte: startDate },
          status: 'RESOLVED'
        }
      }),
      
      // Average response time
      prisma.supportTicketResponse.aggregate({
        _avg: { responseTime: true },
        where: {
          createdAt: { gte: startDate },
          responderType: 'ADMIN'
        }
      }),
      
      // Tickets by category
      prisma.supportTicket.groupBy({
        by: ['category'],
        _count: { category: true },
        where: { createdAt: { gte: startDate } }
      }),
      
      // Tickets by priority
      prisma.supportTicket.groupBy({
        by: ['priority'],
        _count: { priority: true },
        where: { createdAt: { gte: startDate } }
      }),
      
      // SLA performance
      prisma.supportTicket.aggregate({
        _count: {
          _all: true
        },
        where: {
          createdAt: { gte: startDate },
          slaBreached: false,
          firstResponseAt: { not: null }
        }
      })
    ]);

    const analytics = {
      overview: {
        totalTickets,
        openTickets,
        resolvedTickets,
        resolutionRate: totalTickets > 0 ? (resolvedTickets / totalTickets * 100) : 0
      },
      performance: {
        avgResponseTimeMinutes: avgResponseTime._avg.responseTime ? Math.round(avgResponseTime._avg.responseTime / 60) : 0,
        slaCompliance: totalTickets > 0 ? (slaPerformance._count._all / totalTickets * 100) : 0
      },
      distribution: {
        byCategory: ticketsByCategory.map(item => ({
          category: item.category,
          count: item._count.category
        })),
        byPriority: ticketsByPriority.map(item => ({
          priority: item.priority,
          count: item._count.priority
        }))
      }
    };

    res.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Support analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch support analytics' });
  }
};

export default {
  getSupportTickets,
  getSupportTicket,
  createSupportTicket,
  updateSupportTicket,
  addTicketResponse,
  getSupportAnalytics
};