import express from 'express';
import { requireAuth } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import {
  initiateKYCVerification,
  performAMLCheck,
  initiateBankIDVerification,
  getVerificationStatus,
  uploadVerificationDocument,
  getKYCRequirements,
  getComplianceOverview,
  reviewPendingVerification,
} from '../controllers/compliance/kycAmlController';

const router = express.Router();

// User KYC/AML endpoints
router.post(
  '/kyc/verify',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 5 }), // 5 verification attempts per hour
  initiateKYCVerification
);

router.post(
  '/aml/check',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 3 }), // 3 AML checks per hour
  performAMLCheck
);

router.post(
  '/kyc/bankid',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }), // 10 BankID attempts per 15 minutes
  initiateBankIDVerification
);

router.get(
  '/verification/status',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 status checks per 15 minutes
  getVerificationStatus
);

router.post(
  '/documents/upload',
  requireAuth,
  rateLimit({ windowMs: 60 * 60 * 1000, max: 20 }), // 20 uploads per hour
  uploadVerificationDocument
);

// Public endpoints
router.get(
  '/requirements',
  rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), // 100 requests per 15 minutes
  getKYCRequirements
);

// Admin endpoints
router.get(
  '/admin/compliance-overview',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 30 }), // 30 requests per 15 minutes
  getComplianceOverview
);

router.post(
  '/admin/verification/:verificationId/review',
  requireAuth,
  rateLimit({ windowMs: 15 * 60 * 1000, max: 50 }), // 50 reviews per 15 minutes
  reviewPendingVerification
);

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'kyc-aml',
    kycEnabled: true,
    amlEnabled: true,
    bankIdEnabled: process.env.BANKID_CERT_PATH ? true : false,
    timestamp: new Date().toISOString()
  });
});

export default router;