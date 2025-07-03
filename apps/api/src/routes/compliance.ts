import express from 'express';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  requestDataExport,
  downloadDataExport,
  requestDataDeletion,
  updateConsent,
  getConsents,
  getDataProcessingInfo,
  generateComplianceReport,
  adminDataExport,
} from '../controllers/compliance/gdprController';

const router = express.Router();

// GDPR Data Subject Rights
router.post(
  '/gdpr/export',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 requests per hour
  requestDataExport
);

router.get(
  '/gdpr/exports/:exportId',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 downloads per 15 minutes
  downloadDataExport
);

router.post(
  '/gdpr/delete',
  requireAuth,
  rateLimit({ windowMs: 24 * 60 * 60 * 1000, max: 1 }), // 1 request per day
  requestDataDeletion
);

// Consent Management
router.post(
  '/consent',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 20 }), // 20 consent updates per 15 minutes
  updateConsent
);

router.get(
  '/consent',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 requests per 15 minutes
  getConsents
);

// Data Processing Information (Public)
router.get(
  '/data-processing-info',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  getDataProcessingInfo
);

// Admin-only endpoints
router.post(
  '/admin/compliance-report',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 reports per hour
  generateComplianceReport
);

router.post(
  '/admin/user-export',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 10 }), // 10 admin exports per hour
  adminDataExport
);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'compliance',
    gdprCompliant: true,
    timestamp: new Date().toISOString()
  });
});

export default router;