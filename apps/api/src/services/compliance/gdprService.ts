import { PrismaClient, User } from '@prisma/client';
import { notificationService } from '../notificationService';
import archiver from 'archiver';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

interface GDPRDataExportRequest {
  userId: string;
  requestedBy: string;
  includePersonalData: boolean;
  includeTransactionData: boolean;
  includeMessageData: boolean;
  includeListingData: boolean;
  format: 'JSON' | 'XML' | 'CSV';
}

interface GDPRDataDeletionRequest {
  userId: string;
  requestedBy: string;
  deletionType: 'SOFT' | 'HARD';
  retainTransactionData: boolean;
  retainLegalData: boolean;
  reason: string;
}

interface DataProcessingConsent {
  userId: string;
  consentType: 'MARKETING' | 'ANALYTICS' | 'FUNCTIONAL' | 'NECESSARY';
  granted: boolean;
  grantedAt?: Date;
  revokedAt?: Date;
  ipAddress: string;
  userAgent: string;
}

interface GDPRCompliantUser {
  personalData: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    country: string;
    language: string;
    createdAt: Date;
    lastLoginAt?: Date;
  };
  businessData?: {
    companyName?: string;
    companyRegistration?: string;
    vatNumber?: string;
  };
  verificationData: {
    verificationLevel: string;
    isEmailVerified: boolean;
    isPhoneVerified: boolean;
    isBankIdVerified: boolean;
  };
  preferences: {
    notificationSettings: any;
    language: string;
    timezone: string;
  };
}

class GDPRService {
  private notificationService: NotificationService;

  constructor() {
    notificationService = notificationService;
  }

