import { PrismaClient, User, VerificationLevel } from '@prisma/client';
import { notificationService } from '../notificationService';
import axios from 'axios';

const prisma = new PrismaClient();

interface KYCVerificationRequest {
  userId: string;
  verificationType: VerificationType;
  documentType: DocumentType;
  documentData: {
    documentNumber: string;
    issuingCountry: string;
    expiryDate?: Date;
    frontImageUrl: string;
    backImageUrl?: string;
  };
  personalData: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationalId: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
  };
}

interface AMLCheckRequest {
  userId: string;
  checkType: AMLCheckType;
  personalData: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    nationalId: string;
    countryOfBirth?: string;
    nationality?: string;
  };
  businessData?: {
    companyName: string;
    registrationNumber: string;
    jurisdiction: string;
  };
}

interface BankIDVerificationRequest {
  userId: string;
  personalNumber: string;
  endUserIp: string;
  requirement?: {
    cardReader?: 'class1' | 'class2';
    certificatePolicies?: string[];
    issuerCn?: string;
    autoStartTokenRequired?: boolean;
  };
}

enum VerificationType {
  DOCUMENT_VERIFICATION = 'DOCUMENT_VERIFICATION',
  BANKID_VERIFICATION = 'BANKID_VERIFICATION',
  BIOMETRIC_VERIFICATION = 'BIOMETRIC_VERIFICATION',
  ADDRESS_VERIFICATION = 'ADDRESS_VERIFICATION',
  ENHANCED_DUE_DILIGENCE = 'ENHANCED_DUE_DILIGENCE',
}

enum DocumentType {
  PASSPORT = 'PASSPORT',
  NATIONAL_ID = 'NATIONAL_ID',
  DRIVERS_LICENSE = 'DRIVERS_LICENSE',
  RESIDENCE_PERMIT = 'RESIDENCE_PERMIT',
}

enum AMLCheckType {
  SANCTIONS_SCREENING = 'SANCTIONS_SCREENING',
  PEP_SCREENING = 'PEP_SCREENING', // Politically Exposed Persons
  WATCHLIST_SCREENING = 'WATCHLIST_SCREENING',
  ADVERSE_MEDIA = 'ADVERSE_MEDIA',
  COMPREHENSIVE_SCREENING = 'COMPREHENSIVE_SCREENING',
}

enum VerificationStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  REQUIRES_MANUAL_REVIEW = 'REQUIRES_MANUAL_REVIEW',
  EXPIRED = 'EXPIRED',
}

enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

interface VerificationResult {
  verificationId: string;
  status: VerificationStatus;
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  findings: VerificationFinding[];
  documentAnalysis?: DocumentAnalysis;
  amlResults?: AMLResult[];
  reviewRequired: boolean;
  expiresAt?: Date;
}

interface VerificationFinding {
  type: 'IDENTITY_MISMATCH' | 'DOCUMENT_TAMPERING' | 'EXPIRED_DOCUMENT' | 'ADDRESS_MISMATCH' | 'SANCTIONS_HIT' | 'PEP_MATCH' | 'ADVERSE_MEDIA';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  details: Record<string, any>;
}

interface DocumentAnalysis {
  documentValid: boolean;
  faceMatch: boolean;
  documentIntegrity: number; // 0-100
  ocrAccuracy: number; // 0-100
  tampering: {
    detected: boolean;
    confidence: number;
    areas: string[];
  };
}

interface AMLResult {
  checkType: AMLCheckType;
  matches: AMLMatch[];
  riskScore: number; // 0-100
  lastChecked: Date;
}

interface AMLMatch {
  listType: 'SANCTIONS' | 'PEP' | 'WATCHLIST' | 'ADVERSE_MEDIA';
  matchConfidence: number; // 0-100
  entityName: string;
  description: string;
  source: string;
  dateAdded?: Date;
  additionalInfo?: Record<string, any>;
}

class KYCAMLService {
  private notificationService: NotificationService;
  
  // Third-party service configurations
  private bankIdConfig = {
    baseUrl: process.env.BANKID_API_URL || 'https://appapi2.test.bankid.com',
    certPath: process.env.BANKID_CERT_PATH,
    keyPath: process.env.BANKID_KEY_PATH,
    ca: process.env.BANKID_CA_PATH,
  };

