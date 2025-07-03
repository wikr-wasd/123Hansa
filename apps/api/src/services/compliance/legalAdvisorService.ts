import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface LegalAdvisor {
  id: string;
  name: string;
  firmName: string;
  specializations: LegalSpecialization[];
  credentials: LegalCredential[];
  location: {
    city: string;
    region: string;
    country: string;
  };
  contact: {
    email: string;
    phone: string;
    website?: string;
    linkedIn?: string;
  };
  languages: string[];
  experience: {
    yearsOfPractice: number;
    totalTransactions: number;
    averageTransactionValue: number;
    successRate: number;
  };
  availability: {
    isAvailable: boolean;
    nextAvailableDate?: Date;
    typicalResponseTime: string;
    workingHours: {
      timezone: string;
      schedule: Record<string, { start: string; end: string }>;
    };
  };
  pricing: {
    hourlyRate: {
      min: number;
      max: number;
      currency: string;
    };
    fixedFeeServices: FixedFeeService[];
    consultationFee: number;
    freeInitialConsultation: boolean;
  };
  rating: {
    averageRating: number;
    totalReviews: number;
    recentReviews: AdvisorReview[];
  };
  verificationStatus: {
    isVerified: boolean;
    verifiedBy: string;
    verificationDate: Date;
    barAssociation: string;
    licenseNumber: string;
  };
  isActive: boolean;
  joinedAt: Date;
  lastActiveAt: Date;
}

interface LegalSpecialization {
  area: LegalArea;
  subSpecialty?: string;
  certificationLevel: 'BASIC' | 'ADVANCED' | 'EXPERT';
  yearsOfExperience: number;
}

interface LegalCredential {
  type: 'BAR_ADMISSION' | 'CERTIFICATION' | 'DEGREE' | 'AWARD';
  name: string;
  issuingOrganization: string;
  issuedDate: Date;
  expiryDate?: Date;
  credentialId?: string;
}

interface FixedFeeService {
  serviceType: string;
  description: string;
  price: number;
  currency: string;
  estimatedDuration: string;
  includes: string[];
}

interface AdvisorReview {
  id: string;
  clientId: string;
  rating: number;
  title: string;
  review: string;
  transactionType: string;
  transactionValue?: number;
  reviewDate: Date;
  isVerified: boolean;
}

interface AdvisorSearchParams {
  specialization?: LegalArea[];
  location?: {
    city?: string;
    region?: string;
    maxDistance?: number;
  };
  languages?: string[];
  priceRange?: {
    min?: number;
    max?: number;
  };
  experience?: {
    minYears?: number;
    minTransactions?: number;
  };
  availability?: {
    urgentOnly?: boolean;
    maxResponseTime?: string;
  };
  rating?: {
    minRating?: number;
    minReviews?: number;
  };
  transactionValue?: number;
}

interface AdvisorBookingRequest {
  advisorId: string;
  clientId: string;
  serviceType: string;
  transactionDetails: {
    type: 'BUSINESS_SALE' | 'BUSINESS_PURCHASE' | 'MERGER' | 'CONTRACT_REVIEW' | 'LEGAL_CONSULTATION';
    description: string;
    estimatedValue?: number;
    urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    preferredMeetingType: 'IN_PERSON' | 'VIDEO_CALL' | 'PHONE_CALL' | 'EMAIL';
  };
  requestedTimeSlots: TimeSlot[];
  additionalRequirements?: string;
}

interface TimeSlot {
  startTime: Date;
  endTime: Date;
  timezone: string;
}

enum LegalArea {
  MERGERS_ACQUISITIONS = 'MERGERS_ACQUISITIONS',
  CORPORATE_LAW = 'CORPORATE_LAW',
  CONTRACT_LAW = 'CONTRACT_LAW',
  BUSINESS_FORMATION = 'BUSINESS_FORMATION',
  INTELLECTUAL_PROPERTY = 'INTELLECTUAL_PROPERTY',
  EMPLOYMENT_LAW = 'EMPLOYMENT_LAW',
  TAX_LAW = 'TAX_LAW',
  REGULATORY_COMPLIANCE = 'REGULATORY_COMPLIANCE',
  DISPUTE_RESOLUTION = 'DISPUTE_RESOLUTION',
  REAL_ESTATE = 'REAL_ESTATE',
  SECURITIES_LAW = 'SECURITIES_LAW',
  BANKRUPTCY_INSOLVENCY = 'BANKRUPTCY_INSOLVENCY',
}

