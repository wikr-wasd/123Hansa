import express from 'express';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  getPerformanceDashboard,
  getMarketIntelligence,
  getBusinessValuation,
  getSectorBenchmarks,
  getTransactionMetrics,
  getUserBehaviorAnalytics,
  getBusinessMetrics,
} from '../controllers/analytics/analyticsController';

const router = express.Router();

// Admin Analytics Endpoints
router.get(
  '/admin/dashboard',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
  getPerformanceDashboard
);

router.get(
  '/admin/market-intelligence',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), // 10 requests per hour
  getMarketIntelligence
);

router.get(
  '/admin/transaction-metrics',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  getTransactionMetrics
);

router.get(
  '/admin/user-behavior',
  requireAuth,
  rateLimit({ windowMs: 30 * 60 * 1000, max: 15 }), // 15 requests per 30 minutes
  getUserBehaviorAnalytics
);

// User Analytics Endpoints
router.post(
  '/valuation',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 valuations per hour
  getBusinessValuation
);

router.get(
  '/metrics',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  getBusinessMetrics
);

// Public Analytics Endpoints
router.get(
  '/benchmarks/:sector',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  getSectorBenchmarks
);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'analytics',
    features: {
      businessAnalytics: true,
      marketIntelligence: true,
      valuationBenchmarks: true,
      transactionMetrics: true,
      userBehaviorAnalytics: true,
    },
    timestamp: new Date().toISOString()
  });
});

export default router;