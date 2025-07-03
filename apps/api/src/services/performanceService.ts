import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';
import { config } from '@/config/app';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  responseTime: number;
  statusCode: number;
  userAgent?: string;
  ipAddress?: string;
  userId?: string;
  timestamp: Date;
}

class PerformanceService {
  private metrics: PerformanceMetric[] = [];
  private readonly BATCH_SIZE = 100;
  private readonly FLUSH_INTERVAL = 30000; // 30 seconds

  constructor() {
    // Flush metrics to database periodically
    setInterval(() => {
      this.flushMetrics();
    }, this.FLUSH_INTERVAL);

    // Graceful shutdown
    process.on('SIGTERM', () => {
      this.flushMetrics();
    });
  }

  // Express middleware for performance monitoring
  middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startTime = Date.now();
      const originalSend = res.send;

      res.send = function(body: any) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        // Log slow requests
        if (responseTime > 1000) {
          logger.warn('Slow request detected', {
            method: req.method,
            url: req.originalUrl,
            responseTime,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
          });
        }

        // Store metric
        const metric: PerformanceMetric = {
          endpoint: req.route?.path || req.path,
          method: req.method,
          responseTime,
          statusCode: res.statusCode,
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          userId: req.user?.id,
          timestamp: new Date(),
        };

        performanceService.recordMetric(metric);

        return originalSend.call(this, body);
      };

      next();
    };
  }

  recordMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);

    // Flush if batch size reached
    if (this.metrics.length >= this.BATCH_SIZE) {
      this.flushMetrics();
    }
  }

  private async flushMetrics() {
    if (this.metrics.length === 0) return;

    const metricsToFlush = [...this.metrics];
    this.metrics = [];

    try {
      // Insert metrics into database
      await prisma.performanceMetrics.createMany({
        data: metricsToFlush.map(metric => ({
          endpoint: metric.endpoint,
          httpMethod: metric.method,
          responseTime: metric.responseTime,
          statusCode: metric.statusCode,
          userAgent: metric.userAgent,
          ipAddress: metric.ipAddress,
          userId: metric.userId,
          timestamp: metric.timestamp,
        })),
        skipDuplicates: true,
      });

      logger.debug(`Flushed ${metricsToFlush.length} performance metrics`);
    } catch (error) {
      logger.error('Failed to flush performance metrics:', error);
      // Re-add metrics to retry later
      this.metrics.unshift(...metricsToFlush);
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(timeframe: '1h' | '24h' | '7d' | '30d' = '24h') {
    const now = new Date();
    const timeframes = {
      '1h': new Date(now.getTime() - 60 * 60 * 1000),
      '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };

    const fromDate = timeframes[timeframe];

    try {
      const [
        averageResponseTime,
        slowestEndpoints,
        errorRates,
        requestVolume,
        statusCodeDistribution
      ] = await Promise.all([
        // Average response time
        prisma.performanceMetrics.aggregate({
          where: { timestamp: { gte: fromDate } },
          _avg: { responseTime: true },
        }),

        // Slowest endpoints
        prisma.performanceMetrics.groupBy({
          by: ['endpoint', 'httpMethod'],
          where: { timestamp: { gte: fromDate } },
          _avg: { responseTime: true },
          _count: true,
          orderBy: { _avg: { responseTime: 'desc' } },
          take: 10,
        }),

        // Error rates by endpoint
        prisma.performanceMetrics.groupBy({
          by: ['endpoint', 'httpMethod'],
          where: { 
            timestamp: { gte: fromDate },
            statusCode: { gte: 400 }
          },
          _count: true,
        }),

        // Request volume over time
        prisma.$queryRaw`
          SELECT 
            DATE_TRUNC('hour', timestamp) as hour,
            COUNT(*) as requests,
            AVG(response_time) as avg_response_time
          FROM performance_metrics 
          WHERE timestamp >= ${fromDate}
          GROUP BY DATE_TRUNC('hour', timestamp)
          ORDER BY hour
        `,

        // Status code distribution
        prisma.performanceMetrics.groupBy({
          by: ['statusCode'],
          where: { timestamp: { gte: fromDate } },
          _count: true,
        }),
      ]);

      return {
        timeframe,
        averageResponseTime: averageResponseTime._avg.responseTime || 0,
        slowestEndpoints,
        errorRates,
        requestVolume,
        statusCodeDistribution,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error('Failed to get performance analytics:', error);
      throw error;
    }
  }

  // Get real-time system health
  async getSystemHealth() {
    try {
      const now = new Date();
      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

      const [
        recentMetrics,
        databaseHealth,
        memoryUsage
      ] = await Promise.all([
        prisma.performanceMetrics.findMany({
          where: { timestamp: { gte: oneMinuteAgo } },
          select: {
            responseTime: true,
            statusCode: true,
          },
        }),
        this.checkDatabaseHealth(),
        this.getMemoryUsage(),
      ]);

      const totalRequests = recentMetrics.length;
      const averageResponseTime = totalRequests > 0 
        ? recentMetrics.reduce((sum, m) => sum + m.responseTime, 0) / totalRequests 
        : 0;
      const errorRate = totalRequests > 0 
        ? recentMetrics.filter(m => m.statusCode >= 400).length / totalRequests * 100 
        : 0;

      const health = {
        status: 'healthy' as 'healthy' | 'warning' | 'critical',
        timestamp: now.toISOString(),
        metrics: {
          requestsPerMinute: totalRequests,
          averageResponseTime,
          errorRate,
          ...memoryUsage,
        },
        database: databaseHealth,
      };

      // Determine overall health status
      if (errorRate > 10 || averageResponseTime > 2000 || !databaseHealth.connected) {
        health.status = 'critical';
      } else if (errorRate > 5 || averageResponseTime > 1000) {
        health.status = 'warning';
      }

      return health;
    } catch (error) {
      logger.error('Failed to get system health:', error);
      return {
        status: 'critical' as const,
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
      };
    }
  }

  private async checkDatabaseHealth() {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const responseTime = Date.now() - start;

      return {
        connected: true,
        responseTime,
        status: responseTime < 100 ? 'good' : responseTime < 500 ? 'warning' : 'slow',
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'error' as const,
      };
    }
  }

  private getMemoryUsage() {
    const usage = process.memoryUsage();
    return {
      heapUsed: Math.round(usage.heapUsed / 1024 / 1024), // MB
      heapTotal: Math.round(usage.heapTotal / 1024 / 1024), // MB
      external: Math.round(usage.external / 1024 / 1024), // MB
      rss: Math.round(usage.rss / 1024 / 1024), // MB
    };
  }

  // Clean up old metrics (run as cron job)
  async cleanupOldMetrics(daysToKeep: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    try {
      const result = await prisma.performanceMetrics.deleteMany({
        where: {
          timestamp: { lt: cutoffDate }
        }
      });

      logger.info(`Cleaned up ${result.count} old performance metrics`);
      return result.count;
    } catch (error) {
      logger.error('Failed to cleanup old metrics:', error);
      throw error;
    }
  }
}

export const performanceService = new PerformanceService();
export default performanceService;