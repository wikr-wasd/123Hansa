import jwt from 'jsonwebtoken';
import { config } from '@/config/app';
import { logger } from './logger';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export class JWTService {
  static generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>) {
    try {
      const accessToken = jwt.sign(payload, config.jwtSecret, {
        expiresIn: config.jwtExpiresIn,
        issuer: '123hansa-api',
        audience: '123hansa-web',
      });

      const refreshToken = jwt.sign(
        { userId: payload.userId },
        config.jwtSecret,
        {
          expiresIn: config.jwtRefreshExpiresIn,
          issuer: '123hansa-api',
          audience: '123hansa-refresh',
        }
      );

      return {
        accessToken,
        refreshToken,
        expiresIn: this.getExpirationTime(config.jwtExpiresIn),
      };
    } catch (error) {
      logger.error('Error generating tokens:', error);
      throw new Error('Token generation failed');
    }
  }

  static verifyAccessToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwtSecret, {
        issuer: '123hansa-api',
        audience: '123hansa-web',
      }) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token');
      }
      throw new Error('Token verification failed');
    }
  }

  static verifyRefreshToken(token: string): { userId: string } {
    try {
      return jwt.verify(token, config.jwtSecret, {
        issuer: '123hansa-api',
        audience: '123hansa-refresh',
      }) as { userId: string };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired');
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token');
      }
      throw new Error('Refresh token verification failed');
    }
  }

  static getExpirationTime(expiresIn: string): number {
    // Convert expiresIn string (e.g., '7d', '1h') to seconds
    const unit = expiresIn.slice(-1);
    const value = parseInt(expiresIn.slice(0, -1));
    
    switch (unit) {
      case 's': return value;
      case 'm': return value * 60;
      case 'h': return value * 60 * 60;
      case 'd': return value * 24 * 60 * 60;
      default: return 7 * 24 * 60 * 60; // Default 7 days
    }
  }

  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }
    
    return parts[1];
  }
}