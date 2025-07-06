import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { AuthController } from '@/controllers/authController';
import { authenticateToken, optionalAuth } from '@/middleware/auth';
import { 
  authLimiter, 
  registrationLimiter,
  validateEmail,
  validatePassword,
  csrfProtection,
  antiSpam,
  honeypot
} from '@/middleware/security';
import {
  authenticateWithGoogle,
  authenticateWithLinkedIn,
  authenticateWithMicrosoft,
  getSocialLoginUrls,
  refreshToken,
  linkSocialAccount,
  unlinkSocialAccount,
  logout,
} from '../controllers/auth/socialAuthController';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Additional rate limiters for specific endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: {
    error: 'Too many requests',
    message: 'Please try again later',
  },
});

const socialAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 social auth attempts per window
  message: {
    error: 'Too many social authentication attempts',
    message: 'Please try again later',
  },
});

// Health check for auth routes
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    service: 'auth',
    socialProviders: {
      google: !!process.env.GOOGLE_CLIENT_ID,
      linkedin: !!process.env.LINKEDIN_CLIENT_ID,
      microsoft: !!process.env.MICROSOFT_CLIENT_ID,
    },
    timestamp: new Date().toISOString()
  });
});

// Traditional auth routes with comprehensive security
router.post('/register', 
  registrationLimiter, 
  csrfProtection, 
  antiSpam, 
  honeypot,
  validateEmail,
  validatePassword,
  AuthController.register
);

router.post('/login', 
  authLimiter, 
  csrfProtection, 
  antiSpam,
  validateEmail,
  AuthController.login
);

router.post('/refresh', generalLimiter, AuthController.refreshToken);

router.post('/forgot-password', 
  authLimiter, 
  csrfProtection, 
  antiSpam,
  validateEmail,
  AuthController.forgotPassword
);

router.post('/reset-password', 
  authLimiter, 
  csrfProtection, 
  antiSpam,
  validatePassword,
  AuthController.resetPassword
);

// Email verification routes
router.post('/verify-email', generalLimiter, AuthController.verifyEmail);
router.get('/verify-email/:token', generalLimiter, AuthController.verifyEmailFromUrl);

// Social authentication endpoints
router.post('/social/google', socialAuthLimiter, authenticateWithGoogle);
router.post('/social/linkedin', socialAuthLimiter, authenticateWithLinkedIn);
router.post('/social/microsoft', socialAuthLimiter, authenticateWithMicrosoft);

// Get social login URLs
router.get('/social/urls', generalLimiter, getSocialLoginUrls);

// Token management
router.post('/token/refresh', generalLimiter, refreshToken);
router.post('/logout', generalLimiter, logout);

// Account linking (authenticated endpoints)
router.post('/link', requireAuth, authLimiter, linkSocialAccount);
router.delete('/unlink/:provider', requireAuth, authLimiter, unlinkSocialAccount);

// Protected routes
router.post('/change-password', authenticateToken, AuthController.changePassword);
router.get('/me', authenticateToken, AuthController.getCurrentUser);

// Optional auth route
router.get('/status', optionalAuth, AuthController.checkStatus);

export default router;