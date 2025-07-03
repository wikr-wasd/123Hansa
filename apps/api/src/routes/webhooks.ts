import express from 'express';
import {
  handleStripeWebhook,
  handleSwishWebhook,
  handleMobilePayWebhook,
  handleVippsWebhook,
} from '../controllers/payments/webhookController';

const router = express.Router();

// Stripe webhooks
router.post('/stripe', express.raw({ type: 'application/json' }), handleStripeWebhook);

// Nordic payment webhooks
router.post('/swish/:paymentId', express.json(), handleSwishWebhook);
router.post('/mobilepay/:paymentId', express.json(), handleMobilePayWebhook);
router.post('/vipps/:paymentId', express.json(), handleVippsWebhook);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'webhooks',
    timestamp: new Date().toISOString()
  });
});

export default router;