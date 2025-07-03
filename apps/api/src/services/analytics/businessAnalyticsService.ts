import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface BusinessMetrics {
  revenue: {
    total: number;
    growth: number;
    forecast: number;
    currency: string;
  };
  transactions: {
    total: number;
    successful: number;
    pending: number;
    failed: number;
    successRate: number;
  };
  users: {
    total: number;
    active: number;
    verified: number;
    growth: number;
  };
  listings: {
    total: number;
    active: number;
    sold: number;
    averageTime: number;
  };
}

interface MarketTrend {
  period: string;
  sector: string;
  averageValuation: number;
  transactionVolume: number;
  growth: number;
  confidence: number;
}

interface BusinessValuation {
  businessId: string;
  estimatedValue: {
    low: number;
    mid: number;
    high: number;
    currency: string;
  };
  valuationMethod: 'REVENUE_MULTIPLE' | 'EBITDA_MULTIPLE' | 'ASSET_BASED' | 'DCF' | 'MARKET_COMP';
  benchmarkData: {
    sectorMultiple: number;
    marketAverage: number;
    similarBusinesses: number;
  };
  confidence: number;
  lastUpdated: Date;
}

interface PerformanceDashboard {
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR';
  metrics: BusinessMetrics;
  trends: MarketTrend[];
  topSectors: {
    sector: string;
    transactionCount: number;
    totalValue: number;
    growth: number;
  }[];
  alerts: {
    type: 'OPPORTUNITY' | 'RISK' | 'INFO';
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    actionRequired: boolean;
  }[];
}

class BusinessAnalyticsService {
  // Get comprehensive business performance dashboard
  async getPerformanceDashboard(period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' = 'MONTH'): Promise<PerformanceDashboard> {
    try {
      const endDate = new Date();
      const startDate = this.calculatePeriodStart(endDate, period);
      
      // Get business metrics
      const metrics = await this.calculateBusinessMetrics(startDate, endDate);
      
      // Get market trends
      const trends = await this.getMarketTrends(period);
      
      // Get top sectors
      const topSectors = await this.getTopSectors(startDate, endDate);
      
      // Generate alerts based on data
      const alerts = await this.generateBusinessAlerts(metrics, trends);
      
      return {
        period,
        metrics,
        trends,
        topSectors,
        alerts,
      };
    } catch (error) {
      console.error('Failed to generate performance dashboard:', error);
      throw new Error('Failed to generate business performance dashboard');
    }
  }

  // Calculate comprehensive business metrics
  async calculateBusinessMetrics(startDate: Date, endDate: Date): Promise<BusinessMetrics> {
    try {
      // In production, these would be actual database queries
      // For now, using calculated mock data based on realistic business scenarios
      
      const currentPeriodDays = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const previousStartDate = new Date(startDate.getTime() - (currentPeriodDays * 24 * 60 * 60 * 1000));
      
      // Revenue calculations
      const totalRevenue = this.calculateRevenueForPeriod(startDate, endDate);
      const previousRevenue = this.calculateRevenueForPeriod(previousStartDate, startDate);
      const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
      
      // Transaction calculations
      const transactions = await this.getTransactionMetrics(startDate, endDate);
      
      // User calculations
      const users = await this.getUserMetrics(startDate, endDate);
      
      // Listing calculations
      const listings = await this.getListingMetrics(startDate, endDate);
      
      return {
        revenue: {
          total: totalRevenue,
          growth: revenueGrowth,
          forecast: this.forecastRevenue(totalRevenue, revenueGrowth),
          currency: 'SEK',
        },
        transactions,
        users,
        listings,
      };
    } catch (error) {
      console.error('Failed to calculate business metrics:', error);
      throw new Error('Failed to calculate business metrics');
    }
  }

  // Get market trends analysis
  async getMarketTrends(period: string): Promise<MarketTrend[]> {
    try {
      // Mock market trend data based on Swedish business market
      const trends: MarketTrend[] = [
        {
          period,
          sector: 'Technology',
          averageValuation: 8500000,
          transactionVolume: 45,
          growth: 15.2,
          confidence: 85,
        },
        {
          period,
          sector: 'Retail',
          averageValuation: 2300000,
          transactionVolume: 128,
          growth: -2.1,
          confidence: 78,
        },
        {
          period,
          sector: 'Manufacturing',
          averageValuation: 12500000,
          transactionVolume: 32,
          growth: 8.7,
          confidence: 92,
        },
        {
          period,
          sector: 'Services',
          averageValuation: 1800000,
          transactionVolume: 89,
          growth: 12.3,
          confidence: 81,
        },
        {
          period,
          sector: 'Healthcare',
          averageValuation: 6200000,
          transactionVolume: 23,
          growth: 22.1,
          confidence: 88,
        },
      ];
      
      return trends;
    } catch (error) {
      console.error('Failed to get market trends:', error);
      throw new Error('Failed to retrieve market trends');
    }
  }

