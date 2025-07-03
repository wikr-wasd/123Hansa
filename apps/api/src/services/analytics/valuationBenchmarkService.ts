import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BusinessProfile {
  id: string;
  sector: string;
  location: string;
  revenue: number;
  ebitda: number;
  employees: number;
  assets: number;
  yearEstablished: number;
  businessModel: 'B2B' | 'B2C' | 'B2B2C' | 'MARKETPLACE';
  growthRate: number;
  customAttributes?: Record<string, any>;
}

interface ValuationBenchmark {
  sector: string;
  revenueMultiple: {
    min: number;
    max: number;
    median: number;
    percentile25: number;
    percentile75: number;
  };
  ebitdaMultiple: {
    min: number;
    max: number;
    median: number;
    percentile25: number;
    percentile75: number;
  };
  priceToBook: {
    min: number;
    max: number;
    median: number;
  };
  sampleSize: number;
  geography: 'SWEDEN' | 'NORDIC' | 'EUROPE';
  lastUpdated: Date;
}

interface ComparableCompany {
  id: string;
  name: string;
  sector: string;
  revenue: number;
  ebitda: number;
  valuation: number;
  employees: number;
  location: string;
  similarity: number; // 0-100
  matchFactors: string[];
}

interface ValuationResult {
  businessId: string;
  methodsUsed: ValuationMethod[];
  finalValuation: {
    low: number;
    mid: number;
    high: number;
    currency: string;
  };
  confidence: number;
  benchmarkData: {
    sectorBenchmarks: ValuationBenchmark;
    comparableCompanies: ComparableCompany[];
    marketPosition: 'PREMIUM' | 'MARKET' | 'DISCOUNT';
  };
  valuationFactors: {
    factor: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    weight: number;
    description: string;
  }[];
  recommendations: string[];
  generatedAt: Date;
}

interface ValuationMethod {
  method: 'REVENUE_MULTIPLE' | 'EBITDA_MULTIPLE' | 'DCF' | 'ASSET_BASED' | 'MARKET_COMP';
  valuation: number;
  confidence: number;
  weight: number;
  inputs: Record<string, any>;
}

