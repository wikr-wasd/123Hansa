import { Request, Response, NextFunction } from 'express';
import { logger } from '@/utils/logger';

interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  standardHeaders?: boolean;
  legacyHeaders?: boolean;
}

// In-memory store for rate limiting (production should use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimit = (options: RateLimitOptions) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,
    message = 'Too many requests from this IP, please try again later.',
    standardHeaders = true,
    legacyHeaders = false,
  } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const key = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    
    // Clean up expired entries
    const resetTime = now + windowMs;
    for (const [ip, data] of requestCounts.entries()) {
      if (now > data.resetTime) {
        requestCounts.delete(ip);
      }
    }
    
    // Get or create record for this IP
    let record = requestCounts.get(key);
    if (!record || now > record.resetTime) {
      record = { count: 0, resetTime };
      requestCounts.set(key, record);
    }
    
    // Increment count
    record.count++;
    
    // Set headers
    if (standardHeaders) {
      res.set({
        'RateLimit-Limit': max.toString(),
        'RateLimit-Remaining': Math.max(0, max - record.count).toString(),
        'RateLimit-Reset': new Date(record.resetTime).toISOString(),
      });
    }
    
    if (legacyHeaders) {
      res.set({
        'X-RateLimit-Limit': max.toString(),
        'X-RateLimit-Remaining': Math.max(0, max - record.count).toString(),
        'X-RateLimit-Reset': Math.ceil(record.resetTime / 1000).toString(),
      });
    }
    
    // Check if limit exceeded
    if (record.count > max) {
      logger.warn(`Rate limit exceeded for IP: ${key}`, {
        ip: key,
        count: record.count,
        limit: max,
        userAgent: req.get('User-Agent'),
        path: req.path,
      });
      
      return res.status(429).json({
        error: 'Too Many Requests',
        message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      });
    }
    
    next();
  };
};

// Production-ready rate limit configurations for 1000+ users
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // Increased for legitimate users
  message: 'Too many authentication attempts, please try again later.',
});

export const apiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Scaled for 1000+ concurrent users
});

export const strictRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Increased for production traffic
  message: 'API rate limit exceeded, please try again later.',
});

export const paymentRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 20, // Allow more payment attempts
  message: 'Too many payment requests, please try again later.',
});

// New rate limits for production
export const listingSearchRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 300, // High limit for search functionality
  message: 'Too many search requests, please slow down.',
});

export const fileUploadRateLimit = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 50, // File upload limit
  message: 'Too many file uploads, please try again later.',
});

export const adminRateLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 500, // High limit for admin operations
  message: 'Admin rate limit exceeded.',
});