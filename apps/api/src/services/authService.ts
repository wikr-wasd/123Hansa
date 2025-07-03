import { prisma } from '@/config/database';
import { PasswordService } from '@/utils/password';
import { JWTService } from '@/utils/jwt';
import { createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import { RedisSession } from '@/config/redis';
import {
  RegisterRequest,
  LoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
} from '@/validators/auth';
import { randomBytes } from 'crypto';
import { User } from '@prisma/client';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(data: RegisterRequest) {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw createError.conflict('Email already registered');
      }

      // Hash password
      const passwordHash = await PasswordService.hash(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          passwordHash,
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          country: data.country,
          language: data.language,
          companyName: data.companyName,
          verificationLevel: 'NONE',
          isEmailVerified: false,
          isPhoneVerified: false,
          isBankIdVerified: false,
          isActive: true,
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          country: true,
          language: true,
          role: true,
          verificationLevel: true,
          isEmailVerified: true,
          createdAt: true,
        },
      });

      // Generate email verification token
      const verificationToken = randomBytes(32).toString('hex');
      await prisma.emailVerification.create({
        data: {
          userId: user.id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        },
      });

      // Generate JWT tokens
      const tokens = JWTService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      logger.info(`User registered: ${user.email}`);

      return {
        user,
        tokens,
        verificationToken, // For email verification
      };
    } catch (error) {
      logger.error('Registration error:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  static async login(data: LoginRequest) {
    try {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: data.email },
        select: {
          id: true,
          email: true,
          passwordHash: true,
          firstName: true,
          lastName: true,
          country: true,
          language: true,
          role: true,
          verificationLevel: true,
          isEmailVerified: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        throw createError.unauthorized('Invalid email or password');
      }

      // Verify password
      const isPasswordValid = await PasswordService.verify(
        data.password,
        user.passwordHash
      );

      if (!isPasswordValid) {
        throw createError.unauthorized('Invalid email or password');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      // Generate JWT tokens
      const tokens = JWTService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // Store refresh token
      await this.storeRefreshToken(user.id, tokens.refreshToken);

      // Remove password hash from response
      const { passwordHash, ...userResponse } = user;

      logger.info(`User logged in: ${user.email}`);

      return {
        user: userResponse,
        tokens,
      };
    } catch (error) {
      logger.error('Login error:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string) {
    try {
      // Verify refresh token
      const payload = JWTService.verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database
      const session = await prisma.userSession.findUnique({
        where: {
          refreshToken,
          isActive: true,
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              role: true,
              isActive: true,
            },
          },
        },
      });

      if (!session || !session.user.isActive) {
        throw createError.unauthorized('Invalid refresh token');
      }

      // Check if token is expired
      if (session.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.userSession.update({
          where: { id: session.id },
          data: { isActive: false },
        });
        throw createError.unauthorized('Refresh token expired');
      }

      // Generate new tokens
      const tokens = JWTService.generateTokens({
        userId: session.user.id,
        email: session.user.email,
        role: session.user.role,
      });

      // Update refresh token in database
      await prisma.userSession.update({
        where: { id: session.id },
        data: {
          refreshToken: tokens.refreshToken,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        },
      });

      return {
        user: session.user,
        tokens,
      };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string, refreshToken?: string) {
    try {
      if (refreshToken) {
        // Deactivate specific session
        await prisma.userSession.updateMany({
          where: {
            userId,
            refreshToken,
            isActive: true,
          },
          data: { isActive: false },
        });
      } else {
        // Deactivate all sessions for user
        await prisma.userSession.updateMany({
          where: {
            userId,
            isActive: true,
          },
          data: { isActive: false },
        });
      }

      // Clear Redis session if exists
      await RedisSession.delete(userId);

      logger.info(`User logged out: ${userId}`);
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  /**
   * Change user password
   */
  static async changePassword(userId: string, data: ChangePasswordRequest) {
    try {
      // Get current user
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          passwordHash: true,
        },
      });

      if (!user) {
        throw createError.notFound('User not found');
      }

      // Verify current password
      const isCurrentPasswordValid = await PasswordService.verify(
        data.currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        throw createError.badRequest('Current password is incorrect');
      }

      // Hash new password
      const newPasswordHash = await PasswordService.hash(data.newPassword);

      // Update password
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      });

      // Invalidate all sessions except current one
      await prisma.userSession.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: { isActive: false },
      });

      logger.info(`Password changed for user: ${userId}`);
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(token: string) {
    try {
      const verification = await prisma.emailVerification.findUnique({
        where: { token },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              isEmailVerified: true,
            },
          },
        },
      });

      if (!verification) {
        throw createError.badRequest('Invalid verification token');
      }

      if (verification.usedAt) {
        throw createError.badRequest('Verification token already used');
      }

      if (verification.expiresAt < new Date()) {
        throw createError.badRequest('Verification token expired');
      }

      // Mark email as verified
      await prisma.user.update({
        where: { id: verification.userId },
        data: {
          isEmailVerified: true,
          verificationLevel: 'EMAIL',
        },
      });

      // Mark verification as used
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      });

      logger.info(`Email verified for user: ${verification.user.email}`);

      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  /**
   * Store refresh token in database
   */
  private static async storeRefreshToken(userId: string, refreshToken: string) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await prisma.userSession.create({
      data: {
        userId,
        refreshToken,
        expiresAt,
        isActive: true,
      },
    });
  }

  /**
   * Get user profile
   */
  static async getUserProfile(userId: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          country: true,
          language: true,
          role: true,
          verificationLevel: true,
          isEmailVerified: true,
          isPhoneVerified: true,
          isBankIdVerified: true,
          avatar: true,
          bio: true,
          website: true,
          linkedinProfile: true,
          companyName: true,
          companyRegistration: true,
          vatNumber: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        throw createError.notFound('User not found');
      }

      return user;
    } catch (error) {
      logger.error('Get user profile error:', error);
      throw error;
    }
  }
}