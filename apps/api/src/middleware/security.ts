import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import { body, validationResult } from 'express-validator';
import DOMPurify from 'isomorphic-dompurify';
import validator from 'validator';
import crypto from 'crypto';
import { createHash } from 'crypto';

// Rate limiting configurations
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'För många förfrågningar från denna IP, försök igen senare',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for trusted IPs (optional)
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  }
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 login attempts per windowMs
  message: {
    error: 'För många inloggningsförsök, försök igen om 15 minuter',
    retryAfter: 15 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
});

export const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 registrations per hour
  message: {
    error: 'För många registreringsförsök, försök igen om 1 timme',
    retryAfter: 60 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 payment attempts per hour
  message: {
    error: 'För många betalningsförsök, försök igen om 1 timme',
    retryAfter: 60 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false
});

export const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 contact form submissions per hour
  message: {
    error: 'För många kontaktformulär inskickade, försök igen om 1 timme',
    retryAfter: 60 * 60 * 1000
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Speed limiter for suspicious activity
export const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per 15 minutes at full speed
  delayMs: 500, // add 500ms delay per request after delayAfter
  maxDelayMs: 10000, // maximum delay of 10 seconds
  skip: (req) => {
    const trustedIPs = process.env.TRUSTED_IPS?.split(',') || [];
    return trustedIPs.includes(req.ip);
  }
});

// Helmet security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://images.unsplash.com", "https://via.placeholder.com"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https://api.swish.nu", "https://api.paypal.com"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"]
    }
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
});

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // Sanitize body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Sanitize query parameters
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query);
  }
  
  // Sanitize params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params);
  }
  
  next();
};

// Recursive object sanitization
function sanitizeObject(obj: any): any {
  if (typeof obj === 'string') {
    return DOMPurify.sanitize(obj.trim());
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizeObject(obj[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

// Email validation middleware
export const validateEmail = [
  body('email')
    .isEmail()
    .withMessage('Ogiltig e-postadress')
    .normalizeEmail({
      gmail_remove_dots: false,
      gmail_remove_subaddress: false,
      outlookdotcom_remove_subaddress: false,
      yahoo_remove_subaddress: false,
      icloud_remove_subaddress: false
    })
    .custom((value) => {
      // Additional email validation
      if (!validator.isEmail(value)) {
        throw new Error('E-postadressen har ett ogiltigt format');
      }
      
      // Check for suspicious patterns
      if (value.includes('..') || value.includes('++') || value.includes('--')) {
        throw new Error('E-postadressen innehåller ogiltiga tecken');
      }
      
      // Check domain
      const domain = value.split('@')[1];
      if (!domain || domain.length < 2) {
        throw new Error('Ogiltig e-postdomän');
      }
      
      return true;
    }),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltig e-postadress',
        errors: errors.array()
      });
    }
    next();
  }
];

// CSRF protection
export const csrfProtection = (req: Request, res: Response, next: NextFunction) => {
  // Skip CSRF for GET requests
  if (req.method === 'GET') {
    return next();
  }
  
  const token = req.headers['x-csrf-token'] || req.body._csrf;
  const sessionToken = req.session?.csrfToken;
  
  if (!token || !sessionToken || token !== sessionToken) {
    return res.status(403).json({
      success: false,
      message: 'Ogiltig CSRF-token'
    });
  }
  
  next();
};

// Generate CSRF token
export const generateCSRFToken = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session) {
    return res.status(500).json({
      success: false,
      message: 'Session saknas'
    });
  }
  
  const token = crypto.randomBytes(32).toString('hex');
  req.session.csrfToken = token;
  res.locals.csrfToken = token;
  next();
};

// Anti-spam middleware
export const antiSpam = (req: Request, res: Response, next: NextFunction) => {
  const suspicious = checkSuspiciousActivity(req);
  
  if (suspicious.isSpam) {
    return res.status(429).json({
      success: false,
      message: 'Misstänkt spamaktivitet upptäckt',
      details: suspicious.reasons
    });
  }
  
  next();
};