class LegalAdvisorService {
  // Search for legal advisors based on criteria
  async searchAdvisors(params: AdvisorSearchParams): Promise<{
    advisors: LegalAdvisor[];
    totalCount: number;
    searchMetadata: {
      searchTime: number;
      appliedFilters: string[];
      recommendations: string[];
    };
  }> {
    try {
      const startTime = Date.now();
      
      // Get all advisors (in production, this would be from database)
      let advisors = await this.getAllAdvisors();
      
      const appliedFilters: string[] = [];
      
      // Apply specialization filter
      if (params.specialization && params.specialization.length > 0) {
        advisors = advisors.filter(advisor => 
          advisor.specializations.some(spec => 
            params.specialization!.includes(spec.area)
          )
        );
        appliedFilters.push(`Specialization: ${params.specialization.join(', ')}`);
      }
      
      // Apply location filter
      if (params.location) {
        if (params.location.city) {
          advisors = advisors.filter(advisor => 
            advisor.location.city.toLowerCase().includes(params.location!.city!.toLowerCase())
          );
          appliedFilters.push(`City: ${params.location.city}`);
        }
        
        if (params.location.region) {
          advisors = advisors.filter(advisor => 
            advisor.location.region.toLowerCase().includes(params.location!.region!.toLowerCase())
          );
          appliedFilters.push(`Region: ${params.location.region}`);
        }
      }
      
      // Apply language filter
      if (params.languages && params.languages.length > 0) {
        advisors = advisors.filter(advisor => 
          params.languages!.some(lang => advisor.languages.includes(lang))
        );
        appliedFilters.push(`Languages: ${params.languages.join(', ')}`);
      }
      
      // Apply price range filter
      if (params.priceRange) {
        advisors = advisors.filter(advisor => {
          const avgRate = (advisor.pricing.hourlyRate.min + advisor.pricing.hourlyRate.max) / 2;
          const minMatch = !params.priceRange!.min || avgRate >= params.priceRange!.min;
          const maxMatch = !params.priceRange!.max || avgRate <= params.priceRange!.max;
          return minMatch && maxMatch;
        });
        appliedFilters.push(`Price: ${params.priceRange.min}-${params.priceRange.max} SEK/h`);
      }
      
      // Apply experience filter
      if (params.experience) {
        if (params.experience.minYears) {
          advisors = advisors.filter(advisor => 
            advisor.experience.yearsOfPractice >= params.experience!.minYears!
          );
          appliedFilters.push(`Min experience: ${params.experience.minYears} years`);
        }
        
        if (params.experience.minTransactions) {
          advisors = advisors.filter(advisor => 
            advisor.experience.totalTransactions >= params.experience!.minTransactions!
          );
          appliedFilters.push(`Min transactions: ${params.experience.minTransactions}`);
        }
      }
      
      // Apply rating filter
      if (params.rating) {
        if (params.rating.minRating) {
          advisors = advisors.filter(advisor => 
            advisor.rating.averageRating >= params.rating!.minRating!
          );
          appliedFilters.push(`Min rating: ${params.rating.minRating} stars`);
        }
        
        if (params.rating.minReviews) {
          advisors = advisors.filter(advisor => 
            advisor.rating.totalReviews >= params.rating!.minReviews!
          );
          appliedFilters.push(`Min reviews: ${params.rating.minReviews}`);
        }
      }
      
      // Apply availability filter
      if (params.availability?.urgentOnly) {
        advisors = advisors.filter(advisor => 
          advisor.availability.isAvailable && 
          advisor.availability.typicalResponseTime.includes('hours')
        );
        appliedFilters.push('Urgent availability only');
      }
      
      // Sort by relevance (combination of rating, experience, and specialization match)
      advisors = this.sortByRelevance(advisors, params);
      
      const searchTime = Date.now() - startTime;
      
      return {
        advisors,
        totalCount: advisors.length,
        searchMetadata: {
          searchTime,
          appliedFilters,
          recommendations: this.generateSearchRecommendations(params, advisors.length),
        },
      };
    } catch (error) {
      console.error('Advisor search failed:', error);
      throw new Error('Failed to search advisors');
    }
  }
  
