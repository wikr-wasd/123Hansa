import { z } from 'zod';

// Email validation with Nordic domain support
const emailSchema = z.string()
  .email('Invalid email format')
  .min(5, 'Email must be at least 5 characters')
  .max(255, 'Email must be less than 255 characters')
  .transform(email => email.toLowerCase().trim());

// Password validation
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password must be less than 128 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/\d/, 'Password must contain at least one number')
  .regex(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/, 'Password must contain at least one special character');

// Nordic phone number validation
const phoneSchema = z.string()
  .regex(/^\+?(46|47|45)[0-9]{8,10}$/, 'Invalid Nordic phone number format')
  .optional();

// Registration validation schema
export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-ZäöåÄÖÅæøÆØéÉüÜ\s-']+$/, 'First name contains invalid characters'),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-ZäöåÄÖÅæøÆØéÉüÜ\s-']+$/, 'Last name contains invalid characters'),
  phone: phoneSchema,
  country: z.enum(['SE', 'NO', 'DK'], {
    errorMap: () => ({ message: 'Country must be SE, NO, or DK' })
  }),
  language: z.enum(['sv', 'no', 'da', 'en'], {
    errorMap: () => ({ message: 'Language must be sv, no, da, or en' })
  }).default('sv'),
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  acceptTerms: z.boolean()
    .refine(val => val === true, 'You must accept the terms and conditions'),
});

// Login validation schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional().default(false),
});

// Forgot password validation schema
export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

// Reset password validation schema
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Change password validation schema
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Refresh token validation schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// Email verification schema
export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

// Update profile schema
export const updateProfileSchema = z.object({
  firstName: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .regex(/^[a-zA-ZäöåÄÖÅæøÆØéÉüÜ\s-']+$/, 'First name contains invalid characters')
    .optional(),
  lastName: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .regex(/^[a-zA-ZäöåÄÖÅæøÆØéÉüÜ\s-']+$/, 'Last name contains invalid characters')
    .optional(),
  phone: phoneSchema,
  bio: z.string()
    .max(500, 'Bio must be less than 500 characters')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional()
    .or(z.literal('')),
  linkedinProfile: z.string()
    .url('Invalid LinkedIn URL')
    .optional()
    .or(z.literal('')),
  companyName: z.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  companyRegistration: z.string()
    .max(50, 'Company registration must be less than 50 characters')
    .optional()
    .or(z.literal('')),
  vatNumber: z.string()
    .max(50, 'VAT number must be less than 50 characters')
    .optional()
    .or(z.literal('')),
});

// Type exports
export type RegisterRequest = z.infer<typeof registerSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;
export type ForgotPasswordRequest = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordRequest = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordRequest = z.infer<typeof changePasswordSchema>;
export type RefreshTokenRequest = z.infer<typeof refreshTokenSchema>;
export type VerifyEmailRequest = z.infer<typeof verifyEmailSchema>;
export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;