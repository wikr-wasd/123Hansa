import { Request, Response, NextFunction } from 'express';
import { JWTService, JWTPayload } from '@/utils/jwt';
import { prisma } from '@/config/database';
import { createError } from './errorHandler';
import { logger } from '@/utils/logger';

// Export AuthenticatedRequest type
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    userId: string;  // Add userId alias for compatibility
    email: string;
    role: string;
    verificationLevel: string;
    adminProfile?: {
      id: string;
      role: string;
      permissions: any;
      isActive: boolean;
    };
  };
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        userId: string;  // Add userId alias for compatibility
        email: string;
        role: string;
        verificationLevel: string;
        adminProfile?: {
          id: string;
          role: string;
          permissions: any;
          isActive: boolean;
        };
      };
    }
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw createError.unauthorized('Access token required');
    }

    // Verify the token
    const payload: JWTPayload = JWTService.verifyAccessToken(token);

    // Check if user still exists and is active
    const user = await prisma.user.findUnique({
      where: {
        id: payload.userId,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        role: true,
        verificationLevel: true,
        isActive: true,
        adminProfile: {
          select: {
            id: true,
            role: true,
            permissions: true,
            isActive: true,
          }
        },
      },
    });

    if (!user) {
      throw createError.unauthorized('User not found or inactive');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      userId: user.id,  // Add userId alias for compatibility
      email: user.email,
      role: user.role,
      verificationLevel: user.verificationLevel,
      adminProfile: user.adminProfile && user.adminProfile.isActive ? user.adminProfile : undefined,
    };

    next();
  } catch (error) {
    if (error.message === 'Token expired') {
      return res.status(401).json({
        error: 'Token expired',
        message: 'Access token has expired',
        code: 'TOKEN_EXPIRED',
      });
    }

    if (error.message === 'Invalid token') {
      return res.status(401).json({
        error: 'Invalid token',
        message: 'Access token is invalid',
        code: 'INVALID_TOKEN',
      });
    }

    logger.error('Authentication error:', error);
    return res.status(401).json({
      error: 'Authentication failed',
      message: 'Invalid or missing authentication token',
    });
  }
};

/**
 * Middleware to require specific user roles
 */
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires one of the following roles: ${roles.join(', ')}`,
      });
    }

    next();
  };
};

/**
 * Middleware to require specific verification levels
 */
export const requireVerificationLevel = (minLevel: string) => {
  const verificationLevels = ['NONE', 'EMAIL', 'PHONE', 'BANKID'];
  
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: 'Authentication required',
        message: 'You must be logged in to access this resource',
      });
    }

    const userLevelIndex = verificationLevels.indexOf(req.user.verificationLevel);
    const requiredLevelIndex = verificationLevels.indexOf(minLevel);

    if (userLevelIndex < requiredLevelIndex) {
      return res.status(403).json({
        error: 'Verification required',
        message: `This action requires ${minLevel.toLowerCase()} verification`,
        requiredLevel: minLevel,
        currentLevel: req.user.verificationLevel,
      });
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token provided
 */
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = JWTService.extractTokenFromHeader(authHeader);

    if (token) {
      const payload: JWTPayload = JWTService.verifyAccessToken(token);
      
      const user = await prisma.user.findUnique({
        where: {
          id: payload.userId,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          role: true,
          verificationLevel: true,
          adminProfile: {
            select: {
              id: true,
              role: true,
              permissions: true,
              isActive: true,
            }
          },
        },
      });

      if (user) {
        req.user = {
          id: user.id,
          userId: user.id,  // Add userId alias for compatibility
          email: user.email,
          role: user.role,
          verificationLevel: user.verificationLevel,
          adminProfile: user.adminProfile && user.adminProfile.isActive ? user.adminProfile : undefined,
        };
      }
    }

    next();
  } catch (error) {
    // Silently continue without user for optional auth
    next();
  }
};

/**
 * Middleware to require authentication (alias for authenticateToken)
 */
export const requireAuth = authenticateToken;

/**
 * Middleware to require admin authentication and specific admin roles
 */
export const requireAdminAuth = (allowedRoles?: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // First ensure user is authenticated
      if (!req.user) {
        return res.status(401).json({
          error: 'Authentication required',
          message: 'You must be logged in to access this resource',
        });
      }

      // Check if user has admin profile
      if (!req.user.adminProfile) {
        // Log potential security breach attempt
        await prisma.securityEvent.create({
          data: {
            userId: req.user.id,
            eventType: 'UNAUTHORIZED_ADMIN_ACCESS',
            severity: 'WARNING',
            description: 'User attempted to access admin endpoint without admin privileges',
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            metadata: {
              endpoint: req.path,
              method: req.method,
              userEmail: req.user.email
            },
            riskScore: 60
          }
        }).catch(console.error); // Don't block request if logging fails

        return res.status(403).json({
          error: 'Admin access required',
          message: 'You must have admin privileges to access this resource',
        });
      }

      // Check if admin profile is active
      if (!req.user.adminProfile.isActive) {
        return res.status(403).json({
          error: 'Admin account disabled',
          message: 'Your admin account has been disabled',
        });
      }

      // Check specific roles if provided
      if (allowedRoles && allowedRoles.length > 0) {
        if (!allowedRoles.includes(req.user.adminProfile.role)) {
          // Log permission denial
          await prisma.securityEvent.create({
            data: {
              userId: req.user.id,
              eventType: 'INSUFFICIENT_ADMIN_PERMISSIONS',
              severity: 'INFO',
              description: `Admin attempted to access endpoint requiring roles: ${allowedRoles.join(', ')}`,
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              metadata: {
                endpoint: req.path,
                method: req.method,
                userRole: req.user.adminProfile.role,
                requiredRoles: allowedRoles
              },
              riskScore: 20
            }
          }).catch(console.error);

          return res.status(403).json({
            error: 'Insufficient admin permissions',
            message: `This action requires one of the following admin roles: ${allowedRoles.join(', ')}`,
            currentRole: req.user.adminProfile.role,
          });
        }
      }

      // Log successful admin access for audit
      await prisma.adminLog.create({
        data: {
          adminId: req.user.adminProfile.id,
          action: 'ACCESS',
          resourceType: 'ENDPOINT',
          description: `Accessed ${req.method} ${req.path}`,
          details: {
            endpoint: req.path,
            method: req.method,
            query: req.query,
            params: req.params
          },
          ipAddress: req.ip,
          userAgent: req.get('User-Agent')
        }
      }).catch(console.error); // Don't block request if logging fails

      next();
    } catch (error) {
      logger.error('Admin authentication error:', error);
      return res.status(500).json({
        error: 'Authentication error',
        message: 'An error occurred while verifying admin permissions',
      });
    }
  };
};

/**
 * Middleware to check specific admin permissions
 */
export const requireAdminPermission = (permission: string) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user?.adminProfile) {
      return res.status(403).json({
        error: 'Admin access required',
        message: 'You must have admin privileges to access this resource',
      });
    }

    const permissions = req.user.adminProfile.permissions || {};
    
    if (!permissions[permission]) {
      return res.status(403).json({
        error: 'Insufficient permissions',
        message: `This action requires the '${permission}' permission`,
      });
    }

    next();
  };
};