// Check for suspicious activity
function checkSuspiciousActivity(req: Request): { isSpam: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Check for common spam patterns in text fields
  if (req.body) {
    for (const key in req.body) {
      if (typeof req.body[key] === 'string') {
        const text = req.body[key].toLowerCase();
        
        // Check for excessive links
        const linkCount = (text.match(/https?:\/\//g) || []).length;
        if (linkCount > 2) {
          reasons.push('För många länkar');
        }
        
        // Check for common spam keywords
        const spamKeywords = [
          'viagra', 'cialis', 'casino', 'lottery', 'winner', 'congratulations',
          'free money', 'click here', 'act now', 'limited time', 'urgent',
          'crypto', 'bitcoin', 'investment opportunity'
        ];
        
        for (const keyword of spamKeywords) {
          if (text.includes(keyword)) {
            reasons.push(`Misstänkt nyckelord: ${keyword}`);
          }
        }
        
        // Check for excessive capitalization
        const capsCount = (text.match(/[A-Z]/g) || []).length;
        if (text.length > 0 && capsCount / text.length > 0.5) {
          reasons.push('För mycket versaler');
        }
        
        // Check for repeated characters
        if (/(.)\1{4,}/.test(text)) {
          reasons.push('Upprepade tecken');
        }
      }
    }
  }
  
  return {
    isSpam: reasons.length > 0,
    reasons
  };
}

// Password validation
export const validatePassword = [
  body('password')
    .isLength({ min: 8, max: 128 })
    .withMessage('Lösenordet måste vara mellan 8 och 128 tecken')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Lösenordet måste innehålla minst en liten bokstav, en stor bokstav, en siffra och ett specialtecken'),
  
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Ogiltigt lösenord',
        errors: errors.array()
      });
    }
    next();
  }
];

// File upload security
export const secureFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return next();
  }
  
  const files = req.files || [req.file];
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  
  for (const file of files) {
    if (!file) continue;
    
    if (!allowedTypes.includes(file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Filtyp ej tillåten'
      });
    }
    
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'Filen är för stor (max 10MB)'
      });
    }
    
    // Check file content (basic magic number validation)
    if (file.mimetype.startsWith('image/')) {
      const isValidImage = validateImageFile(file.buffer);
      if (!isValidImage) {
        return res.status(400).json({
          success: false,
          message: 'Ogiltig bildfil'
        });
      }
    }
  }
  
  next();
};

// Validate image file content
function validateImageFile(buffer: Buffer): boolean {
  if (!buffer || buffer.length < 4) return false;
  
  const signatures = {
    jpeg: [0xFF, 0xD8, 0xFF],
    png: [0x89, 0x50, 0x4E, 0x47],
    gif: [0x47, 0x49, 0x46],
    webp: [0x52, 0x49, 0x46, 0x46]
  };
  
  for (const [format, signature] of Object.entries(signatures)) {
    if (signature.every((byte, index) => buffer[index] === byte)) {
      return true;
    }
  }
  
  return false;
}

// IP whitelist middleware
export const ipWhitelist = (whitelist: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress;
    
    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      return res.status(403).json({
        success: false,
        message: 'Åtkomst nekad'
      });
    }
    
    next();
  };
};

// Honeypot middleware (for forms)
export const honeypot = (req: Request, res: Response, next: NextFunction) => {
  // Check for honeypot field that should be empty
  if (req.body.website || req.body.url || req.body.homepage) {
    return res.status(400).json({
      success: false,
      message: 'Ogiltig formulärinskickning'
    });
  }
  
  next();
};

// Request logging for security monitoring
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  const logData = {
    timestamp: new Date().toISOString(),
    ip: req.ip,
    method: req.method,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    referer: req.get('Referer'),
    contentLength: req.get('Content-Length'),
    sessionId: req.session?.id
  };
  
  // Log suspicious activity
  if (req.method === 'POST' && req.body) {
    const bodyString = JSON.stringify(req.body);
    if (bodyString.length > 10000) {
      console.warn('Large POST body detected:', logData);
    }
  }
  
  next();
};

export default {
  generalLimiter,
  authLimiter,
  registrationLimiter,
  paymentLimiter,
  contactLimiter,
  speedLimiter,
  securityHeaders,
  sanitizeInput,
  validateEmail,
  csrfProtection,
  generateCSRFToken,
  antiSpam,
  validatePassword,
  secureFileUpload,
  ipWhitelist,
  honeypot,
  securityLogger
};