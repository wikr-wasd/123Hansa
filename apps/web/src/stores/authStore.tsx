import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User, RegisterRequest, LoginRequest } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      // Clear invalid tokens
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      setUser(response.user);
      toast.success('Inloggning lyckades!');
    } catch (error: any) {
      toast.error(error.message || 'Inloggning misslyckades');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      setUser(response.user);
      toast.success('Registrering lyckades! Välkommen till 123hansa!');
    } catch (error: any) {
      toast.error(error.message || 'Registrering misslyckades');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      toast.success('Du har loggats ut');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear local state
      setUser(null);
    }
  };

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      // If refresh fails, user might need to login again
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthStore = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
};