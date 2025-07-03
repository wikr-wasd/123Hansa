import { Request, Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth';
import { BusinessAnalyticsService } from '../../services/analytics/businessAnalyticsService';
import { MarketIntelligenceService } from '../../services/analytics/marketIntelligenceService';
import { ValuationBenchmarkService } from '../../services/analytics/valuationBenchmarkService';

const businessAnalyticsService = new BusinessAnalyticsService();
const marketIntelligenceService = new MarketIntelligenceService();
const valuationBenchmarkService = new ValuationBenchmarkService();

// Business Performance Dashboard
export const getPerformanceDashboard = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    const { period = 'MONTH' } = req.query;

    if (!['WEEK', 'MONTH', 'QUARTER', 'YEAR'].includes(period as string)) {
      return res.status(400).json({
        error: 'Invalid period. Must be WEEK, MONTH, QUARTER, or YEAR'
      });
    }

    const dashboard = await businessAnalyticsService.getPerformanceDashboard(
      period as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'
    );

    res.json({
      success: true,
      data: dashboard,
      meta: {
        generatedAt: new Date(),
        period,
        dataLatency: '5 minutes',
      },
    });
  } catch (error) {
    console.error('Performance dashboard failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate performance dashboard'
    });
  }
};

// Market Intelligence Report
export const getMarketIntelligence = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission for detailed market intelligence
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required for market intelligence reports'
      });
    }

    const { 
      geography = 'SWEDEN', 
      timeframe = 'QUARTER' 
    } = req.query;

    if (!['SWEDEN', 'NORDIC', 'EUROPE'].includes(geography as string)) {
      return res.status(400).json({
        error: 'Invalid geography. Must be SWEDEN, NORDIC, or EUROPE'
      });
    }

    if (!['MONTH', 'QUARTER', 'YEAR'].includes(timeframe as string)) {
      return res.status(400).json({
        error: 'Invalid timeframe. Must be MONTH, QUARTER, or YEAR'
      });
    }

    const report = await marketIntelligenceService.generateMarketIntelligenceReport(
      geography as 'SWEDEN' | 'NORDIC' | 'EUROPE',
      timeframe as 'MONTH' | 'QUARTER' | 'YEAR'
    );

    res.json({
      success: true,
      data: report,
      meta: {
        reportType: 'Market Intelligence',
        geography,
        timeframe,
        confidentiality: 'Internal Use Only',
      },
    });
  } catch (error) {
    console.error('Market intelligence report failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to generate market intelligence report'
    });
  }
};

// Business Valuation
export const getBusinessValuation = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const {
      revenue,
      ebitda,
      assets,
      employees,
      sector,
      location,
      yearEstablished,
      businessModel = 'B2B',
      growthRate = 0,
    } = req.body;

    // Validate required fields
    if (!revenue || revenue <= 0) {
      return res.status(400).json({
        error: 'Valid revenue amount is required'
      });
    }

    if (!sector) {
      return res.status(400).json({
        error: 'Business sector is required'
      });
    }

    if (!location) {
      return res.status(400).json({
        error: 'Business location is required'
      });
    }

    if (!yearEstablished || yearEstablished < 1900 || yearEstablished > new Date().getFullYear()) {
      return res.status(400).json({
        error: 'Valid year established is required'
      });
    }

    // Create business profile
    const businessProfile = {
      id: `valuation-${Date.now()}`,
      sector,
      location,
      revenue: Number(revenue),
      ebitda: Number(ebitda || 0),
      employees: Number(employees || 1),
      assets: Number(assets || 0),
      yearEstablished: Number(yearEstablished),
      businessModel,
      growthRate: Number(growthRate),
    };

    const valuation = await valuationBenchmarkService.getBusinessValuation(businessProfile);

    res.json({
      success: true,
      message: 'Business valuation completed successfully',
      data: {
        valuation: {
          estimatedValue: valuation.finalValuation,
          confidence: valuation.confidence,
          marketPosition: valuation.benchmarkData.marketPosition,
        },
        methodology: {
          methodsUsed: valuation.methodsUsed.map(method => ({
            method: method.method,
            weight: method.weight,
            confidence: method.confidence,
          })),
          primaryMethod: valuation.methodsUsed.reduce((prev, curr) => 
            prev.weight > curr.weight ? prev : curr
          ).method,
        },
        benchmarks: {
          sector: valuation.benchmarkData.sectorBenchmarks.sector,
          sampleSize: valuation.benchmarkData.sectorBenchmarks.sampleSize,
          medianRevMultiple: valuation.benchmarkData.sectorBenchmarks.revenueMultiple.median,
          medianEbitdaMultiple: valuation.benchmarkData.sectorBenchmarks.ebitdaMultiple.median,
        },
        comparables: valuation.benchmarkData.comparableCompanies.slice(0, 3).map(comp => ({
          name: comp.name,
          similarity: comp.similarity,
          valuation: comp.valuation,
          matchFactors: comp.matchFactors,
        })),
        factors: valuation.valuationFactors.map(factor => ({
          factor: factor.factor,
          impact: factor.impact,
          description: factor.description,
        })),
        recommendations: valuation.recommendations,
      },
      disclaimer: 'Denna värdering är en uppskattning baserad på marknadsjämförelser och bör kompletteras med professionell värderingsexpertis för transaktioner.',
    });
  } catch (error) {
    console.error('Business valuation failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to calculate business valuation'
    });
  }
};

