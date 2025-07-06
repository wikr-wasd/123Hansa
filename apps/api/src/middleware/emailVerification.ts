import { Request, Response, NextFunction } from 'express';
import { createError } from './errorHandler';
import { prisma } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Middleware to require email verification for access
 */
export const requireEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw createError.unauthorized('Authentication required');
    }

    // Get user's email verification status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        isEmailVerified: true,
        isActive: true,
      },
    });

    if (!user || !user.isActive) {
      throw createError.unauthorized('User account not found or inactive');
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        success: false,
        error: 'EMAIL_VERIFICATION_REQUIRED',
        message: 'Email verification is required to access this resource',
        data: {
          email: user.email,
          needsVerification: true,
        },
      });
    }

    next();
  } catch (error) {
    logger.error('Email verification check error:', error);
    next(error);
  }
};

/**
 * Middleware to check email verification status but allow access
 * Adds verification status to request
 */
export const checkEmailVerification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          isEmailVerified: true,
        },
      });

      if (user) {
        req.emailVerified = user.isEmailVerified;
        req.userEmail = user.email;
      }
    }

    next();
  } catch (error) {
    logger.error('Email verification status check error:', error);
    // Don't fail request if check fails, just continue
    next();
  }
};

/**
 * List of routes that don't require email verification
 */
export const EMAIL_VERIFICATION_EXEMPT_ROUTES = [
  '/api/auth/verify-email',
  '/api/auth/resend-verification',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/status',
  '/api/auth/change-password',
];

/**
 * Check if route requires email verification
 */
export const shouldRequireEmailVerification = (path: string): boolean => {
  // Always exempt auth routes
  if (path.startsWith('/api/auth/')) {
    return EMAIL_VERIFICATION_EXEMPT_ROUTES.includes(path);
  }

  // Exempt health checks and public routes
  if (
    path.includes('/health') ||
    path.includes('/public') ||
    path.startsWith('/api/listings/public') ||
    path.startsWith('/api/analytics/public')
  ) {
    return false;
  }

  // Everything else requires verification
  return true;
};

declare global {
  namespace Express {
    interface Request {
      emailVerified?: boolean;
      userEmail?: string;
    }
  }
}