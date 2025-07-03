import { Request, Response } from 'express';
import { KYCAMLService, VerificationType, DocumentType, AMLCheckType } from '../../services/compliance/kycAmlService';
import { AuthenticatedRequest } from '../../middleware/auth';

const kycAmlService = new KYCAMLService();

export const initiateKYCVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      verificationType,
      documentType,
      documentData,
      personalData
    } = req.body;

    // Validate required fields
    if (!verificationType || !Object.values(VerificationType).includes(verificationType)) {
      return res.status(400).json({
        error: 'Valid verification type is required',
        validTypes: Object.values(VerificationType)
      });
    }

    if (verificationType === VerificationType.DOCUMENT_VERIFICATION) {
      if (!documentType || !Object.values(DocumentType).includes(documentType)) {
        return res.status(400).json({
          error: 'Valid document type is required for document verification',
          validTypes: Object.values(DocumentType)
        });
      }

      if (!documentData?.frontImageUrl) {
        return res.status(400).json({
          error: 'Front image of document is required'
        });
      }
    }

    if (!personalData?.firstName || !personalData?.lastName || !personalData?.nationalId) {
      return res.status(400).json({
        error: 'Personal data (firstName, lastName, nationalId) is required'
      });
    }

    const result = await kycAmlService.initiateKYCVerification({
      userId,
      verificationType,
      documentType,
      documentData,
      personalData,
    });

    res.json({
      success: true,
      message: 'KYC verification initiated successfully',
      data: {
        verificationId: result.verificationId,
        status: result.status,
        riskLevel: result.riskLevel,
        confidence: result.confidence,
        reviewRequired: result.reviewRequired,
        findings: result.findings.map(finding => ({
          type: finding.type,
          severity: finding.severity,
          description: finding.description,
        })),
        expiresAt: result.expiresAt,
      },
    });
  } catch (error) {
    console.error('KYC verification initiation failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to initiate KYC verification'
    });
  }
};

export const performAMLCheck = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const {
      checkType = AMLCheckType.COMPREHENSIVE_SCREENING,
      personalData,
      businessData
    } = req.body;

    // Validate check type
    if (!Object.values(AMLCheckType).includes(checkType)) {
      return res.status(400).json({
        error: 'Valid AML check type is required',
        validTypes: Object.values(AMLCheckType)
      });
    }

    // Validate personal data
    if (!personalData?.firstName || !personalData?.lastName || !personalData?.nationalId) {
      return res.status(400).json({
        error: 'Personal data (firstName, lastName, nationalId) is required for AML check'
      });
    }

    if (!personalData.dateOfBirth) {
      return res.status(400).json({
        error: 'Date of birth is required for AML check'
      });
    }

    const results = await kycAmlService.performAMLCheck({
      userId,
      checkType,
      personalData: {
        ...personalData,
        dateOfBirth: new Date(personalData.dateOfBirth),
      },
      businessData,
    });

    // Calculate overall risk assessment
    const overallRiskScore = Math.max(...results.map(r => r.riskScore), 0);
    const totalMatches = results.reduce((sum, r) => sum + r.matches.length, 0);
    
    const riskAssessment = {
      overallRisk: overallRiskScore >= 60 ? 'HIGH' : overallRiskScore >= 30 ? 'MEDIUM' : 'LOW',
      riskScore: overallRiskScore,
      totalMatches,
      requiresReview: overallRiskScore >= 50 || totalMatches > 0,
    };

    res.json({
      success: true,
      message: 'AML check completed successfully',
      data: {
        riskAssessment,
        results: results.map(result => ({
          checkType: result.checkType,
          riskScore: result.riskScore,
          matchCount: result.matches.length,
          matches: result.matches.map(match => ({
            listType: match.listType,
            confidence: match.matchConfidence,
            entityName: match.entityName,
            description: match.description,
            source: match.source,
          })),
          lastChecked: result.lastChecked,
        })),
        nextSteps: riskAssessment.requiresReview 
          ? 'Manual review required due to potential matches or high risk score'
          : 'User cleared for standard platform access',
      },
    });
  } catch (error) {
    console.error('AML check failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to perform AML check'
    });
  }
};