// Sector Benchmarks (Public endpoint)
export const getSectorBenchmarks = async (req: Request, res: Response) => {
  try {
    const { sector } = req.params;

    if (!sector) {
      return res.status(400).json({
        error: 'Sector parameter is required'
      });
    }

    const benchmarks = await valuationBenchmarkService.getSectorBenchmarks(sector);

    res.json({
      success: true,
      data: {
        sector: benchmarks.sector,
        multiples: {
          revenue: {
            median: benchmarks.revenueMultiple.median,
            range: `${benchmarks.revenueMultiple.min}x - ${benchmarks.revenueMultiple.max}x`,
            percentiles: {
              p25: benchmarks.revenueMultiple.percentile25,
              p50: benchmarks.revenueMultiple.median,
              p75: benchmarks.revenueMultiple.percentile75,
            },
          },
          ebitda: {
            median: benchmarks.ebitdaMultiple.median,
            range: `${benchmarks.ebitdaMultiple.min}x - ${benchmarks.ebitdaMultiple.max}x`,
            percentiles: {
              p25: benchmarks.ebitdaMultiple.percentile25,
              p50: benchmarks.ebitdaMultiple.median,
              p75: benchmarks.ebitdaMultiple.percentile75,
            },
          },
        },
        metadata: {
          sampleSize: benchmarks.sampleSize,
          geography: benchmarks.geography,
          lastUpdated: benchmarks.lastUpdated,
        },
      },
    });
  } catch (error) {
    console.error('Get sector benchmarks failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve sector benchmarks'
    });
  }
};

// Transaction Success Metrics
export const getTransactionMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    const { timeframe = 'QUARTER' } = req.query;

    if (!['MONTH', 'QUARTER', 'YEAR'].includes(timeframe as string)) {
      return res.status(400).json({
        error: 'Invalid timeframe. Must be MONTH, QUARTER, or YEAR'
      });
    }

    const metrics = await businessAnalyticsService.getTransactionSuccessMetrics(
      timeframe as 'MONTH' | 'QUARTER' | 'YEAR'
    );

    res.json({
      success: true,
      data: {
        overview: {
          successRate: metrics.successRate,
          averageTimeToClose: metrics.averageTimeToClose,
          timeframe,
        },
        dropOffAnalysis: {
          stages: metrics.dropOffPoints,
          totalDropOff: metrics.dropOffPoints.reduce((sum, stage) => sum + stage.dropOffRate, 0),
        },
        successFactors: metrics.successFactors,
        recommendations: {
          immediate: metrics.dropOffPoints[0]?.suggestions || [],
          strategic: metrics.successFactors.slice(0, 2).map(factor => 
            `Focus på ${factor.factor.toLowerCase()} för ${factor.impact * 100}% bättre resultat`
          ),
        },
      },
      meta: {
        analysisDate: new Date(),
        timeframe,
        dataPoints: 'Last 500 transactions',
      },
    });
  } catch (error) {
    console.error('Transaction metrics failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve transaction metrics'
    });
  }
};

// User Behavior Analytics
export const getUserBehaviorAnalytics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Check admin permission
    if (req.user!.role !== 'ADMIN') {
      return res.status(403).json({
        error: 'Administrative privileges required'
      });
    }

    const analytics = await businessAnalyticsService.getUserBehaviorAnalytics();

    res.json({
      success: true,
      data: {
        segments: analytics.userSegments,
        engagement: analytics.engagementMetrics,
        features: analytics.popularFeatures,
        geography: analytics.geographicDistribution,
        insights: {
          topSegment: analytics.userSegments.reduce((prev, curr) => 
            prev.conversionRate > curr.conversionRate ? prev : curr
          ),
          growthOpportunity: analytics.userSegments.find(s => s.segment === 'Potential Sellers'),
          topFeature: analytics.popularFeatures.reduce((prev, curr) => 
            prev.satisfaction > curr.satisfaction ? prev : curr
          ),
        },
      },
      meta: {
        analysisDate: new Date(),
        usersSampled: analytics.userSegments.reduce((sum, segment) => sum + segment.count, 0),
        dataRetention: '90 days',
      },
    });
  } catch (error) {
    console.error('User behavior analytics failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve user behavior analytics'
    });
  }
};

// Business Metrics (Simplified for users)
export const getBusinessMetrics = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { period = 'MONTH' } = req.query;

    if (!['WEEK', 'MONTH', 'QUARTER', 'YEAR'].includes(period as string)) {
      return res.status(400).json({
        error: 'Invalid period. Must be WEEK, MONTH, QUARTER, or YEAR'
      });
    }

    // Get simplified metrics for regular users
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case 'WEEK':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'MONTH':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'QUARTER':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'YEAR':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const metrics = await businessAnalyticsService.calculateBusinessMetrics(startDate, endDate);

    // Return public-safe metrics
    res.json({
      success: true,
      data: {
        platform: {
          totalListings: metrics.listings.total,
          activeListings: metrics.listings.active,
          averageTimeToSale: metrics.listings.averageTime,
        },
        activity: {
          totalTransactions: metrics.transactions.total,
          successRate: Math.round(metrics.transactions.successRate),
          period: period,
        },
        growth: {
          userGrowth: metrics.users.growth,
          trend: metrics.users.growth > 10 ? 'STRONG' : metrics.users.growth > 5 ? 'MODERATE' : 'SLOW',
        },
      },
      meta: {
        period,
        lastUpdated: new Date(),
        visibility: 'Public metrics',
      },
    });
  } catch (error) {
    console.error('Business metrics failed:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to retrieve business metrics'
    });
  }
};