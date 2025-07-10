import { Router } from 'express';
import * as Sentry from '@sentry/node';

const router = Router();

// Test endpoint to trigger Sentry error
router.get('/error', (req, res) => {
  try {
    // This will throw an error for testing
    throw new Error('Test API error for Sentry - this is intentional!');
  } catch (error) {
    Sentry.captureException(error);
    res.status(500).json({
      error: 'Test error sent to Sentry API project',
      message: 'Check your 123hansa-api Sentry project for this error'
    });
  }
});

// Test endpoint to check Sentry is configured
router.get('/status', (req, res) => {
  res.json({
    message: 'Sentry API integration is active',
    project: '123hansa-api',
    dsn: process.env.SENTRY_DSN ? 'configured' : 'missing'
  });
});

export default router;