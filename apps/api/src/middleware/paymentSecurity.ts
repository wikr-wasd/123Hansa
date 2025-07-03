import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// PCI DSS Compliance middleware
export const pciComplianceHeaders = helmet({
  // Force HTTPS
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  // Content type sniffing protection
  noSniff: true,
  // XSS protection
  xssFilter: true,
  // Content Security Policy for payment pages
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://js.stripe.com', 'https://checkout.stripe.com'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://checkout.stripe.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
      connectSrc: ["'self'", 'https://api.stripe.com', 'https://checkout.stripe.com'],
      frameSrc: ["'self'", 'https://checkout.stripe.com', 'https://js.stripe.com'],
      fontSrc: ["'self'", 'https:', 'data:'],
      objectSrc: ["'none'"],
      mediaSrc: ["'none'"],
      childSrc: ["'none'"],
    },
  },
});

// Rate limiting for payment endpoints
export const paymentRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 payment requests per windowMs
  message: {
    error: 'För många betalningsförsök. Försök igen om 15 minuter.',
    code: 'RATE_LIMIT_EXCEEDED'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Rate limit by IP and user ID if authenticated
    const ip = req.ip;
    const userId = req.user?.id || 'anonymous';
    return `payment:${ip}:${userId}`;
  },
});

// Strict rate limiting for failed payments
export const failedPaymentRateLimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Only 3 failed payment attempts per hour
  message: {
    error: 'För många misslyckade betalningsförsök. Kontakta support.',
    code: 'FAILED_PAYMENT_LIMIT'
  },
  skip: (req) => {
    // Only apply to failed payments
    return req.body?.status !== 'failed';
  },
});

// Anti-fraud middleware
export const antiFragmentMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const ip = req.ip;
    const userAgent = req.get('User-Agent') || '';
    const amount = req.body?.amount;

    if (!userId) {
      return next();
    }

    // Check for suspicious patterns
    const suspiciousIndicators: string[] = [];

    // 1. Multiple large payments in short time
    if (amount && amount > 50000) { // Large payment (50k SEK)
      const recentLargePayments = await prisma.payment.count({
        where: {
          userId,
          amount: { gte: 50000 },
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      if (recentLargePayments >= 3) {
        suspiciousIndicators.push('Multiple large payments in 24 hours');
      }
    }

    // 2. Rapid successive payments
    const recentPayments = await prisma.payment.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Last hour
        },
      },
    });

    if (recentPayments >= 5) {
      suspiciousIndicators.push('Multiple payments in short timeframe');
    }

    // 3. Payments from different IP addresses
    const recentPaymentIPs = await prisma.payment.findMany({
      where: {
        userId,
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
      select: { metadata: true },
    });

    const uniqueIPs = new Set(
      recentPaymentIPs
        .map(p => p.metadata?.ip_address)
        .filter(Boolean)
    );

    if (uniqueIPs.size > 3) {
      suspiciousIndicators.push('Payments from multiple IP addresses');
    }

    // 4. Check user verification level
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { verificationLevel: true, isBankIdVerified: true },
    });

    if (amount && amount > 100000 && !user?.isBankIdVerified) {
      suspiciousIndicators.push('Large payment without BankID verification');
    }

    // Log suspicious activity
    if (suspiciousIndicators.length > 0) {
      console.warn('Suspicious payment activity detected:', {
        userId,
        ip,
        userAgent,
        amount,
        indicators: suspiciousIndicators,
        timestamp: new Date().toISOString(),
      });

      // Store fraud alert in database
      await createFraudAlert({
        userId,
        ip,
        userAgent,
        amount,
        indicators: suspiciousIndicators,
        severity: suspiciousIndicators.length > 2 ? 'HIGH' : 'MEDIUM',
      });

      // Block if too many indicators
      if (suspiciousIndicators.length >= 3) {
        return res.status(403).json({
          error: 'Betalning blockerad på grund av säkerhetsrutiner. Kontakta support.',
          code: 'SECURITY_BLOCK',
        });
      }
    }

    // Add security metadata to request
    req.securityMetadata = {
      ip,
      userAgent,
      timestamp: new Date(),
      riskLevel: suspiciousIndicators.length > 1 ? 'HIGH' : 'LOW',
      indicators: suspiciousIndicators,
    };

    next();
  } catch (error) {
    console.error('Anti-fraud middleware error:', error);
    next(); // Don't block payments due to middleware errors
  }
};