class ValuationBenchmarkService {
  // Get comprehensive valuation for a business
  async getBusinessValuation(businessProfile: BusinessProfile): Promise<ValuationResult> {
    try {
      // Get sector benchmarks
      const sectorBenchmarks = await this.getSectorBenchmarks(businessProfile.sector);
      
      // Find comparable companies
      const comparableCompanies = await this.findComparableCompanies(businessProfile);
      
      // Apply different valuation methods
      const valuationMethods = await this.applyValuationMethods(businessProfile, sectorBenchmarks);
      
      // Calculate weighted average valuation
      const finalValuation = this.calculateWeightedValuation(valuationMethods);
      
      // Analyze valuation factors
      const valuationFactors = this.analyzeValuationFactors(businessProfile, sectorBenchmarks);
      
      // Determine market position
      const marketPosition = this.determineMarketPosition(finalValuation.mid, sectorBenchmarks);
      
      // Generate recommendations
      const recommendations = this.generateValuationRecommendations(
        businessProfile, 
        valuationFactors, 
        marketPosition
      );
      
      // Calculate overall confidence
      const confidence = this.calculateValuationConfidence(
        valuationMethods, 
        comparableCompanies, 
        sectorBenchmarks
      );
      
      return {
        businessId: businessProfile.id,
        methodsUsed: valuationMethods,
        finalValuation,
        confidence,
        benchmarkData: {
          sectorBenchmarks,
          comparableCompanies,
          marketPosition,
        },
        valuationFactors,
        recommendations,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Failed to generate business valuation:', error);
      throw new Error('Failed to generate business valuation');
    }
  }

  // Get sector-specific benchmarks
  async getSectorBenchmarks(sector: string): Promise<ValuationBenchmark> {
    try {
      // In production, this would query actual market data
      // Mock data based on Swedish market research
      const benchmarks: Record<string, Partial<ValuationBenchmark>> = {
        'Technology': {
          revenueMultiple: { min: 1.5, max: 8.0, median: 4.2, percentile25: 2.8, percentile75: 6.1 },
          ebitdaMultiple: { min: 8.0, max: 25.0, median: 12.8, percentile25: 10.2, percentile75: 18.5 },
          priceToBook: { min: 1.2, max: 4.5, median: 2.8 },
          sampleSize: 145,
        },
        'Manufacturing': {
          revenueMultiple: { min: 0.8, max: 3.2, median: 1.8, percentile25: 1.3, percentile75: 2.4 },
          ebitdaMultiple: { min: 5.5, max: 15.0, median: 8.2, percentile25: 6.8, percentile75: 11.1 },
          priceToBook: { min: 0.9, max: 2.1, median: 1.4 },
          sampleSize: 198,
        },
        'Retail': {
          revenueMultiple: { min: 0.4, max: 2.5, median: 1.1, percentile25: 0.7, percentile75: 1.6 },
          ebitdaMultiple: { min: 4.0, max: 12.0, median: 6.5, percentile25: 5.2, percentile75: 8.9 },
          priceToBook: { min: 0.8, max: 1.8, median: 1.2 },
          sampleSize: 289,
        },
        'Services': {
          revenueMultiple: { min: 1.0, max: 4.5, median: 2.4, percentile25: 1.7, percentile75: 3.2 },
          ebitdaMultiple: { min: 5.0, max: 14.0, median: 7.1, percentile25: 6.0, percentile75: 9.8 },
          priceToBook: { min: 1.0, max: 2.5, median: 1.6 },
          sampleSize: 321,
        },
        'Healthcare': {
          revenueMultiple: { min: 2.0, max: 6.5, median: 3.6, percentile25: 2.8, percentile75: 4.9 },
          ebitdaMultiple: { min: 8.0, max: 18.0, median: 11.4, percentile25: 9.5, percentile75: 14.2 },
          priceToBook: { min: 1.5, max: 3.2, median: 2.1 },
          sampleSize: 87,
        },
      };

      const benchmark = benchmarks[sector] || benchmarks['Services'];
      
      return {
        sector,
        ...benchmark,
        geography: 'SWEDEN',
        lastUpdated: new Date(),
      } as ValuationBenchmark;
    } catch (error) {
      console.error('Failed to get sector benchmarks:', error);
      throw new Error('Failed to retrieve sector benchmarks');
    }
  }

  // Find comparable companies
  async findComparableCompanies(businessProfile: BusinessProfile): Promise<ComparableCompany[]> {
    try {
      // In production, this would query a database of businesses
      // Mock comparable companies with realistic data
      const mockComparables: ComparableCompany[] = [
        {
          id: 'comp-1',
          name: `${businessProfile.sector} Nordic AB`,
          sector: businessProfile.sector,
          revenue: businessProfile.revenue * 1.2,
          ebitda: businessProfile.ebitda * 1.1,
          valuation: businessProfile.revenue * 3.2,
          employees: businessProfile.employees + 5,
          location: 'Stockholm',
          similarity: 87,
          matchFactors: ['Same sector', 'Similar size', 'Geographic proximity'],
        },
        {
          id: 'comp-2',
          name: `Swedish ${businessProfile.sector} Solutions`,
          sector: businessProfile.sector,
          revenue: businessProfile.revenue * 0.85,
          ebitda: businessProfile.ebitda * 0.9,
          valuation: businessProfile.revenue * 2.8,
          employees: businessProfile.employees - 3,
          location: 'Göteborg',
          similarity: 82,
          matchFactors: ['Same sector', 'Similar revenue', 'Similar business model'],
        },
        {
          id: 'comp-3',
          name: `Nordic ${businessProfile.sector} Group`,
          sector: businessProfile.sector,
          revenue: businessProfile.revenue * 1.5,
          ebitda: businessProfile.ebitda * 1.3,
          valuation: businessProfile.revenue * 4.1,
          employees: businessProfile.employees + 12,
          location: 'Oslo',
          similarity: 75,
          matchFactors: ['Same sector', 'Nordic market', 'Growth trajectory'],
        },
      ];

      // Calculate similarity scores based on multiple factors
      return mockComparables.map(comp => ({
        ...comp,
        similarity: this.calculateSimilarity(businessProfile, comp),
      })).sort((a, b) => b.similarity - a.similarity);
    } catch (error) {
      console.error('Failed to find comparable companies:', error);
      throw new Error('Failed to find comparable companies');
    }
  }

  // Apply different valuation methods
  async applyValuationMethods(
    businessProfile: BusinessProfile, 
    benchmarks: ValuationBenchmark
  ): Promise<ValuationMethod[]> {
    try {
      const methods: ValuationMethod[] = [];

      // Revenue Multiple Method
      if (businessProfile.revenue > 0) {
        methods.push({
          method: 'REVENUE_MULTIPLE',
          valuation: businessProfile.revenue * benchmarks.revenueMultiple.median,
          confidence: 75,
          weight: businessProfile.ebitda > 0 ? 0.3 : 0.5,
          inputs: {
            revenue: businessProfile.revenue,
            multiple: benchmarks.revenueMultiple.median,
          },
        });
      }

      // EBITDA Multiple Method
      if (businessProfile.ebitda > 0) {
        methods.push({
          method: 'EBITDA_MULTIPLE',
          valuation: businessProfile.ebitda * benchmarks.ebitdaMultiple.median,
          confidence: 85,
          weight: 0.4,
          inputs: {
            ebitda: businessProfile.ebitda,
            multiple: benchmarks.ebitdaMultiple.median,
          },
        });
      }

      // Asset-Based Method
      if (businessProfile.assets > 0) {
        const assetMultiplier = businessProfile.sector === 'Manufacturing' ? 0.8 : 0.6;
        methods.push({
          method: 'ASSET_BASED',
          valuation: businessProfile.assets * assetMultiplier,
          confidence: 65,
          weight: businessProfile.sector === 'Manufacturing' ? 0.3 : 0.15,
          inputs: {
            assets: businessProfile.assets,
            multiplier: assetMultiplier,
          },
        });
      }

      // DCF Method (simplified)
      if (businessProfile.ebitda > 0) {
        const dcfValuation = this.calculateDCF(businessProfile);
        methods.push({
          method: 'DCF',
          valuation: dcfValuation,
          confidence: 70,
          weight: 0.25,
          inputs: {
            ebitda: businessProfile.ebitda,
            growthRate: businessProfile.growthRate,
            discountRate: 0.12, // 12% WACC assumption
          },
        });
      }

      // Normalize weights to sum to 1
      const totalWeight = methods.reduce((sum, method) => sum + method.weight, 0);
      methods.forEach(method => {
        method.weight = method.weight / totalWeight;
      });

      return methods;
    } catch (error) {
      console.error('Failed to apply valuation methods:', error);
      throw new Error('Failed to apply valuation methods');
    }
  }

  // Calculate weighted average valuation
  private calculateWeightedValuation(methods: ValuationMethod[]): {
    low: number;
    mid: number;
    high: number;
    currency: string;
  } {
    const weightedValuation = methods.reduce((sum, method) => {
      return sum + (method.valuation * method.weight);
    }, 0);

    const variance = 0.25; // 25% variance for range

    return {
      low: Math.round(weightedValuation * (1 - variance)),
      mid: Math.round(weightedValuation),
      high: Math.round(weightedValuation * (1 + variance)),
      currency: 'SEK',
    };
  }

  // Analyze factors affecting valuation
  private analyzeValuationFactors(
    businessProfile: BusinessProfile, 
    benchmarks: ValuationBenchmark
  ): ValuationResult['valuationFactors'] {
    const factors = [];

    // Growth rate factor
    if (businessProfile.growthRate > 15) {
      factors.push({
        factor: 'High Growth Rate',
        impact: 'POSITIVE' as const,
        weight: 0.2,
        description: `Tillväxttakt på ${businessProfile.growthRate}% över marknadssnittet`,
      });
    } else if (businessProfile.growthRate < 0) {
      factors.push({
        factor: 'Negative Growth',
        impact: 'NEGATIVE' as const,
        weight: 0.25,
        description: `Negativ tillväxt på ${businessProfile.growthRate}% påverkar värderingen`,
      });
    }

    // Profitability factor
    const profitMargin = businessProfile.revenue > 0 ? (businessProfile.ebitda / businessProfile.revenue) : 0;
    if (profitMargin > 0.2) {
      factors.push({
        factor: 'High Profitability',
        impact: 'POSITIVE' as const,
        weight: 0.18,
        description: `EBITDA-marginal på ${(profitMargin * 100).toFixed(1)}% är över branschsnittet`,
      });
    } else if (profitMargin < 0.05) {
      factors.push({
        factor: 'Low Profitability',
        impact: 'NEGATIVE' as const,
        weight: 0.2,
        description: `Låg EBITDA-marginal på ${(profitMargin * 100).toFixed(1)}% under branschsnittet`,
      });
    }

    // Company age factor
    const currentYear = new Date().getFullYear();
    const companyAge = currentYear - businessProfile.yearEstablished;
    if (companyAge > 20) {
      factors.push({
        factor: 'Established Business',
        impact: 'POSITIVE' as const,
        weight: 0.1,
        description: `${companyAge} års verksamhet ger stabilitet och trovärdighet`,
      });
    } else if (companyAge < 3) {
      factors.push({
        factor: 'Young Company',
        impact: 'NEGATIVE' as const,
        weight: 0.15,
        description: `Endast ${companyAge} års verksamhet ökar risken`,
      });
    }

    // Size factor
    if (businessProfile.employees > 50) {
      factors.push({
        factor: 'Established Team',
        impact: 'POSITIVE' as const,
        weight: 0.08,
        description: `${businessProfile.employees} anställda indikerar skalbarhet`,
      });
    } else if (businessProfile.employees < 5) {
      factors.push({
        factor: 'Small Team',
        impact: 'NEGATIVE' as const,
        weight: 0.12,
        description: `Litet team (${businessProfile.employees}) kan begränsa tillväxten`,
      });
    }

    // Location factor
    if (['Stockholm', 'Göteborg', 'Malmö'].includes(businessProfile.location)) {
      factors.push({
        factor: 'Prime Location',
        impact: 'POSITIVE' as const,
        weight: 0.05,
        description: `Lokalisering i ${businessProfile.location} ger marknadsfördelar`,
      });
    }

    return factors;
  }

  // Calculate similarity between businesses
  private calculateSimilarity(business: BusinessProfile, comparable: ComparableCompany): number {
    let similarity = 0;

    // Sector match (40% weight)
    if (business.sector === comparable.sector) {
      similarity += 40;
    }

    // Revenue similarity (25% weight)
    const revenueDiff = Math.abs(business.revenue - comparable.revenue) / Math.max(business.revenue, comparable.revenue);
    similarity += 25 * (1 - Math.min(revenueDiff, 1));

    // Employee count similarity (15% weight)
    const employeeDiff = Math.abs(business.employees - comparable.employees) / Math.max(business.employees, comparable.employees);
    similarity += 15 * (1 - Math.min(employeeDiff, 1));

    // Geographic proximity (10% weight)
    const swedishCities = ['Stockholm', 'Göteborg', 'Malmö', 'Uppsala', 'Västerås'];
    const nordicCities = ['Oslo', 'Copenhagen', 'Helsinki'];
    
    if (swedishCities.includes(business.location) && swedishCities.includes(comparable.location)) {
      similarity += 10;
    } else if (swedishCities.includes(business.location) && nordicCities.includes(comparable.location)) {
      similarity += 7;
    }

    // EBITDA similarity (10% weight)
    if (business.ebitda > 0 && comparable.ebitda > 0) {
      const ebitdaDiff = Math.abs(business.ebitda - comparable.ebitda) / Math.max(business.ebitda, comparable.ebitda);
      similarity += 10 * (1 - Math.min(ebitdaDiff, 1));
    }

    return Math.round(Math.min(similarity, 100));
  }

  // Simplified DCF calculation
  private calculateDCF(businessProfile: BusinessProfile): number {
    const years = 5;
    const terminalGrowthRate = 0.02; // 2%
    const discountRate = 0.12; // 12%
    
    let dcfValue = 0;
    let currentEBITDA = businessProfile.ebitda;
    
    // Project cash flows for 5 years
    for (let year = 1; year <= years; year++) {
      currentEBITDA *= (1 + businessProfile.growthRate / 100);
      const discountedCashFlow = currentEBITDA / Math.pow(1 + discountRate, year);
      dcfValue += discountedCashFlow;
    }
    
    // Terminal value
    const terminalEBITDA = currentEBITDA * (1 + terminalGrowthRate);
    const terminalValue = terminalEBITDA / (discountRate - terminalGrowthRate);
    const discountedTerminalValue = terminalValue / Math.pow(1 + discountRate, years);
    
    dcfValue += discountedTerminalValue;
    
    return Math.round(dcfValue);
  }

  // Determine market position
  private determineMarketPosition(
    valuation: number, 
    benchmarks: ValuationBenchmark
  ): 'PREMIUM' | 'MARKET' | 'DISCOUNT' {
    // Calculate implied multiples and compare to benchmarks
    // Simplified logic for demo
    if (valuation > benchmarks.revenueMultiple.percentile75 * 1000000) {
      return 'PREMIUM';
    } else if (valuation < benchmarks.revenueMultiple.percentile25 * 1000000) {
      return 'DISCOUNT';
    } else {
      return 'MARKET';
    }
  }

  // Generate valuation recommendations
  private generateValuationRecommendations(
    businessProfile: BusinessProfile,
    valuationFactors: any[],
    marketPosition: string
  ): string[] {
    const recommendations = [];

    // Growth-based recommendations
    if (businessProfile.growthRate < 5) {
      recommendations.push('Utveckla tillväxtstrategi för att förbättra värderingen');
    }

    // Profitability recommendations
    const profitMargin = businessProfile.revenue > 0 ? (businessProfile.ebitda / businessProfile.revenue) : 0;
    if (profitMargin < 0.1) {
      recommendations.push('Fokusera på lönsamhetsförbättringar genom kostnadsoptimering');
    }

    // Market position recommendations
    if (marketPosition === 'DISCOUNT') {
      recommendations.push('Undersök strategiska initiativ för att nå marknadsvärdering');
    } else if (marketPosition === 'PREMIUM') {
      recommendations.push('Bibehåll premiumposition genom fortsatt innovation och kvalitet');
    }

    // Factor-based recommendations
    const negativeFactors = valuationFactors.filter(f => f.impact === 'NEGATIVE');
    if (negativeFactors.length > 0) {
      recommendations.push(`Adressera ${negativeFactors[0].factor.toLowerCase()} för förbättrad värdering`);
    }

    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Bibehåll stark operationell prestanda och marknadspositioning');
    }

    return recommendations;
  }

  // Calculate overall valuation confidence
  private calculateValuationConfidence(
    methods: ValuationMethod[],
    comparables: ComparableCompany[],
    benchmarks: ValuationBenchmark
  ): number {
    let confidence = 70; // Base confidence

    // Method diversity increases confidence
    confidence += Math.min(methods.length * 5, 15);

    // Number of comparables
    confidence += Math.min(comparables.length * 3, 10);

    // Sample size in benchmarks
    confidence += Math.min(benchmarks.sampleSize / 20, 10);

    // Average method confidence
    const avgMethodConfidence = methods.reduce((sum, m) => sum + m.confidence, 0) / methods.length;
    confidence += (avgMethodConfidence - 70) * 0.3;

    return Math.min(Math.max(confidence, 50), 95);
  }
}

export { 
  ValuationBenchmarkService, 
  BusinessProfile, 
  ValuationBenchmark, 
  ComparableCompany, 
  ValuationResult, 
  ValuationMethod 
};