  // Get detailed advisor profile
  async getAdvisorDetails(advisorId: string): Promise<LegalAdvisor | null> {
    try {
      // In production, fetch from database
      const advisors = await this.getAllAdvisors();
      return advisors.find(advisor => advisor.id === advisorId) || null;
    } catch (error) {
      console.error('Failed to get advisor details:', error);
      return null;
    }
  }
  
  // Request consultation booking
  async requestConsultation(request: AdvisorBookingRequest): Promise<{
    bookingId: string;
    status: 'PENDING' | 'CONFIRMED' | 'DECLINED';
    advisor: {
      name: string;
      email: string;
      expectedResponse: string;
    };
    estimatedCost?: {
      consultationFee: number;
      estimatedTotal: number;
      currency: string;
    };
  }> {
    try {
      const advisor = await this.getAdvisorDetails(request.advisorId);
      
      if (!advisor) {
        throw new Error('Advisor not found');
      }
      
      if (!advisor.availability.isAvailable) {
        throw new Error('Advisor is not currently available');
      }
      
      const bookingId = this.generateBookingId();
      
      // Store booking request (in production, save to database)
      await this.storeBookingRequest(bookingId, request);
      
      // Send notification to advisor
      await this.notifyAdvisorOfBooking(advisor, request);
      
      // Calculate estimated cost
      const estimatedCost = this.calculateEstimatedCost(advisor, request);
      
      return {
        bookingId,
        status: 'PENDING',
        advisor: {
          name: advisor.name,
          email: advisor.contact.email,
          expectedResponse: advisor.availability.typicalResponseTime,
        },
        estimatedCost,
      };
    } catch (error) {
      console.error('Consultation booking failed:', error);
      throw new Error(`Failed to request consultation: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  // Get advisor recommendations for specific transaction
  async getAdvisorRecommendations(transactionDetails: {
    type: string;
    value?: number;
    complexity: 'LOW' | 'MEDIUM' | 'HIGH';
    timeline: 'FLEXIBLE' | 'STANDARD' | 'URGENT';
    location: string;
  }): Promise<{
    recommended: LegalAdvisor[];
    reasoning: string[];
    alternatives: LegalAdvisor[];
  }> {
    try {
      const searchParams: AdvisorSearchParams = {
        specialization: this.getRelevantSpecializations(transactionDetails.type),
        location: { city: transactionDetails.location },
        experience: {
          minYears: transactionDetails.complexity === 'HIGH' ? 10 : 5,
          minTransactions: transactionDetails.complexity === 'HIGH' ? 50 : 20,
        },
      };
      
      if (transactionDetails.value) {
        // Adjust price range based on transaction value
        const maxHourlyRate = Math.min(transactionDetails.value * 0.01, 5000); // Max 1% of transaction value or 5000 SEK/h
        searchParams.priceRange = { max: maxHourlyRate };
      }
      
      if (transactionDetails.timeline === 'URGENT') {
        searchParams.availability = { urgentOnly: true };
      }
      
      const searchResult = await this.searchAdvisors(searchParams);
      
      const recommended = searchResult.advisors.slice(0, 3);
      const alternatives = searchResult.advisors.slice(3, 6);
      
      const reasoning = this.generateRecommendationReasoning(transactionDetails, recommended);
      
      return {
        recommended,
        reasoning,
        alternatives,
      };
    } catch (error) {
      console.error('Failed to get advisor recommendations:', error);
      throw new Error('Failed to generate advisor recommendations');
    }
  }
  
  // Submit advisor review
  async submitAdvisorReview(review: {
    advisorId: string;
    clientId: string;
    rating: number;
    title: string;
    review: string;
    transactionType: string;
    transactionValue?: number;
  }): Promise<void> {
    try {
      // Validate rating
      if (review.rating < 1 || review.rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }
      
      // Store review (in production, save to database)
      await this.storeAdvisorReview(review);
      
      // Update advisor's average rating
      await this.updateAdvisorRating(review.advisorId);
      
      // Notify advisor of new review
      await this.notifyAdvisorOfReview(review.advisorId, review);
      
    } catch (error) {
      console.error('Failed to submit advisor review:', error);
      throw new Error('Failed to submit review');
    }
  }
  
  // Private helper methods
  private async getAllAdvisors(): Promise<LegalAdvisor[]> {
    // In production, this would fetch from database
    // For now, return mock data
    return this.getMockAdvisors();
  }
  
  private sortByRelevance(advisors: LegalAdvisor[], params: AdvisorSearchParams): LegalAdvisor[] {
    return advisors.sort((a, b) => {
      let scoreA = 0;
      let scoreB = 0;
      
      // Rating weight (40%)
      scoreA += a.rating.averageRating * 0.4;
      scoreB += b.rating.averageRating * 0.4;
      
      // Experience weight (30%)
      scoreA += Math.min(a.experience.yearsOfPractice / 20, 1) * 0.3;
      scoreB += Math.min(b.experience.yearsOfPractice / 20, 1) * 0.3;
      
      // Specialization match weight (20%)
      if (params.specialization) {
        const matchA = a.specializations.filter(spec => 
          params.specialization!.includes(spec.area)
        ).length / params.specialization.length;
        const matchB = b.specializations.filter(spec => 
          params.specialization!.includes(spec.area)
        ).length / params.specialization.length;
        
        scoreA += matchA * 0.2;
        scoreB += matchB * 0.2;
      }
      
      // Availability weight (10%)
      scoreA += a.availability.isAvailable ? 0.1 : 0;
      scoreB += b.availability.isAvailable ? 0.1 : 0;
      
      return scoreB - scoreA;
    });
  }
  
  private generateSearchRecommendations(params: AdvisorSearchParams, resultCount: number): string[] {
    const recommendations: string[] = [];
    
    if (resultCount === 0) {
      recommendations.push('Inga rådgivare matchade dina kriterier. Prova att utöka sökområdet.');
      recommendations.push('Överväg att kontakta rådgivare med liknande specialiseringar.');
    } else if (resultCount < 3) {
      recommendations.push('Få matchningar hittades. Överväg att justera dina kriterier.');
      if (params.priceRange) {
        recommendations.push('Prova att utöka prisintervallet för fler alternativ.');
      }
    }
    
    if (params.transactionValue && params.transactionValue > 5000000) {
      recommendations.push('För höga transaktionsvärden rekommenderas rådgivare med specialisering inom M&A.');
    }
    
    return recommendations;
  }
  
  private getRelevantSpecializations(transactionType: string): LegalArea[] {
    const specializationMap: Record<string, LegalArea[]> = {
      'BUSINESS_SALE': [LegalArea.MERGERS_ACQUISITIONS, LegalArea.CORPORATE_LAW, LegalArea.TAX_LAW],
      'BUSINESS_PURCHASE': [LegalArea.MERGERS_ACQUISITIONS, LegalArea.CORPORATE_LAW, LegalArea.CONTRACT_LAW],
      'MERGER': [LegalArea.MERGERS_ACQUISITIONS, LegalArea.SECURITIES_LAW, LegalArea.REGULATORY_COMPLIANCE],
      'CONTRACT_REVIEW': [LegalArea.CONTRACT_LAW, LegalArea.CORPORATE_LAW],
      'LEGAL_CONSULTATION': [LegalArea.CORPORATE_LAW, LegalArea.CONTRACT_LAW],
    };
    
    return specializationMap[transactionType] || [LegalArea.CORPORATE_LAW];
  }
  
  private generateRecommendationReasoning(transactionDetails: any, recommended: LegalAdvisor[]): string[] {
    const reasoning: string[] = [];
    
    if (recommended.length > 0) {
      const topAdvisor = recommended[0];
      reasoning.push(`${topAdvisor.name} rekommenderas för sin omfattande erfarenhet inom ${transactionDetails.type.toLowerCase()}`);
      reasoning.push(`Genomsnittlig rating: ${topAdvisor.rating.averageRating}/5 baserat på ${topAdvisor.rating.totalReviews} recensioner`);
      reasoning.push(`${topAdvisor.experience.yearsOfPractice} års erfarenhet och ${topAdvisor.experience.totalTransactions} genomförda transaktioner`);
    }
    
    if (transactionDetails.complexity === 'HIGH') {
      reasoning.push('För komplexa transaktioner rekommenderas rådgivare med minst 10 års erfarenhet');
    }
    
    return reasoning;
  }
  
  private calculateEstimatedCost(advisor: LegalAdvisor, request: AdvisorBookingRequest): {
    consultationFee: number;
    estimatedTotal: number;
    currency: string;
  } {
    const consultationFee = advisor.pricing.consultationFee;
    const avgHourlyRate = (advisor.pricing.hourlyRate.min + advisor.pricing.hourlyRate.max) / 2;
    
    // Estimate total based on transaction type and complexity
    let estimatedHours = 5; // Default
    
    switch (request.transactionDetails.type) {
      case 'BUSINESS_SALE':
      case 'BUSINESS_PURCHASE':
        estimatedHours = request.transactionDetails.estimatedValue && request.transactionDetails.estimatedValue > 1000000 ? 20 : 10;
        break;
      case 'MERGER':
        estimatedHours = 30;
        break;
      case 'CONTRACT_REVIEW':
        estimatedHours = 3;
        break;
      case 'LEGAL_CONSULTATION':
        estimatedHours = 1;
        break;
    }
    
    const estimatedTotal = consultationFee + (avgHourlyRate * estimatedHours);
    
    return {
      consultationFee,
      estimatedTotal,
      currency: advisor.pricing.hourlyRate.currency,
    };
  }
  
  private generateBookingId(): string {
    return `BOOKING-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
  
  private async storeBookingRequest(bookingId: string, request: AdvisorBookingRequest): Promise<void> {
    // Store in database
    console.log('Storing booking request:', bookingId);
  }
  
  private async notifyAdvisorOfBooking(advisor: LegalAdvisor, request: AdvisorBookingRequest): Promise<void> {
    // Send email/notification to advisor
    console.log('Notifying advisor of booking:', advisor.id);
  }
  
  private async storeAdvisorReview(review: any): Promise<void> {
    // Store review in database
    console.log('Storing advisor review:', review);
  }
  
  private async updateAdvisorRating(advisorId: string): Promise<void> {
    // Recalculate and update advisor's average rating
    console.log('Updating advisor rating:', advisorId);
  }
  
  private async notifyAdvisorOfReview(advisorId: string, review: any): Promise<void> {
    // Notify advisor of new review
    console.log('Notifying advisor of review:', advisorId);
  }
  
  // Mock data for development
  private getMockAdvisors(): LegalAdvisor[] {
    return [
      {
        id: 'advisor-1',
        name: 'Anna Lindström',
        firmName: 'Lindström Juridik AB',
        specializations: [
          {
            area: LegalArea.MERGERS_ACQUISITIONS,
            certificationLevel: 'EXPERT',
            yearsOfExperience: 15,
          },
          {
            area: LegalArea.CORPORATE_LAW,
            certificationLevel: 'ADVANCED',
            yearsOfExperience: 12,
          },
        ],
        credentials: [
          {
            type: 'BAR_ADMISSION',
            name: 'Svensk Advokatexamen',
            issuingOrganization: 'Advokatsamfundet',
            issuedDate: new Date('2008-06-15'),
            licenseNumber: 'A-12345',
          },
        ],
        location: {
          city: 'Stockholm',
          region: 'Stockholm',
          country: 'Sweden',
        },
        contact: {
          email: 'anna.lindstrom@lindstromjuridik.se',
          phone: '+46 8 123 456 78',
          website: 'https://lindstromjuridik.se',
        },
        languages: ['Svenska', 'Engelska', 'Tyska'],
        experience: {
          yearsOfPractice: 15,
          totalTransactions: 180,
          averageTransactionValue: 12500000,
          successRate: 96.5,
        },
        availability: {
          isAvailable: true,
          nextAvailableDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          typicalResponseTime: '2-4 timmar',
          workingHours: {
            timezone: 'Europe/Stockholm',
            schedule: {
              monday: { start: '09:00', end: '17:00' },
              tuesday: { start: '09:00', end: '17:00' },
              wednesday: { start: '09:00', end: '17:00' },
              thursday: { start: '09:00', end: '17:00' },
              friday: { start: '09:00', end: '16:00' },
            },
          },
        },
        pricing: {
          hourlyRate: {
            min: 2500,
            max: 4000,
            currency: 'SEK',
          },
          fixedFeeServices: [
            {
              serviceType: 'Due Diligence Review',
              description: 'Grundläggande due diligence-granskning för företagsförvärv',
              price: 45000,
              currency: 'SEK',
              estimatedDuration: '2-3 veckor',
              includes: ['Juridisk granskning', 'Riskanalys', 'Rapport'],
            },
          ],
          consultationFee: 1500,
          freeInitialConsultation: true,
        },
        rating: {
          averageRating: 4.8,
          totalReviews: 42,
          recentReviews: [
            {
              id: 'review-1',
              clientId: 'client-1',
              rating: 5,
              title: 'Utmärkt juridisk rådgivning',
              review: 'Anna hjälpte oss genom hela förvärvsprocessen med stor professionalitet.',
              transactionType: 'Business Acquisition',
              transactionValue: 8500000,
              reviewDate: new Date('2024-01-10'),
              isVerified: true,
            },
          ],
        },
        verificationStatus: {
          isVerified: true,
          verifiedBy: 'Advokatsamfundet',
          verificationDate: new Date('2024-01-01'),
          barAssociation: 'Sveriges Advokatsamfund',
          licenseNumber: 'A-12345',
        },
        isActive: true,
        joinedAt: new Date('2023-06-01'),
        lastActiveAt: new Date(),
      },
      {
        id: 'advisor-2', 
        name: 'Erik Johansson',
        firmName: 'Corporate Legal Partners',
        specializations: [
          {
            area: LegalArea.CONTRACT_LAW,
            certificationLevel: 'EXPERT',
            yearsOfExperience: 12,
          },
          {
            area: LegalArea.DISPUTE_RESOLUTION,
            certificationLevel: 'ADVANCED',
            yearsOfExperience: 8,
          },
        ],
        credentials: [
          {
            type: 'BAR_ADMISSION',
            name: 'Svensk Advokatexamen',
            issuingOrganization: 'Advokatsamfundet',
            issuedDate: new Date('2012-06-15'),
            licenseNumber: 'A-67890',
          },
        ],
        location: {
          city: 'Göteborg',
          region: 'Västra Götaland',
          country: 'Sweden',
        },
        contact: {
          email: 'erik.johansson@clp.se',
          phone: '+46 31 987 654 32',
          website: 'https://clp.se',
        },
        languages: ['Svenska', 'Engelska'],
        experience: {
          yearsOfPractice: 12,
          totalTransactions: 95,
          averageTransactionValue: 3200000,
          successRate: 94.2,
        },
        availability: {
          isAvailable: true,
          nextAvailableDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          typicalResponseTime: '4-8 timmar',
          workingHours: {
            timezone: 'Europe/Stockholm',
            schedule: {
              monday: { start: '08:30', end: '17:30' },
              tuesday: { start: '08:30', end: '17:30' },
              wednesday: { start: '08:30', end: '17:30' },
              thursday: { start: '08:30', end: '17:30' },
              friday: { start: '08:30', end: '16:00' },
            },
          },
        },
        pricing: {
          hourlyRate: {
            min: 1800,
            max: 2800,
            currency: 'SEK',
          },
          fixedFeeServices: [
            {
              serviceType: 'Contract Review',
              description: 'Grundlig granskning av företagsavtal',
              price: 15000,
              currency: 'SEK',
              estimatedDuration: '1 vecka',
              includes: ['Avtalsanalys', 'Riskbedömning', 'Rekommendationer'],
            },
          ],
          consultationFee: 1200,
          freeInitialConsultation: false,
        },
        rating: {
          averageRating: 4.6,
          totalReviews: 28,
          recentReviews: [
            {
              id: 'review-2',
              clientId: 'client-2',
              rating: 5,
              title: 'Snabb och professionell service',
              review: 'Erik löste vårt kontraktstvist mycket effektivt.',
              transactionType: 'Contract Dispute',
              reviewDate: new Date('2024-01-05'),
              isVerified: true,
            },
          ],
        },
        verificationStatus: {
          isVerified: true,
          verifiedBy: 'Advokatsamfundet',
          verificationDate: new Date('2024-01-01'),
          barAssociation: 'Sveriges Advokatsamfund',
          licenseNumber: 'A-67890',
        },
        isActive: true,
        joinedAt: new Date('2023-08-15'),
        lastActiveAt: new Date(),
      },
    ];
  }
}

export { 
  LegalAdvisorService, 
  LegalAdvisor, 
  LegalArea, 
  AdvisorSearchParams,
  AdvisorBookingRequest,
  LegalSpecialization,
  FixedFeeService 
};