import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

export class SimpleListingService {
  static async getAllListings() {
    try {
      const listings = await prisma.businessListing.findMany({
        where: {
          status: 'ACTIVE',
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
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      return {
        success: true,
        data: listings,
        total: listings.length,
      };
    } catch (error) {
      logger.error('Error fetching listings:', error);
      throw error;
    }
  }

  static async getListingById(id: string) {
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
            },
          },
        },
      });

      return listing;
    } catch (error) {
      logger.error('Error fetching listing:', error);
      throw error;
    }
  }

  static async createSampleData() {
    try {
      // Create sample users if they don't exist
      const sampleUsers = [
        {
          id: 'user_anna',
          email: 'anna.karlsson@test.com',
          firstName: 'Anna',
          lastName: 'Karlsson',
          country: 'SE',
        },
        {
          id: 'user_erik',
          email: 'erik.johansson@test.com',
          firstName: 'Erik',
          lastName: 'Johansson',
          country: 'SE',
        },
      ];

      for (const userData of sampleUsers) {
        await prisma.user.upsert({
          where: { email: userData.email },
          update: {},
          create: userData,
        });
      }

      // Create sample listings
      const sampleListings = [
        {
          title: 'TechStartup AB',
          description: 'Innovativt teknikföretag med stark tillväxt inom AI och maskininlärning.',
          category: 'Technology',
          askingPrice: 2500000,
          status: 'ACTIVE',
          ownerId: 'user_anna',
          publishedAt: new Date(),
        },
        {
          title: 'Restaurang Gamla Stan',
          description: 'Välbesökt restaurang i hjärtat av Stockholm med etablerad kundbas.',
          category: 'Restaurant',
          askingPrice: 1200000,
          status: 'ACTIVE',
          ownerId: 'user_erik',
          publishedAt: new Date(),
        },
        {
          title: 'E-handel Fashion',
          description: 'Online modebutik med stor potential och växande försäljning.',
          category: 'E-commerce',
          askingPrice: 800000,
          status: 'PENDING_REVIEW',
          ownerId: 'user_anna',
        },
        {
          title: 'Konsultföretag Stockholm',
          description: 'Etablerat IT-konsultföretag med erfarna utvecklare.',
          category: 'Consulting',
          askingPrice: 1800000,
          status: 'ACTIVE',
          ownerId: 'user_erik',
          publishedAt: new Date(),
        },
      ];

      for (const listingData of sampleListings) {
        const existingListing = await prisma.businessListing.findFirst({
          where: { 
            ownerId: listingData.ownerId, 
            title: listingData.title 
          }
        });
        
        if (!existingListing) {
          await prisma.businessListing.create({
            data: listingData,
          });
        }
      }

      logger.info('Sample data created successfully');
      return { success: true, message: 'Sample data created' };
    } catch (error) {
      logger.error('Error creating sample data:', error);
      throw error;
    }
  }
}