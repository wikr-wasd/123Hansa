import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import axios from 'axios';

const prisma = new PrismaClient();

interface SocialProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'GOOGLE' | 'LINKEDIN' | 'MICROSOFT';
  verified?: boolean;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: string;
    isNewUser: boolean;
  };
  token: string;
  refreshToken: string;
}

class SocialAuthService {
  private jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
  private jwtRefreshSecret = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret';

  // Google OAuth integration
  async authenticateWithGoogle(accessToken: string): Promise<AuthResult> {
    try {
      // Verify Google access token and get user profile
      const profile = await this.getGoogleProfile(accessToken);
      
      // Find or create user
      const authResult = await this.findOrCreateUser(profile);
      
      return authResult;
    } catch (error) {
      console.error('Google authentication failed:', error);
      throw new Error('Google authentication failed');
    }
  }

  // LinkedIn OAuth integration
  async authenticateWithLinkedIn(accessToken: string): Promise<AuthResult> {
    try {
      // Verify LinkedIn access token and get user profile
      const profile = await this.getLinkedInProfile(accessToken);
      
      // Find or create user
      const authResult = await this.findOrCreateUser(profile);
      
      return authResult;
    } catch (error) {
      console.error('LinkedIn authentication failed:', error);
      throw new Error('LinkedIn authentication failed');
    }
  }

  // Microsoft OAuth integration
  async authenticateWithMicrosoft(accessToken: string): Promise<AuthResult> {
    try {
      // Verify Microsoft access token and get user profile
      const profile = await this.getMicrosoftProfile(accessToken);
      
      // Find or create user
      const authResult = await this.findOrCreateUser(profile);
      
      return authResult;
    } catch (error) {
      console.error('Microsoft authentication failed:', error);
      throw new Error('Microsoft authentication failed');
    }
  }

  // Get Google user profile
  private async getGoogleProfile(accessToken: string): Promise<SocialProfile> {
    try {
      const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const { id, email, name, picture, verified_email } = response.data;

      return {
        id,
        email,
        name,
        picture,
        provider: 'GOOGLE',
        verified: verified_email,
      };
    } catch (error) {
      console.error('Failed to get Google profile:', error);
      throw new Error('Invalid Google access token');
    }
  }