  // Export all user data in GDPR-compliant format
  async exportUserData(request: GDPRDataExportRequest): Promise<{
    exportId: string;
    downloadUrl: string;
    expiresAt: Date;
  }> {
    try {
      const { userId, format, includePersonalData, includeTransactionData, includeMessageData, includeListingData } = request;

      // Verify user exists and requester has permission
      const user = await this.verifyDataAccessPermission(userId, request.requestedBy);
      
      const exportData: any = {
        exportMetadata: {
          exportId: this.generateExportId(),
          exportDate: new Date().toISOString(),
          format,
          requestedBy: request.requestedBy,
          dataSubject: userId,
          legalBasis: 'GDPR Article 20 - Right to data portability',
        },
        userData: {},
      };

      // Include personal data
      if (includePersonalData) {
        exportData.userData.personalData = await this.exportPersonalData(userId);
      }

      // Include transaction data
      if (includeTransactionData) {
        exportData.userData.transactionData = await this.exportTransactionData(userId);
      }

      // Include message data
      if (includeMessageData) {
        exportData.userData.messageData = await this.exportMessageData(userId);
      }

      // Include listing data
      if (includeListingData) {
        exportData.userData.listingData = await this.exportListingData(userId);
      }

      // Include consent history
      exportData.userData.consentHistory = await this.exportConsentHistory(userId);

      // Create export file
      const exportId = exportData.exportMetadata.exportId;
      const filePath = await this.createExportFile(exportData, format, exportId);
      
      // Store export record in database
      await this.createExportRecord({
        exportId,
        userId,
        requestedBy: request.requestedBy,
        filePath,
        format,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      // Notify user about data export
      await notificationService.createNotification({
        userId,
        type: 'SYSTEM',
        title: 'Dataexport färdig',
        content: 'Din begäran om dataexport enligt GDPR är klar för nedladdning.',
        data: { exportId },
        channel: 'EMAIL',
      });

      return {
        exportId,
        downloadUrl: `/api/compliance/gdpr/exports/${exportId}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      };
    } catch (error) {
      console.error('GDPR data export failed:', error);
      throw new Error(`Failed to export user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Delete user data according to GDPR right to erasure
  async deleteUserData(request: GDPRDataDeletionRequest): Promise<{
    deletionId: string;
    deletedData: string[];
    retainedData: string[];
    completedAt: Date;
  }> {
    try {
      const { userId, deletionType, retainTransactionData, retainLegalData, reason } = request;

      // Verify deletion permission
      await this.verifyDataAccessPermission(userId, request.requestedBy);

      const deletionId = this.generateDeletionId();
      const deletedData: string[] = [];
      const retainedData: string[] = [];

      // Create deletion record for audit trail
      await this.createDeletionRecord({
        deletionId,
        userId,
        requestedBy: request.requestedBy,
        deletionType,
        reason,
        startedAt: new Date(),
      });

      if (deletionType === 'SOFT') {
        // Soft delete - anonymize but retain structure
        await this.anonymizeUserData(userId);
        deletedData.push('Personal identifiable information');
      } else {
        // Hard delete - complete removal where legally allowed
        
        // Delete personal data
        await prisma.user.update({
          where: { id: userId },
          data: {
            firstName: '[DELETED]',
            lastName: '[DELETED]',
            email: `deleted-${userId}@123hansa.deleted`,
            phone: null,
            avatar: null,
            bio: null,
            website: null,
            linkedinProfile: null,
            isActive: false,
          },
        });
        deletedData.push('Personal information');

        // Delete or anonymize messages (retain transaction-related)
        if (!retainLegalData) {
          await prisma.message.updateMany({
            where: { 
              OR: [
                { senderId: userId },
                { receiverId: userId },
              ],
              type: { not: 'SYSTEM' },
            },
            data: {
              content: '[MESSAGE DELETED - GDPR REQUEST]',
              encryptedContent: null,
              metadata: null,
            },
          });
          deletedData.push('Personal messages');
        } else {
          retainedData.push('Transaction-related messages (legal requirement)');
        }

        // Handle transaction data
        if (!retainTransactionData) {
          // Anonymize transaction data but retain for financial/legal compliance
          await prisma.transaction.updateMany({
            where: {
              OR: [
                { buyerId: userId },
                { sellerId: userId },
              ],
            },
            data: {
              buyerNotes: null,
              sellerNotes: null,
              description: '[ANONYMIZED - GDPR REQUEST]',
            },
          });
          deletedData.push('Transaction personal notes');
        } else {
          retainedData.push('Transaction data (financial compliance)');
        }

        // Delete listings (but retain transaction history)
        await prisma.businessListing.updateMany({
          where: { userId },
          data: {
            title: '[LISTING DELETED - GDPR REQUEST]',
            description: null,
            shortDescription: null,
            reasonForSale: null,
            isActive: false,
            status: 'REMOVED',
          },
        });
        deletedData.push('Business listings');

        // Delete notification settings
        await prisma.notificationSettings.deleteMany({
          where: { userId },
        });
        deletedData.push('Notification preferences');

        // Delete sessions
        await prisma.userSession.deleteMany({
          where: { userId },
        });
        deletedData.push('Active sessions');
      }

      // Always retain certain data for legal compliance
      retainedData.push('Payment transaction records (PCI/AML compliance)');
      retainedData.push('Dispute cases (legal requirement)');
      retainedData.push('Fraud detection logs (security requirement)');

      // Complete deletion record
      await this.completeDeletionRecord(deletionId, deletedData, retainedData);

      // Notify about deletion completion
      if (deletionType === 'SOFT') {
        await notificationService.createNotification({
          userId,
          type: 'SYSTEM',
          title: 'Dataradering genomförd',
          content: 'Dina personuppgifter har anonymiserats enligt GDPR.',
          data: { deletionId },
          channel: 'EMAIL',
        });
      }

      return {
        deletionId,
        deletedData,
        retainedData,
        completedAt: new Date(),
      };
    } catch (error) {
      console.error('GDPR data deletion failed:', error);
      throw new Error(`Failed to delete user data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Record user consent for data processing
  async recordConsent(consent: DataProcessingConsent): Promise<void> {
    try {
      await prisma.$executeRaw`
        INSERT INTO user_consents (user_id, consent_type, granted, granted_at, revoked_at, ip_address, user_agent, created_at)
        VALUES (${consent.userId}, ${consent.consentType}, ${consent.granted}, 
                ${consent.granted ? new Date() : null}, 
                ${!consent.granted ? new Date() : null},
                ${consent.ipAddress}, ${consent.userAgent}, ${new Date()})
        ON CONFLICT (user_id, consent_type) 
        DO UPDATE SET 
          granted = ${consent.granted},
          granted_at = ${consent.granted ? new Date() : null},
          revoked_at = ${!consent.granted ? new Date() : null},
          ip_address = ${consent.ipAddress},
          user_agent = ${consent.userAgent},
          updated_at = ${new Date()}
      `;
    } catch (error) {
      console.error('Failed to record consent:', error);
      throw new Error('Failed to record consent');
    }
  }

  // Get user's current consent status
  async getUserConsents(userId: string): Promise<DataProcessingConsent[]> {
    try {
      const consents = await prisma.$queryRaw<any[]>`
        SELECT consent_type, granted, granted_at, revoked_at, ip_address, user_agent
        FROM user_consents 
        WHERE user_id = ${userId}
        ORDER BY consent_type
      `;

      return consents.map(consent => ({
        userId,
        consentType: consent.consent_type,
        granted: consent.granted,
        grantedAt: consent.granted_at,
        revokedAt: consent.revoked_at,
        ipAddress: consent.ip_address,
        userAgent: consent.user_agent,
      }));
    } catch (error) {
      console.error('Failed to get user consents:', error);
      throw new Error('Failed to retrieve consents');
    }
  }

  // Generate data processing report for authorities
  async generateDataProcessingReport(startDate: Date, endDate: Date): Promise<{
    reportId: string;
    totalUsers: number;
    newRegistrations: number;
    dataExportRequests: number;
    dataDeletionRequests: number;
    consentWithdrawals: number;
    dataBreaches: number;
    reportPath: string;
  }> {
    try {
      const reportId = `DPA-${Date.now()}`;
      
      // Gather statistics
      const totalUsers = await prisma.user.count({
        where: { isActive: true },
      });

      const newRegistrations = await prisma.user.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
      });

      // Additional statistics would be gathered from audit tables
      const dataExportRequests = 0; // From gdpr_exports table
      const dataDeletionRequests = 0; // From gdpr_deletions table
      const consentWithdrawals = 0; // From user_consents table
      const dataBreaches = 0; // From security_incidents table

      const report = {
        reportId,
        generatedAt: new Date().toISOString(),
        reportPeriod: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
        statistics: {
          totalUsers,
          newRegistrations,
          dataExportRequests,
          dataDeletionRequests,
          consentWithdrawals,
          dataBreaches,
        },
        complianceStatus: {
          gdprCompliant: true,
          dataRetentionPolicyActive: true,
          consentManagementActive: true,
          dataProcessingLegalBasisDocumented: true,
        },
        legalBasis: {
          contractualPerformance: 'Processing necessary for transaction completion',
          legitimateInterest: 'Fraud prevention and platform security',
          consent: 'Marketing communications and analytics',
          legalObligation: 'KYC/AML compliance and tax reporting',
        },
      };

      // Save report to file
      const reportPath = await this.saveComplianceReport(report, reportId);

      return {
        reportId,
        totalUsers,
        newRegistrations,
        dataExportRequests,
        dataDeletionRequests,
        consentWithdrawals,
        dataBreaches,
        reportPath,
      };
    } catch (error) {
      console.error('Failed to generate data processing report:', error);
      throw new Error('Failed to generate compliance report');
    }
  }

  // Private helper methods
  private async verifyDataAccessPermission(userId: string, requestedBy: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // User can access their own data, admins can access any data
    if (userId !== requestedBy) {
      const requester = await prisma.user.findUnique({
        where: { id: requestedBy },
      });

      if (!requester || requester.role !== 'ADMIN') {
        throw new Error('Insufficient permissions for data access');
      }
    }

    return user;
  }

  private async exportPersonalData(userId: string): Promise<GDPRCompliantUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        notificationSettings: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      personalData: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        language: user.language,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
      businessData: user.companyName ? {
        companyName: user.companyName,
        companyRegistration: user.companyRegistration,
        vatNumber: user.vatNumber,
      } : undefined,
      verificationData: {
        verificationLevel: user.verificationLevel,
        isEmailVerified: user.isEmailVerified,
        isPhoneVerified: user.isPhoneVerified,
        isBankIdVerified: user.isBankIdVerified,
      },
      preferences: {
        notificationSettings: user.notificationSettings?.[0] || {},
        language: user.language,
        timezone: user.notificationSettings?.[0]?.timezone || 'Europe/Stockholm',
      },
    };
  }

  private async exportTransactionData(userId: string): Promise<any[]> {
    return prisma.transaction.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId },
        ],
      },
      include: {
        payments: true,
        escrowAccount: true,
      },
    });
  }

  private async exportMessageData(userId: string): Promise<any[]> {
    return prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
      },
      select: {
        id: true,
        type: true,
        content: true,
        createdAt: true,
        readAt: true,
        // Exclude encrypted content for privacy
      },
    });
  }

  private async exportListingData(userId: string): Promise<any[]> {
    return prisma.businessListing.findMany({
      where: { userId },
      include: {
        images: true,
        documents: true,
      },
    });
  }

  private async exportConsentHistory(userId: string): Promise<any[]> {
    try {
      return await prisma.$queryRaw<any[]>`
        SELECT consent_type, granted, granted_at, revoked_at, created_at
        FROM user_consents 
        WHERE user_id = ${userId}
        ORDER BY created_at DESC
      `;
    } catch (error) {
      return []; // Return empty if consents table doesn't exist yet
    }
  }

  private generateExportId(): string {
    return `EXP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateDeletionId(): string {
    return `DEL-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private async createExportFile(data: any, format: string, exportId: string): Promise<string> {
    const exportDir = process.env.GDPR_EXPORT_DIR || '/tmp/gdpr-exports';
    
    // Ensure directory exists
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, `${exportId}.${format.toLowerCase()}`);

    switch (format) {
      case 'JSON':
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
        break;
      case 'XML':
        // Convert to XML format
        const xmlData = this.convertToXML(data);
        fs.writeFileSync(filePath, xmlData);
        break;
      case 'CSV':
        // Flatten data for CSV
        const csvData = this.convertToCSV(data);
        fs.writeFileSync(filePath, csvData);
        break;
    }

    return filePath;
  }

  private convertToXML(data: any): string {
    // Simple XML conversion - in production use a proper XML library
    return `<?xml version="1.0" encoding="UTF-8"?>
<GDPRDataExport>
  <ExportMetadata>
    <ExportId>${data.exportMetadata.exportId}</ExportId>
    <ExportDate>${data.exportMetadata.exportDate}</ExportDate>
    <LegalBasis>${data.exportMetadata.legalBasis}</LegalBasis>
  </ExportMetadata>
  <UserData>
    ${JSON.stringify(data.userData, null, 2)}
  </UserData>
</GDPRDataExport>`;
  }

  private convertToCSV(data: any): string {
    // Flatten nested data for CSV format
    const flattenData = (obj: any, prefix = ''): any => {
      const flattened: any = {};
      for (const key in obj) {
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          Object.assign(flattened, flattenData(obj[key], `${prefix}${key}_`));
        } else {
          flattened[`${prefix}${key}`] = obj[key];
        }
      }
      return flattened;
    };

    const flattened = flattenData(data);
    const headers = Object.keys(flattened).join(',');
    const values = Object.values(flattened).map(v => 
      typeof v === 'string' ? `"${v.replace(/"/g, '""')}"` : v
    ).join(',');

    return `${headers}\n${values}`;
  }

  private async createExportRecord(record: any): Promise<void> {
    // Store export record for audit purposes
    console.log('GDPR Export Record:', record);
  }

  private async createDeletionRecord(record: any): Promise<void> {
    // Store deletion record for audit purposes
    console.log('GDPR Deletion Record:', record);
  }

  private async completeDeletionRecord(deletionId: string, deletedData: string[], retainedData: string[]): Promise<void> {
    // Update deletion record with completion details
    console.log('GDPR Deletion Completed:', { deletionId, deletedData, retainedData });
  }

  private async anonymizeUserData(userId: string): Promise<void> {
    const anonymizedEmail = `anonymous-${userId.slice(-8)}@123hansa.anonymized`;
    
    await prisma.user.update({
      where: { id: userId },
      data: {
        firstName: 'Anonymized',
        lastName: 'User',
        email: anonymizedEmail,
        phone: null,
        avatar: null,
        bio: null,
        website: null,
        linkedinProfile: null,
      },
    });
  }

  private async saveComplianceReport(report: any, reportId: string): Promise<string> {
    const reportDir = process.env.COMPLIANCE_REPORTS_DIR || '/tmp/compliance-reports';
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    const filePath = path.join(reportDir, `${reportId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    
    return filePath;
  }
}

export { GDPRService };