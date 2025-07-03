import express from 'express';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  createPayment,
  processPayment,
  getPayment,
  getPaymentsByTransaction,
  getUserPayments,
  createRefund,
  calculatePaymentFees,
} from '../controllers/payments/paymentController';

const router = express.Router();

// Payment creation and processing
router.post(
  '/payments',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 requests per 15 minutes
  createPayment
);

router.post(
  '/payments/:paymentId/process',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 requests per 15 minutes
  processPayment
);

// Payment retrieval
router.get(
  '/payments/:paymentId',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  getPayment
);

router.get(
  '/transactions/:transactionId/payments',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  getPaymentsByTransaction
);

router.get(
  '/users/me/payments',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  getUserPayments
);

// Refunds
router.post(
  '/payments/:paymentId/refund',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 5 }), // 5 requests per 15 minutes
  createRefund
);

// Utility endpoints
router.get(
  '/payment-fees',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  calculatePaymentFees
);

router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'payments',
    timestamp: new Date().toISOString()
  });
});

export default router;