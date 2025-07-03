import axios from 'axios';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BolagsverketCompanyData {
  organizationNumber: string;
  companyName: string;
  legalForm: string;
  status: 'ACTIVE' | 'INACTIVE' | 'BANKRUPTCY' | 'LIQUIDATION';
  registrationDate: Date;
  county: string;
  municipality: string;
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  industry: {
    code: string;
    description: string;
  };
  authorizedSignatories: CompanySignatory[];
  boardMembers: BoardMember[];
  shareholders?: Shareholder[];
  financialData?: {
    shareCapital: number;
    currency: string;
    numberOfShares: number;
  };
  lastUpdated: Date;
}

interface CompanySignatory {
  name: string;
  personalNumber?: string;
  role: string;
  signatureRight: 'INDIVIDUAL' | 'JOINT' | 'CONDITIONAL';
  registeredDate: Date;
}

interface BoardMember {
  name: string;
  personalNumber?: string;
  role: 'CHAIRMAN' | 'MEMBER' | 'DEPUTY';
  appointedDate: Date;
  address?: string;
}

interface Shareholder {
  name: string;
  personalNumber?: string;
  organizationNumber?: string;
  shareCount: number;
  sharePercentage: number;
  shareClass?: string;
}

interface CompanyVerificationResult {
  organizationNumber: string;
  isValid: boolean;
  isActive: boolean;
  companyExists: boolean;
  verificationLevel: 'BASIC' | 'VERIFIED' | 'ENHANCED';
  riskIndicators: RiskIndicator[];
  lastVerified: Date;
  dataSource: 'BOLAGSVERKET' | 'CACHE' | 'MANUAL';
}

interface RiskIndicator {
  type: 'INACTIVE_COMPANY' | 'BANKRUPTCY' | 'LIQUIDATION' | 'MISSING_SIGNATORY' | 'RECENT_CHANGES' | 'PEP_CONNECTED';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  detectedAt: Date;
}

interface CompanySearchResult {
  organizationNumber: string;
  companyName: string;
  legalForm: string;
  status: string;
  municipality: string;
  matchScore: number; // 0-100
}

class BolagsverketService {
  private apiConfig = {
    baseUrl: process.env.BOLAGSVERKET_API_URL || 'https://api.bolagsverket.se',
    apiKey: process.env.BOLAGSVERKET_API_KEY,
    timeout: 30000,
  };

  private cacheTimeout = 24 * 60 * 60 * 1000; // 24 hours

  constructor() {
    if (!this.apiConfig.apiKey) {
      console.warn('Bolagsverket API key not configured - using mock data');
    }
  }

