import { Request, Response } from 'express';
import { GDPRService } from '../../services/compliance/gdprService';
import { AuthenticatedRequest } from '../../middleware/auth';
import fs from 'fs';
import path from 'path';

const gdprService = new GDPRService();

export const requestDataExport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      includePersonalData = true,
      includeTransactionData = true,
      includeMessageData = true,
      includeListingData = true,
      format = 'JSON'
    } = req.body;

    // Validate format
    if (!['JSON', 'XML', 'CSV'].includes(format)) {
      return res.status(400).json({
        error: 'Invalid export format. Supported formats: JSON, XML, CSV'
      });
    }

    const result = await gdprService.exportUserData({
      userId,
      requestedBy: userId,
      includePersonalData,
      includeTransactionData,
      includeMessageData,
      includeListingData,
      format,
    });

    res.json({
      success: true,
      message: 'Data export request has been processed successfully',
      data: {
        exportId: result.exportId,
        downloadUrl: result.downloadUrl,
        expiresAt: result.expiresAt,
        availableFor: '30 days',
      },
    });
  } catch (error) {
    console.error('Data export request failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process data export request'
    });
  }
};

export const downloadDataExport = async (req: Request, res: Response) => {
  try {
    const { exportId } = req.params;
    
    // Validate export ID format
    if (!exportId || !exportId.startsWith('EXP-')) {
      return res.status(400).json({
        error: 'Invalid export ID'
      });
    }

    // Find export file
    const exportDir = process.env.GDPR_EXPORT_DIR || '/tmp/gdpr-exports';
    const possibleFiles = ['json', 'xml', 'csv'].map(ext => 
      path.join(exportDir, `${exportId}.${ext}`)
    );

    let filePath: string | null = null;
    let format = '';

    for (const file of possibleFiles) {
      if (fs.existsSync(file)) {
        filePath = file;
        format = path.extname(file).slice(1).toUpperCase();
        break;
      }
    }

    if (!filePath) {
      return res.status(404).json({
        error: 'Export file not found or has expired'
      });
    }

    // Set appropriate headers for download
    const fileName = `tubba-data-export-${exportId}.${format.toLowerCase()}`;
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.setHeader('Content-Type', getContentType(format));
    
    // Stream file to response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error('File download error:', error);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Failed to download file' });
      }
    });

  } catch (error) {
    console.error('Download export failed:', error);
    res.status(500).json({
      error: 'Failed to download export file'
    });
  }
};

export const requestDataDeletion = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      deletionType = 'SOFT',
      retainTransactionData = true,
      retainLegalData = true,
      reason
    } = req.body;

    // Validate deletion type
    if (!['SOFT', 'HARD'].includes(deletionType)) {
      return res.status(400).json({
        error: 'Invalid deletion type. Must be SOFT or HARD'
      });
    }

    if (!reason) {
      return res.status(400).json({
        error: 'Reason for deletion is required'
      });
    }

    // Warning for hard deletion
    if (deletionType === 'HARD') {
      const confirmationHeader = req.headers['x-confirm-hard-deletion'];
      if (confirmationHeader !== 'I-UNDERSTAND-THIS-IS-IRREVERSIBLE') {
        return res.status(400).json({
          error: 'Hard deletion requires confirmation header: X-Confirm-Hard-Deletion: I-UNDERSTAND-THIS-IS-IRREVERSIBLE',
          warning: 'Hard deletion is irreversible and will permanently remove your personal data'
        });
      }
    }

    const result = await gdprService.deleteUserData({
      userId,
      requestedBy: userId,
      deletionType,
      retainTransactionData,
      retainLegalData,
      reason,
    });

    res.json({
      success: true,
      message: 'Data deletion request has been processed successfully',
      data: {
        deletionId: result.deletionId,
        deletedData: result.deletedData,
        retainedData: result.retainedData,
        completedAt: result.completedAt,
        notice: 'Some data may be retained for legal compliance requirements',
      },
    });
  } catch (error) {
    console.error('Data deletion request failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to process data deletion request'
    });
  }
};

export const updateConsent = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { consentType, granted } = req.body;

    // Validate consent type
    const validConsentTypes = ['MARKETING', 'ANALYTICS', 'FUNCTIONAL', 'NECESSARY'];
    if (!validConsentTypes.includes(consentType)) {
      return res.status(400).json({
        error: `Invalid consent type. Valid types: ${validConsentTypes.join(', ')}`
      });
    }

    if (typeof granted !== 'boolean') {
      return res.status(400).json({
        error: 'Granted must be a boolean value'
      });
    }

    // Necessary consent cannot be revoked
    if (consentType === 'NECESSARY' && !granted) {
      return res.status(400).json({
        error: 'Necessary consent cannot be revoked as it is required for platform functionality'
      });
    }

    await gdprService.recordConsent({
      userId,
      consentType,
      granted,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent') || '',
    });

    res.json({
      success: true,
      message: `Consent for ${consentType} has been ${granted ? 'granted' : 'revoked'}`,
      data: {
        consentType,
        granted,
        recordedAt: new Date(),
      },
    });
  } catch (error) {
    console.error('Consent update failed:', error);
    res.status(500).json({
      error: 'Failed to update consent'
    });
  }
};

