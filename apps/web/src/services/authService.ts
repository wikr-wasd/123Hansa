import axios, { AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://123hansa.vercel.app/api';

// API Response types
interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

// Auth types
interface AdminProfile {
  id: string;
  role: 'SUPER_ADMIN' | 'CONTENT_MODERATOR' | 'CUSTOMER_SUPPORT' | 'FINANCIAL_ADMIN' | 'ANALYTICS_TEAM';
  permissions: any;
  isActive: boolean;
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  country: 'SE' | 'NO' | 'DK';
  language: 'sv' | 'no' | 'da' | 'en';
  role: 'USER' | 'ADMIN' | 'MODERATOR';
  verificationLevel: 'NONE' | 'EMAIL' | 'PHONE' | 'BANKID';
  isEmailVerified: boolean;
  createdAt: string;
  adminProfile?: AdminProfile;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country: 'SE' | 'NO' | 'DK';
  language: 'sv' | 'no' | 'da' | 'en';
  companyName?: string;
  acceptTerms: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const response = await authService.refreshToken(refreshToken);
          localStorage.setItem('accessToken', response.accessToken);
          localStorage.setItem('refreshToken', response.refreshToken);
          
          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${response.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        authService.logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/register', data);
      
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        
        return authData;
      }
      
      throw new Error(response.data.message || 'Registration failed');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Registration failed');
    }
  },

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/login', data);
      
      if (response.data.success && response.data.data) {
        const authData = response.data.data;
        
        // Store tokens
        localStorage.setItem('accessToken', authData.accessToken);
        localStorage.setItem('refreshToken', authData.refreshToken);
        
        return authData;
      }
      
      throw new Error(response.data.message || 'Login failed');
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error.message || 'Login failed');
    }
  },

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  },

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    try {
      const response: AxiosResponse<ApiResponse<AuthResponse>> = await api.post('/auth/refresh', {
        refreshToken,
      });
      
      if (response.data.success && response.data.data) {
        return {
          accessToken: response.data.data.accessToken,
          refreshToken: response.data.data.refreshToken,
          expiresIn: response.data.data.expiresIn,
        };
      }
      
      throw new Error(response.data.message || 'Token refresh failed');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response: AxiosResponse<ApiResponse<{ user: User }>> = await api.get('/auth/me');
      
      if (response.data.success && response.data.data?.user) {
        return response.data.data.user;
      }
      
      throw new Error(response.data.message || 'Failed to get user profile');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to get user profile');
    }
  },

  /**
   * Check authentication status
   */
  async checkAuthStatus(): Promise<{ isAuthenticated: boolean; user: User | null }> {
    try {
      const response: AxiosResponse<ApiResponse<{ isAuthenticated: boolean; user: User | null }>> = 
        await api.get('/auth/status');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }
      
      return { isAuthenticated: false, user: null };
    } catch (error) {
      return { isAuthenticated: false, user: null };
    }
  },

  /**
   * Change password
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
        confirmPassword: newPassword,
      });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password change failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password change failed');
    }
  },

  /**
   * Verify email
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/verify-email', { token });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Email verification failed');
    }
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<void> {
    try {
      const response: AxiosResponse<ApiResponse> = await api.post('/auth/forgot-password', { email });
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Password reset request failed');
      }
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Password reset request failed');
    }
  },

  /**
   * Get stored access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  },

  /**
   * Get stored refresh token
   */
  getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },
};

export type { User, AdminProfile, RegisterRequest, LoginRequest, AuthResponse };