  private kycProviderConfig = {
    // Configuration for KYC provider (e.g., Onfido, Jumio, etc.)
    baseUrl: process.env.KYC_PROVIDER_URL,
    apiKey: process.env.KYC_PROVIDER_API_KEY,
    webhookSecret: process.env.KYC_WEBHOOK_SECRET,
  };

  private amlProviderConfig = {
    // Configuration for AML provider (e.g., ComplyAdvantage, Thomson Reuters, etc.)
    baseUrl: process.env.AML_PROVIDER_URL,
    apiKey: process.env.AML_PROVIDER_API_KEY,
  };

  constructor() {
    notificationService = notificationService;
  }

  // Initiate KYC verification process
  async initiateKYCVerification(request: KYCVerificationRequest): Promise<VerificationResult> {
    try {
      const verificationId = this.generateVerificationId();
      
      // Create verification record
      await this.createVerificationRecord({
        verificationId,
        userId: request.userId,
        type: request.verificationType,
        status: VerificationStatus.PENDING,
        startedAt: new Date(),
      });

      let result: VerificationResult;

      switch (request.verificationType) {
        case VerificationType.DOCUMENT_VERIFICATION:
          result = await this.performDocumentVerification(verificationId, request);
          break;
        case VerificationType.BANKID_VERIFICATION:
          result = await this.initiateBankIDVerification(verificationId, {
            userId: request.userId,
            personalNumber: request.personalData.nationalId,
            endUserIp: '127.0.0.1', // Should come from request
          });
          break;
        case VerificationType.ADDRESS_VERIFICATION:
          result = await this.performAddressVerification(verificationId, request);
          break;
        case VerificationType.ENHANCED_DUE_DILIGENCE:
          result = await this.performEnhancedDueDiligence(verificationId, request);
          break;
        default:
          throw new Error(`Unsupported verification type: ${request.verificationType}`);
      }

      // Update verification record with results
      await this.updateVerificationRecord(verificationId, result);

      // Update user verification level if approved
      if (result.status === VerificationStatus.APPROVED) {
        await this.updateUserVerificationLevel(request.userId, request.verificationType);
      }

      // Send notification to user
      await this.sendVerificationNotification(request.userId, result);

      return result;
    } catch (error) {
      console.error('KYC verification failed:', error);
      throw new Error(`KYC verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Perform AML screening
  async performAMLCheck(request: AMLCheckRequest): Promise<AMLResult[]> {
    try {
      const results: AMLResult[] = [];

      // Determine which AML checks to perform based on risk level
      const checksToPerform = this.determineAMLChecks(request.checkType);

      for (const checkType of checksToPerform) {
        try {
          const result = await this.performSpecificAMLCheck(checkType, request);
          results.push(result);
        } catch (error) {
          console.error(`AML check ${checkType} failed:`, error);
          // Continue with other checks even if one fails
        }
      }

      // Store AML results
      await this.storeAMLResults(request.userId, results);

      // Assess overall risk level
      const overallRisk = this.assessAMLRisk(results);

      // Take action based on risk level
      if (overallRisk === RiskLevel.HIGH || overallRisk === RiskLevel.CRITICAL) {
        await this.handleHighRiskUser(request.userId, results);
      }

      return results;
    } catch (error) {
      console.error('AML check failed:', error);
      throw new Error(`AML check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Initiate BankID verification (Swedish)
  async initiateBankIDVerification(verificationId: string, request: BankIDVerificationRequest): Promise<VerificationResult> {
    try {
      // This is a simplified BankID integration
      // In production, use the official BankID library and certificates
      
      const authRequest = {
        personalNumber: request.personalNumber,
        endUserIp: request.endUserIp,
        requirement: request.requirement || {},
      };

      // Mock BankID response for development
      const mockBankIDResponse = {
        orderRef: `bankid-${Date.now()}`,
        autoStartToken: 'mock-auto-start-token',
        qrStartToken: 'mock-qr-start-token',
        qrStartSecret: 'mock-qr-secret',
      };

      // Store BankID session
      await this.storeBankIDSession(verificationId, mockBankIDResponse.orderRef);

      // In production, poll BankID status or handle webhook
      // For now, simulate successful verification
      await this.simulateBankIDCompletion(verificationId);

      return {
        verificationId,
        status: VerificationStatus.APPROVED,
        riskLevel: RiskLevel.LOW,
        confidence: 98,
        findings: [],
        reviewRequired: false,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      };
    } catch (error) {
      console.error('BankID verification failed:', error);
      throw new Error(`BankID verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Document verification using third-party provider
  private async performDocumentVerification(verificationId: string, request: KYCVerificationRequest): Promise<VerificationResult> {
    try {
      // Mock document analysis - in production, integrate with Onfido, Jumio, etc.
      const mockAnalysis: DocumentAnalysis = {
        documentValid: true,
        faceMatch: true,
        documentIntegrity: 95,
        ocrAccuracy: 98,
        tampering: {
          detected: false,
          confidence: 2,
          areas: [],
        },
      };

      const findings: VerificationFinding[] = [];
      
      // Check for potential issues
      if (mockAnalysis.documentIntegrity < 80) {
        findings.push({
          type: 'DOCUMENT_TAMPERING',
          severity: 'HIGH',
          description: 'Document shows signs of potential tampering',
          details: { integrity: mockAnalysis.documentIntegrity },
        });
      }

      if (!mockAnalysis.faceMatch) {
        findings.push({
          type: 'IDENTITY_MISMATCH',
          severity: 'CRITICAL',
          description: 'Face does not match document photo',
          details: {},
        });
      }

      // Check document expiry
      if (request.documentData.expiryDate && request.documentData.expiryDate < new Date()) {
        findings.push({
          type: 'EXPIRED_DOCUMENT',
          severity: 'HIGH',
          description: 'Document has expired',
          details: { expiryDate: request.documentData.expiryDate },
        });
      }

      const riskLevel = this.calculateRiskLevel(findings);
      const status = this.determineVerificationStatus(findings, mockAnalysis);

      return {
        verificationId,
        status,
        riskLevel,
        confidence: mockAnalysis.documentIntegrity,
        findings,
        documentAnalysis: mockAnalysis,
        reviewRequired: findings.some(f => f.severity === 'HIGH' || f.severity === 'CRITICAL'),
      };
    } catch (error) {
      console.error('Document verification failed:', error);
      throw new Error('Document verification failed');
    }
  }

  // Address verification
  private async performAddressVerification(verificationId: string, request: KYCVerificationRequest): Promise<VerificationResult> {
    try {
      // Mock address verification - in production, use postal service APIs
      const isValidAddress = await this.validateAddress(request.personalData.address);
      
      const findings: VerificationFinding[] = [];
      
      if (!isValidAddress) {
        findings.push({
          type: 'ADDRESS_MISMATCH',
          severity: 'MEDIUM',
          description: 'Address could not be verified',
          details: { address: request.personalData.address },
        });
      }

      return {
        verificationId,
        status: isValidAddress ? VerificationStatus.APPROVED : VerificationStatus.REQUIRES_MANUAL_REVIEW,
        riskLevel: isValidAddress ? RiskLevel.LOW : RiskLevel.MEDIUM,
        confidence: isValidAddress ? 85 : 40,
        findings,
        reviewRequired: !isValidAddress,
      };
    } catch (error) {
      console.error('Address verification failed:', error);
      throw new Error('Address verification failed');
    }
  }

  // Enhanced due diligence for high-value transactions
  private async performEnhancedDueDiligence(verificationId: string, request: KYCVerificationRequest): Promise<VerificationResult> {
    try {
      // Perform comprehensive checks
      const documentResult = await this.performDocumentVerification(verificationId, request);
      const amlResults = await this.performAMLCheck({
        userId: request.userId,
        checkType: AMLCheckType.COMPREHENSIVE_SCREENING,
        personalData: request.personalData,
      });

      // Combine results
      const allFindings = [
        ...documentResult.findings,
        ...amlResults.flatMap(r => r.matches.map(match => ({
          type: this.mapAMLToFindingType(match.listType),
          severity: this.mapConfidenceToSeverity(match.matchConfidence),
          description: `AML match: ${match.entityName}`,
          details: match,
        } as VerificationFinding))),
      ];

      const overallRisk = this.calculateRiskLevel(allFindings);
      const status = allFindings.some(f => f.severity === 'CRITICAL') 
        ? VerificationStatus.REJECTED 
        : VerificationStatus.APPROVED;

      return {
        verificationId,
        status,
        riskLevel: overallRisk,
        confidence: Math.min(documentResult.confidence, 100 - Math.max(...amlResults.map(r => r.riskScore))),
        findings: allFindings,
        documentAnalysis: documentResult.documentAnalysis,
        amlResults,
        reviewRequired: overallRisk === RiskLevel.HIGH || overallRisk === RiskLevel.CRITICAL,
      };
    } catch (error) {
      console.error('Enhanced due diligence failed:', error);
      throw new Error('Enhanced due diligence failed');
    }
  }

  // Perform specific AML check
  private async performSpecificAMLCheck(checkType: AMLCheckType, request: AMLCheckRequest): Promise<AMLResult> {
    try {
      // Mock AML screening - in production, integrate with ComplyAdvantage, World-Check, etc.
      const mockMatches: AMLMatch[] = [];
      
      // Simulate potential matches based on check type
      if (checkType === AMLCheckType.SANCTIONS_SCREENING) {
        // Usually no matches for normal users
        if (Math.random() < 0.01) { // 1% chance of false positive for testing
          mockMatches.push({
            listType: 'SANCTIONS',
            matchConfidence: 75,
            entityName: 'Similar Name (Different Person)',
            description: 'Name similarity to sanctioned individual',
            source: 'EU Sanctions List',
            dateAdded: new Date('2020-01-01'),
          });
        }
      }

      const riskScore = mockMatches.length > 0 
        ? Math.max(...mockMatches.map(m => m.matchConfidence))
        : Math.floor(Math.random() * 10); // Base risk score 0-10

      return {
        checkType,
        matches: mockMatches,
        riskScore,
        lastChecked: new Date(),
      };
    } catch (error) {
      console.error(`AML check ${checkType} failed:`, error);
      throw new Error(`AML check failed: ${checkType}`);
    }
  }

  // Helper methods
  private generateVerificationId(): string {
    return `KYC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineAMLChecks(checkType: AMLCheckType): AMLCheckType[] {
    switch (checkType) {
      case AMLCheckType.COMPREHENSIVE_SCREENING:
        return [
          AMLCheckType.SANCTIONS_SCREENING,
          AMLCheckType.PEP_SCREENING,
          AMLCheckType.WATCHLIST_SCREENING,
          AMLCheckType.ADVERSE_MEDIA,
        ];
      default:
        return [checkType];
    }
  }

  private calculateRiskLevel(findings: VerificationFinding[]): RiskLevel {
    if (findings.some(f => f.severity === 'CRITICAL')) return RiskLevel.CRITICAL;
    if (findings.some(f => f.severity === 'HIGH')) return RiskLevel.HIGH;
    if (findings.some(f => f.severity === 'MEDIUM')) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private determineVerificationStatus(findings: VerificationFinding[], analysis: DocumentAnalysis): VerificationStatus {
    if (findings.some(f => f.severity === 'CRITICAL')) return VerificationStatus.REJECTED;
    if (findings.some(f => f.severity === 'HIGH')) return VerificationStatus.REQUIRES_MANUAL_REVIEW;
    if (analysis.documentIntegrity < 70) return VerificationStatus.REQUIRES_MANUAL_REVIEW;
    return VerificationStatus.APPROVED;
  }

  private assessAMLRisk(results: AMLResult[]): RiskLevel {
    const maxRiskScore = Math.max(...results.map(r => r.riskScore), 0);
    
    if (maxRiskScore >= 80) return RiskLevel.CRITICAL;
    if (maxRiskScore >= 60) return RiskLevel.HIGH;
    if (maxRiskScore >= 30) return RiskLevel.MEDIUM;
    return RiskLevel.LOW;
  }

  private mapAMLToFindingType(listType: string): VerificationFinding['type'] {
    switch (listType) {
      case 'SANCTIONS': return 'SANCTIONS_HIT';
      case 'PEP': return 'PEP_MATCH';
      case 'ADVERSE_MEDIA': return 'ADVERSE_MEDIA';
      default: return 'SANCTIONS_HIT';
    }
  }

  private mapConfidenceToSeverity(confidence: number): VerificationFinding['severity'] {
    if (confidence >= 90) return 'CRITICAL';
    if (confidence >= 70) return 'HIGH';
    if (confidence >= 50) return 'MEDIUM';
    return 'LOW';
  }

  private async validateAddress(address: any): Promise<boolean> {
    // Mock address validation - in production, use postal service APIs
    return address.street && address.city && address.postalCode && address.country;
  }

  private async createVerificationRecord(record: any): Promise<void> {
    // Store verification record in database
    console.log('KYC Verification Record Created:', record);
  }

  private async updateVerificationRecord(verificationId: string, result: VerificationResult): Promise<void> {
    // Update verification record with results
    console.log('KYC Verification Record Updated:', { verificationId, result });
  }

  private async updateUserVerificationLevel(userId: string, verificationType: VerificationType): Promise<void> {
    try {
      let newLevel: VerificationLevel;
      
      switch (verificationType) {
        case VerificationType.DOCUMENT_VERIFICATION:
          newLevel = VerificationLevel.EMAIL; // Basic verification
          break;
        case VerificationType.BANKID_VERIFICATION:
          newLevel = VerificationLevel.BANKID;
          await prisma.user.update({
            where: { id: userId },
            data: { isBankIdVerified: true },
          });
          break;
        default:
          return;
      }

      await prisma.user.update({
        where: { id: userId },
        data: { verificationLevel: newLevel },
      });
    } catch (error) {
      console.error('Failed to update user verification level:', error);
    }
  }

  private async sendVerificationNotification(userId: string, result: VerificationResult): Promise<void> {
    const title = result.status === VerificationStatus.APPROVED 
      ? 'Verifiering godkänd'
      : result.status === VerificationStatus.REJECTED
      ? 'Verifiering avvisad'
      : 'Verifiering kräver granskning';

    const content = result.status === VerificationStatus.APPROVED
      ? 'Din identitetsverifiering har godkänts. Du kan nu använda alla funktioner på plattformen.'
      : result.status === VerificationStatus.REJECTED
      ? 'Din identitetsverifiering kunde inte godkännas. Kontakta support för hjälp.'
      : 'Din identitetsverifiering kräver manuell granskning. Vi återkommer inom 24 timmar.';

    await notificationService.createNotification({
      userId,
      type: 'SYSTEM',
      title,
      content,
      data: { 
        verificationId: result.verificationId,
        riskLevel: result.riskLevel,
      },
      channel: 'EMAIL',
    });
  }

  private async storeAMLResults(userId: string, results: AMLResult[]): Promise<void> {
    // Store AML results in database
    console.log('AML Results Stored:', { userId, results });
  }

  private async handleHighRiskUser(userId: string, results: AMLResult[]): Promise<void> {
    // Flag user for manual review, potentially freeze account
    console.log('High Risk User Detected:', { userId, results });
    
    // Notify compliance team
    await notificationService.createNotification({
      userId: 'COMPLIANCE_TEAM',
      type: 'SYSTEM',
      title: 'Högrisk användare upptäckt',
      content: `Användare ${userId} har flaggats för högrisk i AML-screening.`,
      data: { userId, results },
      channel: 'EMAIL',
    });
  }

  private async storeBankIDSession(verificationId: string, orderRef: string): Promise<void> {
    // Store BankID session for polling
    console.log('BankID Session Stored:', { verificationId, orderRef });
  }

  private async simulateBankIDCompletion(verificationId: string): Promise<void> {
    // Simulate BankID completion after delay
    setTimeout(() => {
      console.log('BankID Verification Completed:', verificationId);
    }, 5000);
  }

  // Public methods for getting verification status
  async getVerificationStatus(userId: string): Promise<{
    verificationLevel: VerificationLevel;
    pendingVerifications: any[];
    amlStatus: string;
    lastVerified?: Date;
  }> {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          verificationLevel: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isBankIdVerified: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Get pending verifications (mock data)
      const pendingVerifications: any[] = [];

      return {
        verificationLevel: user.verificationLevel,
        pendingVerifications,
        amlStatus: 'CLEAR', // Would be calculated from actual AML results
        lastVerified: user.isBankIdVerified ? new Date() : undefined,
      };
    } catch (error) {
      console.error('Failed to get verification status:', error);
      throw new Error('Failed to get verification status');
    }
  }
}

export { 
  KYCAMLService, 
  VerificationType, 
  DocumentType, 
  AMLCheckType, 
  VerificationStatus, 
  RiskLevel,
  KYCVerificationRequest,
  AMLCheckRequest,
  VerificationResult,
  AMLResult 
};