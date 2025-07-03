import bcrypt from 'bcryptjs';
import { config } from '@/config/app';

export class PasswordService {
  /**
   * Hash a password using bcrypt
   */
  static async hash(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, config.bcryptRounds);
    } catch (error) {
      throw new Error('Password hashing failed');
    }
  }

  /**
   * Verify a password against its hash
   */
  static async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error('Password verification failed');
    }
  }

  /**
   * Validate password strength
   */
  static validatePassword(password: string): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Minimum length
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }

    // Maximum length for security
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters long');
    }

    // Must contain at least one uppercase letter
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }

    // Must contain at least one lowercase letter
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }

    // Must contain at least one number
    if (!/\d/.test(password)) {
      errors.push('Password must contain at least one number');
    }

    // Must contain at least one special character
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }

    // Common password patterns to avoid
    const commonPatterns = [
      /^password/i,
      /^123456/,
      /^qwerty/i,
      /^admin/i,
      /^welcome/i,
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        errors.push('Password is too common or predictable');
        break;
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Generate a secure random password
   */
  static generateSecurePassword(length: number = 16): string {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    
    return password;
  }
}