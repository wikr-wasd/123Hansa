import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { logger } from '@/utils/logger';
import { prisma } from '@/config/database';
import { config } from '@/config/app';

// Enhanced security middleware for production

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (obj === null || obj === undefined) return obj;
    if (typeof obj === 'string') {
      // Remove potential XSS patterns
      return obj
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
        .trim();
    }
    if (typeof obj === 'object') {
      const sanitized: any = Array.isArray(obj) ? [] : {};
      for (const key in obj) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
      return sanitized;
    }
    return obj;
  };

  if (req.body) req.body = sanitizeObject(req.body);
  if (req.query) req.query = sanitizeObject(req.query);
  if (req.params) req.params = sanitizeObject(req.params);

  next();
};

// SQL injection protection
export const validateDatabaseInput = (req: Request, res: Response, next: NextFunction) => {
  const sqlInjectionPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
    /(\b(OR|AND)\s+['"]?\d+['"]?\s*=\s*['"]?\d+['"]?)/gi,
    /(;|\|\||&&)/g,
    /('|(\\'))/g,
    /((\%3C)|<)((\%2F)|\/)*[a-z0-9\%]+((\%3E)|>)/gi,
  ];

  const checkForSqlInjection = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return sqlInjectionPatterns.some(pattern => pattern.test(obj));
    }
    if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForSqlInjection);
    }
    return false;
  };

  if (checkForSqlInjection(req.body) || checkForSqlInjection(req.query)) {
    logger.warn('SQL injection attempt detected', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      body: req.body,
      query: req.query,
    });

    return res.status(400).json({
      error: 'Invalid input detected',
      code: 'INVALID_INPUT',
    });
  }

  next();
};

// CSRF protection for state-changing operations
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const token = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session?.csrfToken;

  if (!token || !sessionToken || token !== sessionToken) {
    logger.warn('CSRF token mismatch', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      providedToken: token ? 'present' : 'missing',
      sessionToken: sessionToken ? 'present' : 'missing',
    });

    return res.status(403).json({
      error: 'CSRF token required',
      code: 'CSRF_TOKEN_REQUIRED',
    });
  }

  next();
};

// IP-based security monitoring
interface SecurityEvent {
  ip: string;
  userAgent: string;
  endpoint: string;
  eventType: 'SUSPICIOUS_REQUEST' | 'RATE_LIMIT_EXCEEDED' | 'INVALID_INPUT' | 'UNAUTHORIZED_ACCESS';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  details: any;
}

const suspiciousIPs = new Map<string, { count: number; lastSeen: Date }>();

export const securityMonitoring = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';

  // Check for suspicious patterns
  const suspiciousPatterns = [
    /\b(union|select|insert|delete|drop|create|alter|exec|script)\b/gi,
    /<script|javascript:|data:text\/html/gi,
    /\.\.\/|\.\.\\|\|\||&&|;/g,
  ];

  const requestString = JSON.stringify({
    url: req.originalUrl,
    body: req.body,
    query: req.query,
    headers: req.headers,
  });

  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(requestString));

  if (isSuspicious) {
    const record = suspiciousIPs.get(ip) || { count: 0, lastSeen: new Date() };
    record.count++;
    record.lastSeen = new Date();
    suspiciousIPs.set(ip, record);

    // Log security event
    const event: SecurityEvent = {
      ip,
      userAgent,
      endpoint: req.originalUrl,
      eventType: 'SUSPICIOUS_REQUEST',
      severity: record.count > 5 ? 'CRITICAL' : record.count > 3 ? 'HIGH' : 'MEDIUM',
      details: {
        method: req.method,
        body: req.body,
        query: req.query,
        count: record.count,
      },
    };

    await logSecurityEvent(event);

    // Block if too many suspicious requests
    if (record.count > 10) {
      logger.error('Blocking suspicious IP', { ip, count: record.count });
      return res.status(429).json({
        error: 'Too many suspicious requests',
        code: 'BLOCKED',
      });
    }
  }

  next();
};

// Log security events to database
async function logSecurityEvent(event: SecurityEvent) {
  try {
    await prisma.securityEvent.create({
      data: {
        eventType: event.eventType,
        severity: event.severity,
        description: `${event.eventType} from ${event.ip}`,
        ipAddress: event.ip,
        userAgent: event.userAgent,
        metadata: JSON.stringify(event.details),
        riskScore: calculateRiskScore(event),
      },
    });
  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
}

function calculateRiskScore(event: SecurityEvent): number {
  let score = 0;

  // Base score by event type
  switch (event.eventType) {
    case 'SUSPICIOUS_REQUEST': score += 30; break;
    case 'RATE_LIMIT_EXCEEDED': score += 20; break;
    case 'INVALID_INPUT': score += 25; break;
    case 'UNAUTHORIZED_ACCESS': score += 40; break;
  }

  // Severity multiplier
  switch (event.severity) {
    case 'LOW': score *= 1; break;
    case 'MEDIUM': score *= 1.5; break;
    case 'HIGH': score *= 2; break;
    case 'CRITICAL': score *= 3; break;
  }

  // Repeat offender bonus
  const record = suspiciousIPs.get(event.ip);
  if (record && record.count > 1) {
    score += Math.min(record.count * 5, 50);
  }

  return Math.min(Math.round(score), 100);
}

// File upload security
export const fileUploadSecurity = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }

  const allowedMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  const files = req.files ? (Array.isArray(req.files) ? req.files : [req.files]) : [req.file];

  for (const file of files) {
    if (!file) continue;

    // Check MIME type
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'File type not allowed',
        code: 'INVALID_FILE_TYPE',
      });
    }

    // Check file size
    if (file.size > config.maxFileSize) {
      return res.status(400).json({
        error: 'File too large',
        code: 'FILE_TOO_LARGE',
      });
    }

    // Check for malicious file names
    if (/[<>:"/\\|?*]/.test(file.originalname)) {
      return res.status(400).json({
        error: 'Invalid file name',
        code: 'INVALID_FILE_NAME',
      });
    }
  }

  next();
};

// API key validation for external integrations
export const validateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'] as string;

  if (!apiKey) {
    return res.status(401).json({
      error: 'API key required',
      code: 'API_KEY_REQUIRED',
    });
  }

  // In production, validate against database
  // For now, use environment variable
  const validApiKeys = process.env.API_KEYS?.split(',') || [];

  if (!validApiKeys.includes(apiKey)) {
    logger.warn('Invalid API key used', {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      providedKey: apiKey.substring(0, 8) + '...',
    });

    return res.status(401).json({
      error: 'Invalid API key',
      code: 'INVALID_API_KEY',
    });
  }

  next();
};

// Combine all security middleware
export const applySecurity = [
  sanitizeInput,
  validateDatabaseInput,
  securityMonitoring,
  fileUploadSecurity,
];

export const applyStrictSecurity = [
  ...applySecurity,
  csrfProtection,
  validateApiKey,
];