export const initiateBankIDVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { personalNumber, requirement } = req.body;

    if (!personalNumber) {
      return res.status(400).json({
        error: 'Personal number (personnummer) is required for BankID verification'
      });
    }

    // Validate Swedish personal number format (simplified)
    const personalNumberRegex = /^(\d{6}|\d{8})[-+]?\d{4}$/;
    if (!personalNumberRegex.test(personalNumber.replace(/\s/g, ''))) {
      return res.status(400).json({
        error: 'Invalid Swedish personal number format'
      });
    }

    const result = await kycAmlService.initiateBankIDVerification('temp-verification-id', {
      userId,
      personalNumber: personalNumber.replace(/\s/g, ''),
      endUserIp: req.ip,
      requirement,
    });

    res.json({
      success: true,
      message: 'BankID verification initiated successfully',
      data: {
        verificationId: result.verificationId,
        status: result.status,
        // In production, return BankID app launch URL or QR code
        instructions: {
          method: 'bankid_app',
          message: 'Öppna BankID-appen på din telefon och följ instruktionerna för att slutföra verifieringen.',
          autoStartUrl: `bankid:///?autostarttoken=mock-token&redirect=tubba://verification/complete`,
        },
        expiresAt: new Date(Date.now() + 3 * 60 * 1000), // 3 minutes for BankID
      },
    });
  } catch (error) {
    console.error('BankID verification initiation failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to initiate BankID verification'
    });
  }
};

export const getVerificationStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    
    const status = await kycAmlService.getVerificationStatus(userId);

    res.json({
      success: true,
      data: {
        verificationLevel: status.verificationLevel,
        verificationStatus: {
          email: status.verificationLevel !== 'NONE',
          phone: status.verificationLevel === 'PHONE' || status.verificationLevel === 'BANKID',
          bankId: status.verificationLevel === 'BANKID',
          enhanced: status.verificationLevel === 'BANKID', // Enhanced KYC with BankID
        },
        pendingVerifications: status.pendingVerifications,
        amlStatus: status.amlStatus,
        lastVerified: status.lastVerified,
        capabilities: {
          maxTransactionAmount: this.getMaxTransactionAmount(status.verificationLevel),
          canSellBusiness: status.verificationLevel === 'BANKID',
          canBuyBusiness: status.verificationLevel !== 'NONE',
          requiresAdditionalVerification: status.verificationLevel === 'NONE',
        },
        nextSteps: this.getVerificationNextSteps(status.verificationLevel),
      },
    });
  } catch (error) {
    console.error('Get verification status failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve verification status'
    });
  }
};

export const uploadVerificationDocument = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { documentType, documentSide = 'front' } = req.body;

    // In production, handle file upload with multer or similar
    // For now, simulate file upload
    const mockFileUrl = `https://storage.tubba.se/documents/${userId}/${documentType}-${documentSide}-${Date.now()}.jpg`;

    res.json({
      success: true,
      message: 'Document uploaded successfully',
      data: {
        fileUrl: mockFileUrl,
        documentType,
        documentSide,
        uploadedAt: new Date(),
        instructions: documentSide === 'front' 
          ? 'Ladda nu upp baksidan av dokumentet om det finns information där'
          : 'Dokument komplett. Du kan nu starta verifieringsprocessen.',
      },
    });
  } catch (error) {
    console.error('Document upload failed:', error);
    res.status(500).json({
      error: 'Failed to upload verification document'
    });
  }
};

export const getKYCRequirements = async (req: Request, res: Response) => {
  try {
    const { transactionAmount, transactionType = 'business_sale' } = req.query;

    const requirements = {
      basicVerification: {
        required: true,
        description: 'E-postverifiering och grundläggande profilinformation',
        documents: ['Email verification'],
        estimatedTime: '5 minuter',
      },
      documentVerification: {
        required: Number(transactionAmount) > 100000, // 100k SEK
        description: 'Identitetshandling (pass, körkort eller nationellt ID)',
        documents: ['Government-issued photo ID'],
        estimatedTime: '10-15 minuter',
      },
      bankIdVerification: {
        required: Number(transactionAmount) > 500000, // 500k SEK
        description: 'BankID-verifiering för högsta säkerhetsnivå',
        documents: ['Swedish BankID'],
        estimatedTime: '2-3 minuter',
      },
      enhancedDueDiligence: {
        required: Number(transactionAmount) > 2000000, // 2M SEK
        description: 'Utökad due diligence för höga transaktionsbelopp',
        documents: ['Proof of funds', 'Source of wealth documentation'],
        estimatedTime: '1-3 arbetsdagar',
      },
      amlScreening: {
        required: true,
        description: 'Automatisk screening mot sanktionslistor',
        documents: ['None (automatic)'],
        estimatedTime: 'Omedelbart',
      },
    };

    // Additional requirements for business sales
    if (transactionType === 'business_sale') {
      requirements.enhancedDueDiligence.required = Number(transactionAmount) > 1000000; // Lower threshold for business sales
    }

    res.json({
      success: true,
      data: {
        transactionAmount: Number(transactionAmount),
        transactionType,
        requirements,
        complianceLevel: this.determineComplianceLevel(Number(transactionAmount)),
        legalNotice: 'Alla verifieringar genomförs enligt svensk AML-lagstiftning och GDPR.',
      },
    });
  } catch (error) {
    console.error('Get KYC requirements failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve KYC requirements'
    });
  }
};