// Input sanitization for payment data
export const sanitizePaymentInput = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    // Remove potentially dangerous fields
    const dangerousFields = ['__proto__', 'constructor', 'prototype'];
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) {
        return obj;
      }

      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }

      const sanitized: any = {};
      for (const [key, value] of Object.entries(obj)) {
        if (!dangerousFields.includes(key)) {
          sanitized[key] = sanitizeObject(value);
        }
      }
      return sanitized;
    };

    req.body = sanitizeObject(req.body);

    // Validate amount format
    if (req.body.amount !== undefined) {
      const amount = parseFloat(req.body.amount);
      if (isNaN(amount) || amount <= 0 || amount > 10000000) {
        return res.status(400).json({
          error: 'Ogiltigt belopp',
          code: 'INVALID_AMOUNT',
        });
      }
      req.body.amount = amount;
    }

    // Validate currency
    if (req.body.currency && !['SEK', 'NOK', 'DKK', 'EUR', 'USD', 'GBP'].includes(req.body.currency)) {
      return res.status(400).json({
        error: 'Ogiltig valuta',
        code: 'INVALID_CURRENCY',
      });
    }
  }

  next();
};

// Payment method validation
export const validatePaymentMethod = (req: Request, res: Response, next: NextFunction) => {
  const { paymentMethod } = req.body;
  
  if (!paymentMethod) {
    return res.status(400).json({
      error: 'Betalningsmetod krävs',
      code: 'PAYMENT_METHOD_REQUIRED',
    });
  }

  const validMethods = [
    'STRIPE_CARD',
    'STRIPE_SEPA',
    'STRIPE_BANK_TRANSFER',
    'SWISH',
    'MOBILEPAY',
    'VIPPS',
    'BANK_TRANSFER',
    'PAYPAL'
  ];

  if (!validMethods.includes(paymentMethod)) {
    return res.status(400).json({
      error: 'Ogiltig betalningsmetod',
      code: 'INVALID_PAYMENT_METHOD',
    });
  }

  next();
};

// Webhook signature validation
export const validateWebhookSignature = (provider: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers[`${provider}-signature`] as string;
    
    if (!signature) {
      return res.status(400).json({
        error: 'Missing webhook signature',
        code: 'MISSING_SIGNATURE',
      });
    }

    // Webhook signature validation would be provider-specific
    // For now, we'll just check that the signature exists
    // In production, implement proper signature verification

    next();
  };
};

// Data encryption for sensitive payment data
export const encryptSensitiveData = (data: string): string => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.PAYMENT_ENCRYPTION_KEY || 'default-key-change-in-production', 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
};

// Data decryption for sensitive payment data
export const decryptSensitiveData = (encryptedData: string): string => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.PAYMENT_ENCRYPTION_KEY || 'default-key-change-in-production', 'hex');
  
  const parts = encryptedData.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = crypto.createDecipher(algorithm, key);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
};

// Create fraud alert
async function createFraudAlert(params: {
  userId: string;
  ip: string;
  userAgent: string;
  amount?: number;
  indicators: string[];
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}): Promise<void> {
  try {
    // In a real implementation, this would store in a fraud_alerts table
    console.log('Creating fraud alert:', params);
    
    // For now, just log to console
    // In production, you would:
    // 1. Store in database
    // 2. Send alert to security team
    // 3. Potentially block user account
    // 4. Trigger additional verification requirements
  } catch (error) {
    console.error('Failed to create fraud alert:', error);
  }
}

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      securityMetadata?: {
        ip: string;
        userAgent: string;
        timestamp: Date;
        riskLevel: 'LOW' | 'HIGH';
        indicators: string[];
      };
    }
  }
}