  // Get business valuation estimate
  async getBusinessValuation(businessId: string, businessData: {
    revenue: number;
    ebitda: number;
    assets: number;
    sector: string;
    employees: number;
    location: string;
  }): Promise<BusinessValuation> {
    try {
      // Get sector benchmarks
      const sectorBenchmarks = await this.getSectorBenchmarks(businessData.sector);
      
      // Calculate valuations using different methods
      const revenueMultiple = businessData.revenue * sectorBenchmarks.revenueMultiple;
      const ebitdaMultiple = businessData.ebitda * sectorBenchmarks.ebitdaMultiple;
      const assetBased = businessData.assets * 0.8; // 80% of asset value
      
      // Weight the valuations based on business characteristics
      const weights = this.calculateValuationWeights(businessData);
      
      const weightedValuation = 
        (revenueMultiple * weights.revenue) +
        (ebitdaMultiple * weights.ebitda) +
        (assetBased * weights.assets);
      
      // Apply confidence factors
      const confidence = this.calculateValuationConfidence(businessData, sectorBenchmarks);
      const variance = 0.25; // 25% variance
      
      return {
        businessId,
        estimatedValue: {
          low: Math.round(weightedValuation * (1 - variance)),
          mid: Math.round(weightedValuation),
          high: Math.round(weightedValuation * (1 + variance)),
          currency: 'SEK',
        },
        valuationMethod: 'MARKET_COMP',
        benchmarkData: {
          sectorMultiple: sectorBenchmarks.revenueMultiple,
          marketAverage: sectorBenchmarks.marketAverage,
          similarBusinesses: sectorBenchmarks.sampleSize,
        },
        confidence,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Failed to calculate business valuation:', error);
      throw new Error('Failed to calculate business valuation');
    }
  }

  // Get transaction success analytics
  async getTransactionSuccessMetrics(timeframe: 'MONTH' | 'QUARTER' | 'YEAR' = 'QUARTER'): Promise<{
    successRate: number;
    averageTimeToClose: number; // days
    dropOffPoints: {
      stage: string;
      dropOffRate: number;
      suggestions: string[];
    }[];
    successFactors: {
      factor: string;
      impact: number; // correlation to success
      description: string;
    }[];
  }> {
    try {
      // Mock transaction success data
      return {
        successRate: 78.5, // 78.5% of initiated transactions complete
        averageTimeToClose: 42, // 42 days average
        dropOffPoints: [
          {
            stage: 'Initial Contact',
            dropOffRate: 15.2,
            suggestions: [
              'Förbättra första intryck med bättre företagspresentationer',
              'Implementera automatiska påminnelser för svar',
            ],
          },
          {
            stage: 'Due Diligence',
            dropOffRate: 23.8,
            suggestions: [
              'Förenkla dokumentationsprocessen',
              'Erbjud professionell due diligence-support',
            ],
          },
          {
            stage: 'Valuation Negotiation',
            dropOffRate: 18.7,
            suggestions: [
              'Tillhandahåll objektiva värderingsverktyg',
              'Erbjud mediation för värderingsmeningsskiljaktigheter',
            ],
          },
          {
            stage: 'Legal Review',
            dropOffRate: 9.3,
            suggestions: [
              'Förbättra tillgång till juridisk expertis',
              'Standardisera avtalsmallar för snabbare process',
            ],
          },
        ],
        successFactors: [
          {
            factor: 'Professional Valuation',
            impact: 0.68,
            description: 'Företag med professionell värdering har 68% högre framgång',
          },
          {
            factor: 'Complete Financial Records',
            impact: 0.54,
            description: 'Kompletta finansiella dokument ökar framgång med 54%',
          },
          {
            factor: 'Verified Seller',
            impact: 0.41,
            description: 'Verifierade säljare har 41% högre genomförandegrad',
          },
          {
            factor: 'Industry Experience',
            impact: 0.37,
            description: 'Köpare med branschexpertis ökar framgång med 37%',
          },
        ],
      };
    } catch (error) {
      console.error('Failed to get transaction success metrics:', error);
      throw new Error('Failed to retrieve transaction success metrics');
    }
  }

  // Get user behavior analytics
  async getUserBehaviorAnalytics(): Promise<{
    userSegments: {
      segment: string;
      count: number;
      characteristics: string[];
      conversionRate: number;
    }[];
    engagementMetrics: {
      averageSessionTime: number; // minutes
      pageViews: number;
      bounceRate: number;
      returnVisitRate: number;
    };
    popularFeatures: {
      feature: string;
      usage: number;
      satisfaction: number;
    }[];
    geographicDistribution: {
      region: string;
      userCount: number;
      transactionValue: number;
    }[];
  }> {
    try {
      return {
        userSegments: [
          {
            segment: 'Active Buyers',
            count: 485,
            characteristics: [
              'Söker företag inom 6 månader',
              'Genomsnittlig budget: 2.5M SEK',
              'Fokus på tillväxtföretag',
            ],
            conversionRate: 12.3,
          },
          {
            segment: 'Potential Sellers',
            count: 256,
            characteristics: [
              'Företagare 50+ år',
              'Planerar försäljning inom 2 år',
              'Söker värderingshjälp',
            ],
            conversionRate: 8.7,
          },
          {
            segment: 'Service Seekers',
            count: 1089,
            characteristics: [
              'Letar efter professionella tjänster',
              'Främst juridisk rådgivning',
              'Mindre transaktioner',
            ],
            conversionRate: 24.6,
          },
        ],
        engagementMetrics: {
          averageSessionTime: 18.5,
          pageViews: 7.2,
          bounceRate: 34.8,
          returnVisitRate: 68.4,
        },
        popularFeatures: [
          {
            feature: 'Business Search',
            usage: 89.2,
            satisfaction: 8.1,
          },
          {
            feature: 'Valuation Tools',
            usage: 67.8,
            satisfaction: 7.8,
          },
          {
            feature: 'Legal Resources',
            usage: 54.3,
            satisfaction: 8.4,
          },
          {
            feature: 'Market Insights',
            usage: 41.7,
            satisfaction: 7.9,
          },
        ],
        geographicDistribution: [
          {
            region: 'Stockholm',
            userCount: 1547,
            transactionValue: 89500000,
          },
          {
            region: 'Göteborg',
            userCount: 692,
            transactionValue: 34200000,
          },
          {
            region: 'Malmö',
            userCount: 441,
            transactionValue: 18700000,
          },
          {
            region: 'Uppsala',
            userCount: 298,
            transactionValue: 12300000,
          },
        ],
      };
    } catch (error) {
      console.error('Failed to get user behavior analytics:', error);
      throw new Error('Failed to retrieve user behavior analytics');
    }
  }

  // Private helper methods
  private calculatePeriodStart(endDate: Date, period: string): Date {
    const start = new Date(endDate);
    
    switch (period) {
      case 'WEEK':
        start.setDate(start.getDate() - 7);
        break;
      case 'MONTH':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'QUARTER':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'YEAR':
        start.setFullYear(start.getFullYear() - 1);
        break;
    }
    
    return start;
  }

  private calculateRevenueForPeriod(startDate: Date, endDate: Date): number {
    // Mock revenue calculation based on transaction fees
    const daysDiff = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
    const baseDaily = 15000; // 15k SEK average daily revenue
    const variability = Math.random() * 0.4 + 0.8; // 80-120% variability
    
    return Math.round(daysDiff * baseDaily * variability);
  }

  private forecastRevenue(currentRevenue: number, growthRate: number): number {
    // Simple growth projection for next period
    return Math.round(currentRevenue * (1 + (growthRate / 100)));
  }

  private async getTransactionMetrics(startDate: Date, endDate: Date): Promise<BusinessMetrics['transactions']> {
    // Mock transaction data
    const total = 156;
    const successful = 122;
    const pending = 18;
    const failed = 16;
    
    return {
      total,
      successful,
      pending,
      failed,
      successRate: (successful / total) * 100,
    };
  }

  private async getUserMetrics(startDate: Date, endDate: Date): Promise<BusinessMetrics['users']> {
    // Mock user data
    return {
      total: 3890,
      active: 2150,
      verified: 1834,
      growth: 12.4,
    };
  }

  private async getListingMetrics(startDate: Date, endDate: Date): Promise<BusinessMetrics['listings']> {
    // Mock listing data
    return {
      total: 245,
      active: 189,
      sold: 48,
      averageTime: 67, // days
    };
  }

  private async getTopSectors(startDate: Date, endDate: Date): Promise<any[]> {
    // Mock sector data
    return [
      {
        sector: 'Technology',
        transactionCount: 45,
        totalValue: 382500000,
        growth: 15.2,
      },
      {
        sector: 'Retail',
        transactionCount: 128,
        totalValue: 294400000,
        growth: -2.1,
      },
      {
        sector: 'Manufacturing',
        transactionCount: 32,
        totalValue: 400000000,
        growth: 8.7,
      },
    ];
  }

  private async generateBusinessAlerts(metrics: BusinessMetrics, trends: MarketTrend[]): Promise<any[]> {
    const alerts = [];
    
    // Revenue growth alert
    if (metrics.revenue.growth < 0) {
      alerts.push({
        type: 'RISK',
        message: `Omsättningen har minskat med ${Math.abs(metrics.revenue.growth).toFixed(1)}% jämfört med föregående period`,
        severity: 'HIGH',
        actionRequired: true,
      });
    } else if (metrics.revenue.growth > 20) {
      alerts.push({
        type: 'OPPORTUNITY',
        message: `Stark tillväxt på ${metrics.revenue.growth.toFixed(1)}% - överväg att utöka marknadsföringen`,
        severity: 'MEDIUM',
        actionRequired: false,
      });
    }
    
    // Transaction success rate alert
    if (metrics.transactions.successRate < 70) {
      alerts.push({
        type: 'RISK',
        message: `Låg genomförandegrad (${metrics.transactions.successRate.toFixed(1)}%) - granska transaktionsprocessen`,
        severity: 'HIGH',
        actionRequired: true,
      });
    }
    
    // Market trend opportunities
    const growingTrends = trends.filter(t => t.growth > 10);
    if (growingTrends.length > 0) {
      alerts.push({
        type: 'OPPORTUNITY',
        message: `Stark tillväxt inom ${growingTrends[0].sector} (+${growingTrends[0].growth.toFixed(1)}%)`,
        severity: 'LOW',
        actionRequired: false,
      });
    }
    
    return alerts;
  }

  private async getSectorBenchmarks(sector: string): Promise<{
    revenueMultiple: number;
    ebitdaMultiple: number;
    marketAverage: number;
    sampleSize: number;
  }> {
    // Industry-specific valuation multiples for Swedish market
    const benchmarks: Record<string, any> = {
      'Technology': {
        revenueMultiple: 4.2,
        ebitdaMultiple: 12.8,
        marketAverage: 8500000,
        sampleSize: 145,
      },
      'Retail': {
        revenueMultiple: 1.1,
        ebitdaMultiple: 6.5,
        marketAverage: 2300000,
        sampleSize: 289,
      },
      'Manufacturing': {
        revenueMultiple: 1.8,
        ebitdaMultiple: 8.2,
        marketAverage: 12500000,
        sampleSize: 198,
      },
      'Services': {
        revenueMultiple: 2.4,
        ebitdaMultiple: 7.1,
        marketAverage: 1800000,
        sampleSize: 321,
      },
      'Healthcare': {
        revenueMultiple: 3.6,
        ebitdaMultiple: 11.4,
        marketAverage: 6200000,
        sampleSize: 87,
      },
    };
    
    return benchmarks[sector] || benchmarks['Services'];
  }

  private calculateValuationWeights(businessData: any): {
    revenue: number;
    ebitda: number;
    assets: number;
  } {
    // Weight based on business characteristics
    if (businessData.ebitda > 0 && businessData.ebitda / businessData.revenue > 0.15) {
      // Profitable business - weight EBITDA more
      return { revenue: 0.3, ebitda: 0.6, assets: 0.1 };
    } else if (businessData.revenue > 10000000) {
      // Large revenue business - weight revenue more
      return { revenue: 0.7, ebitda: 0.2, assets: 0.1 };
    } else {
      // Asset-heavy or smaller business
      return { revenue: 0.4, ebitda: 0.3, assets: 0.3 };
    }
  }

  private calculateValuationConfidence(businessData: any, benchmarks: any): number {
    let confidence = 70; // Base confidence
    
    // Increase confidence based on data quality
    if (businessData.revenue > 0) confidence += 10;
    if (businessData.ebitda > 0) confidence += 5;
    if (benchmarks.sampleSize > 100) confidence += 10;
    if (businessData.employees > 10) confidence += 5;
    
    return Math.min(confidence, 95);
  }
}

export { 
  BusinessAnalyticsService, 
  BusinessMetrics, 
  MarketTrend, 
  BusinessValuation, 
  PerformanceDashboard 
};