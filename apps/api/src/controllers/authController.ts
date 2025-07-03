import { Request, Response } from 'express';
import { AuthService } from '@/services/authService';
import { asyncHandler, createError } from '@/middleware/errorHandler';
import { logger } from '@/utils/logger';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  verifyEmailSchema,
  changePasswordSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/validators/auth';

export class AuthController {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = registerSchema.parse(req.body);

    // Register user
    const result = await AuthService.register(validatedData);

    // Send response
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  });

  /**
   * Login user
   * POST /api/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = loginSchema.parse(req.body);

    // Login user
    const result = await AuthService.login(validatedData);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  });

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  static refreshToken = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { refreshToken } = refreshTokenSchema.parse(req.body);

    // Refresh token
    const result = await AuthService.refreshToken(refreshToken);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Token refreshed successfully',
      data: {
        user: result.user,
        accessToken: result.tokens.accessToken,
        refreshToken: result.tokens.refreshToken,
        expiresIn: result.tokens.expiresIn,
      },
    });
  });

  /**
   * Logout user
   * POST /api/auth/logout
   */
  static logout = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const refreshToken = req.body.refreshToken;

    if (!userId) {
      throw createError.unauthorized('User not authenticated');
    }

    // Logout user
    await AuthService.logout(userId, refreshToken);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  });

  /**
   * Verify email
   * POST /api/auth/verify-email
   */
  static verifyEmail = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { token } = verifyEmailSchema.parse(req.body);

    // Verify email
    await AuthService.verifyEmail(token);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  /**
   * Get verification token from URL parameter
   * GET /api/auth/verify-email/:token
   */
  static verifyEmailFromUrl = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;

    if (!token) {
      throw createError.badRequest('Verification token is required');
    }

    // Verify email
    await AuthService.verifyEmail(token);

    // Send response (could redirect to frontend)
    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  });

  /**
   * Change password
   * POST /api/auth/change-password
   */
  static changePassword = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw createError.unauthorized('User not authenticated');
    }

    // Validate request body
    const validatedData = changePasswordSchema.parse(req.body);

    // Change password
    await AuthService.changePassword(userId, validatedData);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  /**
   * Get current user profile
   * GET /api/auth/me
   */
  static getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      throw createError.unauthorized('User not authenticated');
    }

    // Get user profile
    const user = await AuthService.getUserProfile(userId);

    // Send response
    res.status(200).json({
      success: true,
      data: { user },
    });
  });

  /**
   * Check authentication status
   * GET /api/auth/status
   */
  static checkStatus = asyncHandler(async (req: Request, res: Response) => {
    const user = req.user;

    res.status(200).json({
      success: true,
      data: {
        isAuthenticated: !!user,
        user: user || null,
      },
    });
  });

  /**
   * Forgot password - send reset email
   * POST /api/auth/forgot-password
   */
  static forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const { email } = forgotPasswordSchema.parse(req.body);

    // TODO: Implement forgot password logic
    logger.info(`Password reset requested for: ${email}`);

    // Send response (always success for security)
    res.status(200).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent',
    });
  });

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  static resetPassword = asyncHandler(async (req: Request, res: Response) => {
    // Validate request body
    const validatedData = resetPasswordSchema.parse(req.body);

    // TODO: Implement reset password logic
    logger.info(`Password reset attempted with token: ${validatedData.token}`);

    // Send response
    res.status(200).json({
      success: true,
      message: 'Password reset successfully',
    });
  });
}