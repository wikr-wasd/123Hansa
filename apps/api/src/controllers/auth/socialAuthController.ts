import { Request, Response } from 'express';
import { SocialAuthService } from '../../services/auth/socialAuthService';
import { AuthenticatedRequest } from '../../middleware/auth';

const socialAuthService = new SocialAuthService();

// Google OAuth authentication
export const authenticateWithGoogle = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token is required'
      });
    }

    const result = await socialAuthService.authenticateWithGoogle(accessToken);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      message: result.user.isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          picture: result.user.picture,
          role: result.user.role,
        },
        token: result.token,
        isNewUser: result.user.isNewUser,
      },
    });
  } catch (error) {
    console.error('Google authentication failed:', error);
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Google authentication failed'
    });
  }
};

// LinkedIn OAuth authentication
export const authenticateWithLinkedIn = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token is required'
      });
    }

    const result = await socialAuthService.authenticateWithLinkedIn(accessToken);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      message: result.user.isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          picture: result.user.picture,
          role: result.user.role,
        },
        token: result.token,
        isNewUser: result.user.isNewUser,
      },
    });
  } catch (error) {
    console.error('LinkedIn authentication failed:', error);
    res.status(401).json({
      error: error instanceof Error ? error.message : 'LinkedIn authentication failed'
    });
  }
};

// Microsoft OAuth authentication
export const authenticateWithMicrosoft = async (req: Request, res: Response) => {
  try {
    const { accessToken } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        error: 'Access token is required'
      });
    }

    const result = await socialAuthService.authenticateWithMicrosoft(accessToken);

    // Set HTTP-only cookie for refresh token
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      message: result.user.isNewUser ? 'Account created successfully' : 'Login successful',
      data: {
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.user.name,
          picture: result.user.picture,
          role: result.user.role,
        },
        token: result.token,
        isNewUser: result.user.isNewUser,
      },
    });
  } catch (error) {
    console.error('Microsoft authentication failed:', error);
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Microsoft authentication failed'
    });
  }
};

// Get social login URLs
export const getSocialLoginUrls = async (req: Request, res: Response) => {
  try {
    const urls = socialAuthService.getSocialLoginUrls();

    res.json({
      success: true,
      data: urls,
    });
  } catch (error) {
    console.error('Failed to get social login URLs:', error);
    res.status(500).json({
      error: 'Failed to get social login URLs'
    });
  }
};

// Refresh access token
export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'Refresh token not found'
      });
    }

    const result = await socialAuthService.refreshAccessToken(refreshToken);

    // Update refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    res.json({
      success: true,
      data: {
        token: result.token,
      },
    });
  } catch (error) {
    console.error('Token refresh failed:', error);
    res.status(401).json({
      error: 'Token refresh failed'
    });
  }
};

// Link social account to existing user
export const linkSocialAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { provider, accessToken } = req.body;
    const userId = req.user!.id;

    if (!provider || !accessToken) {
      return res.status(400).json({
        error: 'Provider and access token are required'
      });
    }

    if (!['google', 'linkedin', 'microsoft'].includes(provider.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid provider. Must be google, linkedin, or microsoft'
      });
    }

    await socialAuthService.linkSocialAccount(userId, provider, accessToken);

    res.json({
      success: true,
      message: `${provider} account linked successfully`,
    });
  } catch (error) {
    console.error('Failed to link social account:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to link social account'
    });
  }
};

// Unlink social account
export const unlinkSocialAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { provider } = req.params;
    const userId = req.user!.id;

    if (!['google', 'linkedin', 'microsoft'].includes(provider.toLowerCase())) {
      return res.status(400).json({
        error: 'Invalid provider. Must be google, linkedin, or microsoft'
      });
    }

    await socialAuthService.unlinkSocialAccount(userId, provider);

    res.json({
      success: true,
      message: `${provider} account unlinked successfully`,
    });
  } catch (error) {
    console.error('Failed to unlink social account:', error);
    res.status(400).json({
      error: error instanceof Error ? error.message : 'Failed to unlink social account'
    });
  }
};

// Logout (clear refresh token)
export const logout = async (req: Request, res: Response) => {
  try {
    // Clear refresh token cookie
    res.clearCookie('refreshToken');

    res.json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout failed:', error);
    res.status(500).json({
      error: 'Logout failed'
    });
  }
};