  // Get complete company information by organization number
  async getCompanyData(organizationNumber: string): Promise<BolagsverketCompanyData> {
    try {
      // Validate organization number format
      const cleanOrgNumber = this.validateAndCleanOrgNumber(organizationNumber);
      
      // Check cache first
      const cached = await this.getCachedCompanyData(cleanOrgNumber);
      if (cached && this.isCacheValid(cached.lastUpdated)) {
        return cached;
      }

      // Fetch from Bolagsverket API
      const companyData = await this.fetchFromBolagsverket(cleanOrgNumber);
      
      // Cache the result
      await this.cacheCompanyData(companyData);
      
      return companyData;
    } catch (error) {
      console.error('Failed to get company data:', error);
      throw new Error(`Failed to retrieve company data: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Verify company exists and is active
  async verifyCompany(organizationNumber: string): Promise<CompanyVerificationResult> {
    try {
      const cleanOrgNumber = this.validateAndCleanOrgNumber(organizationNumber);
      
      // Get company data
      const companyData = await this.getCompanyData(cleanOrgNumber);
      
      // Analyze for risk indicators
      const riskIndicators = this.analyzeCompanyRisks(companyData);
      
      // Determine verification level
      const verificationLevel = this.determineVerificationLevel(companyData, riskIndicators);
      
      const result: CompanyVerificationResult = {
        organizationNumber: cleanOrgNumber,
        isValid: true,
        isActive: companyData.status === 'ACTIVE',
        companyExists: true,
        verificationLevel,
        riskIndicators,
        lastVerified: new Date(),
        dataSource: 'BOLAGSVERKET',
      };

      // Store verification result
      await this.storeVerificationResult(result);
      
      return result;
    } catch (error) {
      console.error('Company verification failed:', error);
      
      // Return failure result
      return {
        organizationNumber,
        isValid: false,
        isActive: false,
        companyExists: false,
        verificationLevel: 'BASIC',
        riskIndicators: [{
          type: 'MISSING_SIGNATORY',
          severity: 'HIGH',
          description: 'Could not verify company information',
          detectedAt: new Date(),
        }],
        lastVerified: new Date(),
        dataSource: 'MANUAL',
      };
    }
  }

  // Search companies by name or partial organization number
  async searchCompanies(query: string, limit = 20): Promise<CompanySearchResult[]> {
    try {
      if (this.isOrganizationNumber(query)) {
        // Search by organization number
        const cleanOrgNumber = this.validateAndCleanOrgNumber(query);
        const company = await this.getCompanyData(cleanOrgNumber);
        
        return [{
          organizationNumber: company.organizationNumber,
          companyName: company.companyName,
          legalForm: company.legalForm,
          status: company.status,
          municipality: company.municipality,
          matchScore: 100,
        }];
      } else {
        // Search by company name
        return await this.searchCompaniesByName(query, limit);
      }
    } catch (error) {
      console.error('Company search failed:', error);
      return [];
    }
  }

  // Get company ownership structure
  async getOwnershipStructure(organizationNumber: string): Promise<{
    shareholders: Shareholder[];
    controllingInterests: any[];
    ultimateBeneficialOwners: any[];
    ownershipTransparency: number; // 0-100
  }> {
    try {
      const companyData = await this.getCompanyData(organizationNumber);
      
      // In Sweden, ownership information is not always fully public
      // This would integrate with additional data sources or manual verification
      
      const shareholders = companyData.shareholders || [];
      const ownershipTransparency = this.calculateOwnershipTransparency(shareholders);
      
      return {
        shareholders,
        controllingInterests: this.identifyControllingInterests(shareholders),
        ultimateBeneficialOwners: await this.traceUltimateBeneficialOwners(shareholders),
        ownershipTransparency,
      };
    } catch (error) {
      console.error('Failed to get ownership structure:', error);
      throw new Error('Failed to retrieve ownership structure');
    }
  }

  // Check if person is authorized signatory
  async isAuthorizedSignatory(organizationNumber: string, personalNumber: string): Promise<{
    isAuthorized: boolean;
    role?: string;
    signatureRight?: string;
    validFrom?: Date;
  }> {
    try {
      const companyData = await this.getCompanyData(organizationNumber);
      
      const signatory = companyData.authorizedSignatories.find(
        s => s.personalNumber === personalNumber
      );
      
      if (signatory) {
        return {
          isAuthorized: true,
          role: signatory.role,
          signatureRight: signatory.signatureRight,
          validFrom: signatory.registeredDate,
        };
      }
      
      return { isAuthorized: false };
    } catch (error) {
      console.error('Failed to check signatory authorization:', error);
      return { isAuthorized: false };
    }
  }

  // Get company financial indicators
  async getFinancialIndicators(organizationNumber: string): Promise<{
    creditRating?: string;
    riskScore: number; // 0-100
    paymentBehavior?: 'GOOD' | 'AVERAGE' | 'POOR';
    lastAnnualReport?: Date;
    shareCapital: number;
    estimatedTurnover?: number;
  }> {
    try {
      const companyData = await this.getCompanyData(organizationNumber);
      
      // Basic financial information from Bolagsverket
      const financialData = companyData.financialData;
      
      // Calculate basic risk score based on available data
      const riskScore = this.calculateCompanyRiskScore(companyData);
      
      return {
        creditRating: 'N/A', // Would require integration with credit agencies
        riskScore,
        paymentBehavior: 'AVERAGE', // Would require payment data
        shareCapital: financialData?.shareCapital || 0,
        estimatedTurnover: undefined, // Would require annual reports
      };
    } catch (error) {
      console.error('Failed to get financial indicators:', error);
      throw new Error('Failed to retrieve financial indicators');
    }
  }

  // Private helper methods
  private validateAndCleanOrgNumber(orgNumber: string): string {
    // Remove spaces, hyphens, and other formatting
    const cleaned = orgNumber.replace(/[\s-]/g, '');
    
    // Swedish organization numbers are 10 digits (sometimes with century prefix)
    if (!/^\d{6}-?\d{4}$|^\d{10}$/.test(cleaned)) {
      throw new Error('Invalid Swedish organization number format');
    }
    
    // Ensure 10-digit format
    return cleaned.length === 10 ? cleaned : cleaned.slice(-10);
  }

  private isOrganizationNumber(query: string): boolean {
    const cleaned = query.replace(/[\s-]/g, '');
    return /^\d{6,10}$/.test(cleaned);
  }

  private async fetchFromBolagsverket(organizationNumber: string): Promise<BolagsverketCompanyData> {
    if (!this.apiConfig.apiKey) {
      // Return mock data for development
      return this.getMockCompanyData(organizationNumber);
    }

    try {
      const response = await axios.get(
        `${this.apiConfig.baseUrl}/companies/${organizationNumber}`,
        {
          headers: {
            'Authorization': `Bearer ${this.apiConfig.apiKey}`,
            'Accept': 'application/json',
          },
          timeout: this.apiConfig.timeout,
        }
      );

      return this.transformBolagsverketResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new Error('Company not found in Bolagsverket registry');
      }
      throw new Error('Failed to fetch company data from Bolagsverket');
    }
  }

  private async searchCompaniesByName(name: string, limit: number): Promise<CompanySearchResult[]> {
    if (!this.apiConfig.apiKey) {
      // Return mock search results
      return this.getMockSearchResults(name, limit);
    }

    try {
      const response = await axios.get(
        `${this.apiConfig.baseUrl}/companies/search`,
        {
          params: {
            name,
            limit,
          },
          headers: {
            'Authorization': `Bearer ${this.apiConfig.apiKey}`,
            'Accept': 'application/json',
          },
          timeout: this.apiConfig.timeout,
        }
      );

      return response.data.map(this.transformSearchResult);
    } catch (error) {
      console.error('Company search failed:', error);
      return [];
    }
  }

  private transformBolagsverketResponse(data: any): BolagsverketCompanyData {
    // Transform API response to our internal format
    return {
      organizationNumber: data.organizationNumber,
      companyName: data.name,
      legalForm: data.legalForm,
      status: data.status.toUpperCase(),
      registrationDate: new Date(data.registrationDate),
      county: data.address?.county || '',
      municipality: data.address?.municipality || '',
      address: {
        street: data.address?.street || '',
        postalCode: data.address?.postalCode || '',
        city: data.address?.city || '',
        country: 'Sweden',
      },
      industry: {
        code: data.industry?.code || '',
        description: data.industry?.description || '',
      },
      authorizedSignatories: data.signatories?.map(this.transformSignatory) || [],
      boardMembers: data.boardMembers?.map(this.transformBoardMember) || [],
      shareholders: data.shareholders?.map(this.transformShareholder) || [],
      financialData: data.financialData ? {
        shareCapital: data.financialData.shareCapital,
        currency: data.financialData.currency || 'SEK',
        numberOfShares: data.financialData.numberOfShares,
      } : undefined,
      lastUpdated: new Date(),
    };
  }

  private transformSignatory(data: any): CompanySignatory {
    return {
      name: data.name,
      personalNumber: data.personalNumber,
      role: data.role,
      signatureRight: data.signatureRight || 'INDIVIDUAL',
      registeredDate: new Date(data.registeredDate),
    };
  }

  private transformBoardMember(data: any): BoardMember {
    return {
      name: data.name,
      personalNumber: data.personalNumber,
      role: data.role,
      appointedDate: new Date(data.appointedDate),
      address: data.address,
    };
  }

  private transformShareholder(data: any): Shareholder {
    return {
      name: data.name,
      personalNumber: data.personalNumber,
      organizationNumber: data.organizationNumber,
      shareCount: data.shareCount,
      sharePercentage: data.sharePercentage,
      shareClass: data.shareClass,
    };
  }

  private transformSearchResult(data: any): CompanySearchResult {
    return {
      organizationNumber: data.organizationNumber,
      companyName: data.name,
      legalForm: data.legalForm,
      status: data.status,
      municipality: data.municipality,
      matchScore: data.matchScore || 50,
    };
  }

  private analyzeCompanyRisks(companyData: BolagsverketCompanyData): RiskIndicator[] {
    const risks: RiskIndicator[] = [];

    // Check company status
    if (companyData.status !== 'ACTIVE') {
      risks.push({
        type: companyData.status === 'BANKRUPTCY' ? 'BANKRUPTCY' : 'INACTIVE_COMPANY',
        severity: 'CRITICAL',
        description: `Company status: ${companyData.status}`,
        detectedAt: new Date(),
      });
    }

    // Check for missing authorized signatories
    if (companyData.authorizedSignatories.length === 0) {
      risks.push({
        type: 'MISSING_SIGNATORY',
        severity: 'HIGH',
        description: 'No authorized signatories found',
        detectedAt: new Date(),
      });
    }

    // Check for recent changes (would require historical data)
    // This is a simplified check
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    
    const recentSignatories = companyData.authorizedSignatories.filter(
      s => s.registeredDate > monthAgo
    );

    if (recentSignatories.length > 0) {
      risks.push({
        type: 'RECENT_CHANGES',
        severity: 'MEDIUM',
        description: `${recentSignatories.length} signatory changes in the last month`,
        detectedAt: new Date(),
      });
    }

    return risks;
  }

  private determineVerificationLevel(
    companyData: BolagsverketCompanyData,
    riskIndicators: RiskIndicator[]
  ): 'BASIC' | 'VERIFIED' | 'ENHANCED' {
    const criticalRisks = riskIndicators.filter(r => r.severity === 'CRITICAL');
    const highRisks = riskIndicators.filter(r => r.severity === 'HIGH');

    if (criticalRisks.length > 0) {
      return 'BASIC'; // Cannot be fully verified due to critical issues
    }

    if (highRisks.length > 0 || companyData.authorizedSignatories.length === 0) {
      return 'VERIFIED'; // Basic verification with some concerns
    }

    return 'ENHANCED'; // Full verification possible
  }

  private calculateCompanyRiskScore(companyData: BolagsverketCompanyData): number {
    let riskScore = 0;

    // Status-based risk
    switch (companyData.status) {
      case 'ACTIVE': riskScore += 0; break;
      case 'INACTIVE': riskScore += 30; break;
      case 'LIQUIDATION': riskScore += 70; break;
      case 'BANKRUPTCY': riskScore += 100; break;
    }

    // Age-based risk (newer companies are riskier)
    const companyAge = Date.now() - companyData.registrationDate.getTime();
    const ageInYears = companyAge / (365 * 24 * 60 * 60 * 1000);
    
    if (ageInYears < 1) riskScore += 20;
    else if (ageInYears < 2) riskScore += 10;
    else if (ageInYears < 5) riskScore += 5;

    // Governance risk
    if (companyData.authorizedSignatories.length === 0) riskScore += 25;
    if (companyData.boardMembers.length === 0) riskScore += 15;

    return Math.min(riskScore, 100);
  }

  private calculateOwnershipTransparency(shareholders: Shareholder[]): number {
    if (shareholders.length === 0) return 0;

    const knownOwnership = shareholders.reduce((sum, sh) => sum + sh.sharePercentage, 0);
    return Math.min(knownOwnership, 100);
  }

  private identifyControllingInterests(shareholders: Shareholder[]): any[] {
    return shareholders.filter(sh => sh.sharePercentage >= 25); // 25% threshold for controlling interest
  }

  private async traceUltimateBeneficialOwners(shareholders: Shareholder[]): Promise<any[]> {
    // This would require recursive lookup of corporate shareholders
    // For now, return individuals with significant ownership
    return shareholders.filter(sh => sh.personalNumber && sh.sharePercentage >= 25);
  }

  private async getCachedCompanyData(organizationNumber: string): Promise<BolagsverketCompanyData | null> {
    // In production, implement proper caching (Redis, database, etc.)
    return null;
  }

  private isCacheValid(lastUpdated: Date): boolean {
    return Date.now() - lastUpdated.getTime() < this.cacheTimeout;
  }

  private async cacheCompanyData(companyData: BolagsverketCompanyData): Promise<void> {
    // In production, implement proper caching
    console.log('Caching company data for:', companyData.organizationNumber);
  }

  private async storeVerificationResult(result: CompanyVerificationResult): Promise<void> {
    // Store verification result in database
    console.log('Storing verification result:', result.organizationNumber);
  }

  // Mock data methods for development
  private getMockCompanyData(organizationNumber: string): BolagsverketCompanyData {
    return {
      organizationNumber,
      companyName: `Test Företag AB`,
      legalForm: 'Aktiebolag',
      status: 'ACTIVE',
      registrationDate: new Date('2020-01-15'),
      county: 'Stockholm',
      municipality: 'Stockholm',
      address: {
        street: 'Testgatan 123',
        postalCode: '11122',
        city: 'Stockholm',
        country: 'Sweden',
      },
      industry: {
        code: '62010',
        description: 'Dataprogrammering',
      },
      authorizedSignatories: [
        {
          name: 'Anna Andersson',
          personalNumber: '19801231-1234',
          role: 'VD',
          signatureRight: 'INDIVIDUAL',
          registeredDate: new Date('2020-01-15'),
        },
      ],
      boardMembers: [
        {
          name: 'Anna Andersson',
          personalNumber: '19801231-1234',
          role: 'CHAIRMAN',
          appointedDate: new Date('2020-01-15'),
        },
      ],
      shareholders: [
        {
          name: 'Anna Andersson',
          personalNumber: '19801231-1234',
          shareCount: 1000,
          sharePercentage: 100,
          shareClass: 'A',
        },
      ],
      financialData: {
        shareCapital: 100000,
        currency: 'SEK',
        numberOfShares: 1000,
      },
      lastUpdated: new Date(),
    };
  }

  private getMockSearchResults(query: string, limit: number): CompanySearchResult[] {
    return [
      {
        organizationNumber: '5566778899',
        companyName: `${query} AB`,
        legalForm: 'Aktiebolag',
        status: 'ACTIVE',
        municipality: 'Stockholm',
        matchScore: 95,
      },
      {
        organizationNumber: '1122334455',
        companyName: `${query} HB`,
        legalForm: 'Handelsbolag',
        status: 'ACTIVE',
        municipality: 'Göteborg',
        matchScore: 85,
      },
    ].slice(0, limit);
  }
}

export { 
  BolagsverketService, 
  BolagsverketCompanyData, 
  CompanyVerificationResult,
  CompanySearchResult,
  CompanySignatory,
  BoardMember,
  Shareholder,
  RiskIndicator
};