export const getConsents = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const consents = await gdprService.getUserConsents(userId);

    res.json({
      success: true,
      data: {
        userId,
        consents: consents.map(consent => ({
          type: consent.consentType,
          granted: consent.granted,
          grantedAt: consent.grantedAt,
          revokedAt: consent.revokedAt,
        })),
        lastUpdated: new Date(),
      },
    });
  } catch (error) {
    console.error('Get consents failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve consent information'
    });
  }
};

export const getDataProcessingInfo = async (req: Request, res: Response) => {
  try {
    const dataProcessingInfo = {
      controller: {
        name: '123hansa AB',
        address: 'Stockholm, Sweden',
        email: 'privacy@123hansa.se',
        phone: '+46 8 123 456 78',
      },
      dataProtectionOfficer: {
        name: 'Data Protection Officer',
        email: 'dpo@123hansa.se',
      },
      purposes: [
        {
          purpose: 'Contract Performance',
          legalBasis: 'GDPR Article 6(1)(b) - Contract performance',
          description: 'Processing necessary to provide marketplace services and complete transactions',
          dataTypes: ['Personal information', 'Transaction data', 'Communication records'],
          retention: 'Duration of business relationship + 7 years for accounting purposes',
        },
        {
          purpose: 'Legal Compliance',
          legalBasis: 'GDPR Article 6(1)(c) - Legal obligation',
          description: 'KYC/AML compliance, tax reporting, financial regulations',
          dataTypes: ['Identity verification', 'Transaction records', 'Due diligence data'],
          retention: '5-10 years as required by Swedish financial regulations',
        },
        {
          purpose: 'Legitimate Interest',
          legalBasis: 'GDPR Article 6(1)(f) - Legitimate interest',
          description: 'Fraud prevention, platform security, service improvement',
          dataTypes: ['Usage data', 'Security logs', 'Communication patterns'],
          retention: '2 years for security purposes',
        },
        {
          purpose: 'Consent',
          legalBasis: 'GDPR Article 6(1)(a) - Consent',
          description: 'Marketing communications, analytics, optional features',
          dataTypes: ['Marketing preferences', 'Analytics data', 'Optional profile information'],
          retention: 'Until consent is withdrawn',
        },
      ],
      rights: [
        'Right to access your personal data (Article 15)',
        'Right to rectification of inaccurate data (Article 16)',
        'Right to erasure ("right to be forgotten") (Article 17)',
        'Right to restrict processing (Article 18)',
        'Right to data portability (Article 20)',
        'Right to object to processing (Article 21)',
        'Right to withdraw consent (Article 7)',
        'Right to lodge a complaint with supervisory authority',
      ],
      supervisoryAuthority: {
        name: 'Integritetsskyddsmyndigheten (IMY)',
        website: 'https://www.imy.se',
        email: 'imy@imy.se',
        phone: '+46 8 657 61 00',
      },
      dataTransfers: [
        {
          recipient: 'Stripe Inc.',
          country: 'United States',
          safeguard: 'Standard Contractual Clauses + Adequacy Decision',
          purpose: 'Payment processing',
        },
        {
          recipient: 'AWS',
          country: 'EU (Ireland)',
          safeguard: 'Data Processing Agreement',
          purpose: 'Cloud hosting and storage',
        },
      ],
      lastUpdated: '2024-01-15',
    };

    res.json({
      success: true,
      data: dataProcessingInfo,
    });
  } catch (error) {
    console.error('Get data processing info failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve data processing information'
    });
  }
};

// Admin-only endpoints
export const generateComplianceReport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        error: 'Start date and end date are required'
      });
    }

    const report = await gdprService.generateDataProcessingReport(
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      message: 'Compliance report generated successfully',
      data: report,
    });
  } catch (error) {
    console.error('Generate compliance report failed:', error);
    res.status(500).json({
      error: 'Failed to generate compliance report'
    });
  }
};

export const adminDataExport = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    const { userId, ...exportOptions } = req.body;

    if (!userId) {
      return res.status(400).json({
        error: 'User ID is required for admin export'
      });
    }

    const result = await gdprService.exportUserData({
      userId,
      requestedBy: req.user!.id,
      includePersonalData: true,
      includeTransactionData: true,
      includeMessageData: true,
      includeListingData: true,
      format: 'JSON',
      ...exportOptions,
    });

    res.json({
      success: true,
      message: 'Admin data export completed',
      data: result,
    });
  } catch (error) {
    console.error('Admin data export failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export user data'
    });
  }
};

// Helper function to get content type for file downloads
function getContentType(format: string): string {
  switch (format) {
    case 'JSON':
      return 'application/json';
    case 'XML':
      return 'application/xml';
    case 'CSV':
      return 'text/csv';
    default:
      return 'application/octet-stream';
  }
}