  // Get LinkedIn user profile
  private async getLinkedInProfile(accessToken: string): Promise<SocialProfile> {
    try {
      // Get basic profile
      const profileResponse = await axios.get('https://api.linkedin.com/v2/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      // Get email address
      const emailResponse = await axios.get('https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const { id, localizedFirstName, localizedLastName, profilePicture } = profileResponse.data;
      const email = emailResponse.data.elements?.[0]?.['handle~']?.emailAddress;

      if (!email) {
        throw new Error('Email not available from LinkedIn');
      }

      return {
        id,
        email,
        name: `${localizedFirstName} ${localizedLastName}`,
        picture: profilePicture?.displayImage?.elements?.[0]?.identifiers?.[0]?.identifier,
        provider: 'LINKEDIN',
        verified: true, // LinkedIn emails are typically verified
      };
    } catch (error) {
      console.error('Failed to get LinkedIn profile:', error);
      throw new Error('Invalid LinkedIn access token');
    }
  }

  // Get Microsoft user profile
  private async getMicrosoftProfile(accessToken: string): Promise<SocialProfile> {
    try {
      const response = await axios.get('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const { id, mail, displayName, userPrincipalName } = response.data;
      const email = mail || userPrincipalName;

      if (!email) {
        throw new Error('Email not available from Microsoft');
      }

      return {
        id,
        email,
        name: displayName,
        provider: 'MICROSOFT',
        verified: true, // Microsoft emails are typically verified
      };
    } catch (error) {
      console.error('Failed to get Microsoft profile:', error);
      throw new Error('Invalid Microsoft access token');
    }
  }

  // Find or create user based on social profile
  private async findOrCreateUser(profile: SocialProfile): Promise<AuthResult> {
    try {
      let user;
      let isNewUser = false;

      // Check if user exists by email
      user = await prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (!user) {
        // Create new user
        user = await prisma.user.create({
          data: {
            email: profile.email,
            name: profile.name,
            profilePicture: profile.picture,
            emailVerified: profile.verified ? new Date() : null,
            role: 'USER',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        });
        isNewUser = true;
      } else {
        // Update existing user with latest info from social provider
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            name: profile.name,
            profilePicture: profile.picture || user.profilePicture,
            emailVerified: profile.verified && !user.emailVerified ? new Date() : user.emailVerified,
            updatedAt: new Date(),
          },
        });
      }

      // Create or update social account record
      await prisma.socialAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: profile.provider,
            providerAccountId: profile.id,
          },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          userId: user.id,
          provider: profile.provider,
          providerAccountId: profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      // Generate JWT tokens
      const token = this.generateAccessToken(user);
      const refreshToken = this.generateRefreshToken(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.profilePicture,
          role: user.role,
          isNewUser,
        },
        token,
        refreshToken,
      };
    } catch (error) {
      console.error('Failed to find or create user:', error);
      throw new Error('User creation failed');
    }
  }

  // Generate access token
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      this.jwtSecret,
      { expiresIn: '1h' }
    );
  }

  // Generate refresh token
  private generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        type: 'refresh',
      },
      this.jwtRefreshSecret,
      { expiresIn: '30d' }
    );
  }

  // Refresh access token
  async refreshAccessToken(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    try {
      const decoded = jwt.verify(refreshToken, this.jwtRefreshSecret) as any;
      
      if (decoded.type !== 'refresh') {
        throw new Error('Invalid refresh token');
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        throw new Error('User not found');
      }

      const newToken = this.generateAccessToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        token: newToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      console.error('Token refresh failed:', error);
      throw new Error('Token refresh failed');
    }
  }

  // Get social login URLs for frontend
  getSocialLoginUrls(): {
    google: string;
    linkedin: string;
    microsoft: string;
  } {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    return {
      google: `https://accounts.google.com/oauth/authorize?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${baseUrl}/auth/callback/google&response_type=code&scope=openid email profile`,
      linkedin: `https://www.linkedin.com/oauth/v2/authorization?client_id=${process.env.LINKEDIN_CLIENT_ID}&redirect_uri=${baseUrl}/auth/callback/linkedin&response_type=code&scope=r_liteprofile r_emailaddress`,
      microsoft: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=${process.env.MICROSOFT_CLIENT_ID}&redirect_uri=${baseUrl}/auth/callback/microsoft&response_type=code&scope=openid email profile`,
    };
  }

  // Link social account to existing user
  async linkSocialAccount(userId: string, provider: string, accessToken: string): Promise<void> {
    try {
      let profile: SocialProfile;

      switch (provider.toUpperCase()) {
        case 'GOOGLE':
          profile = await this.getGoogleProfile(accessToken);
          break;
        case 'LINKEDIN':
          profile = await this.getLinkedInProfile(accessToken);
          break;
        case 'MICROSOFT':
          profile = await this.getMicrosoftProfile(accessToken);
          break;
        default:
          throw new Error('Unsupported provider');
      }

      // Check if social account is already linked to another user
      const existingSocialAccount = await prisma.socialAccount.findUnique({
        where: {
          provider_providerAccountId: {
            provider: profile.provider,
            providerAccountId: profile.id,
          },
        },
      });

      if (existingSocialAccount && existingSocialAccount.userId !== userId) {
        throw new Error('This social account is already linked to another user');
      }

      // Create social account link
      await prisma.socialAccount.upsert({
        where: {
          provider_providerAccountId: {
            provider: profile.provider,
            providerAccountId: profile.id,
          },
        },
        update: {
          updatedAt: new Date(),
        },
        create: {
          userId,
          provider: profile.provider,
          providerAccountId: profile.id,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    } catch (error) {
      console.error('Failed to link social account:', error);
      throw new Error('Failed to link social account');
    }
  }

  // Unlink social account
  async unlinkSocialAccount(userId: string, provider: string): Promise<void> {
    try {
      // Check if user has other login methods
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          socialAccounts: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      // Ensure user has password or other social accounts
      if (!user.hashedPassword && user.socialAccounts.length <= 1) {
        throw new Error('Cannot unlink the only authentication method. Please set a password first.');
      }

      // Remove social account
      await prisma.socialAccount.deleteMany({
        where: {
          userId,
          provider: provider.toUpperCase(),
        },
      });
    } catch (error) {
      console.error('Failed to unlink social account:', error);
      throw new Error('Failed to unlink social account');
    }
  }
}

export { SocialAuthService, SocialProfile, AuthResult };