// Admin endpoints
export const getComplianceOverview = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    // Mock compliance statistics
    const overview = {
      userVerificationStats: {
        totalUsers: 1250,
        verifiedUsers: 890,
        pendingVerifications: 45,
        rejectedVerifications: 12,
        bankIdVerified: 650,
      },
      amlStats: {
        totalScreenings: 1890,
        matches: 8,
        falsePositives: 6,
        reviewsPending: 2,
        highRiskUsers: 1,
      },
      recentActivity: [
        {
          type: 'BANKID_VERIFICATION',
          userId: 'user-123',
          status: 'APPROVED',
          timestamp: new Date(),
        },
        {
          type: 'AML_SCREENING',
          userId: 'user-456',
          status: 'MATCH_FOUND',
          timestamp: new Date(Date.now() - 30 * 60 * 1000),
        },
      ],
      complianceMetrics: {
        verificationSuccessRate: 94.2,
        averageVerificationTime: 12.5, // minutes
        amlMatchRate: 0.42, // percentage
        manualReviewRate: 8.1, // percentage
      },
    };

    res.json({
      success: true,
      data: overview,
    });
  } catch (error) {
    console.error('Get compliance overview failed:', error);
    res.status(500).json({
      error: 'Failed to retrieve compliance overview'
    });
  }
};

export const reviewPendingVerification = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    const { verificationId } = req.params;
    const { decision, notes } = req.body;

    if (!['APPROVE', 'REJECT', 'REQUEST_MORE_INFO'].includes(decision)) {
      return res.status(400).json({
        error: 'Invalid decision. Must be APPROVE, REJECT, or REQUEST_MORE_INFO'
      });
    }

    // In production, update verification record and notify user
    console.log('Manual review decision:', { verificationId, decision, notes, reviewedBy: req.user!.id });

    res.json({
      success: true,
      message: `Verification ${decision.toLowerCase()}d successfully`,
      data: {
        verificationId,
        decision,
        reviewedBy: req.user!.id,
        reviewedAt: new Date(),
        notes,
      },
    });
  } catch (error) {
    console.error('Verification review failed:', error);
    res.status(500).json({
      error: 'Failed to review verification'
    });
  }
};

// Helper methods
function getMaxTransactionAmount(verificationLevel: string): number {
  switch (verificationLevel) {
    case 'NONE': return 10000; // 10k SEK
    case 'EMAIL': return 100000; // 100k SEK  
    case 'PHONE': return 500000; // 500k SEK
    case 'BANKID': return 10000000; // 10M SEK
    default: return 10000;
  }
}

function getVerificationNextSteps(verificationLevel: string): string[] {
  switch (verificationLevel) {
    case 'NONE':
      return [
        'Verifiera din e-postadress',
        'Fyll i din profil med personuppgifter',
        'Ladda upp en identitetshandling för högre gränser'
      ];
    case 'EMAIL':
      return [
        'Ladda upp identitetshandling för dokumentverifiering',
        'Genomför BankID-verifiering för högsta säkerhetsnivå'
      ];
    case 'PHONE':
      return [
        'Genomför BankID-verifiering för att sälja företag',
        'Du kan nu köpa företag upp till 500,000 SEK'
      ];
    case 'BANKID':
      return [
        'Du är fullt verifierad och kan använda alla funktioner',
        'Transaktioner över 2M SEK kan kräva ytterligare dokumentation'
      ];
    default:
      return [];
  }
}

function determineComplianceLevel(amount: number): string {
  if (amount >= 2000000) return 'ENHANCED_DUE_DILIGENCE';
  if (amount >= 500000) return 'BANKID_REQUIRED';
  if (amount >= 100000) return 'DOCUMENT_VERIFICATION';
  return 'BASIC_VERIFICATION';
}