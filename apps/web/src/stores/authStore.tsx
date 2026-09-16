import React, { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import toast from 'react-hot-toast';
import { authService, type LoginRequest, type RegisterRequest, type User } from '../services/authService';
import { isSupabaseConfigured } from '../lib/supabase';

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

  // Sessionen ägs av Supabase-klienten, som håller den i localStorage och
  // förnyar tokenen själv. Vi speglar den bara.
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    let active = true;

    authService
      .getCurrentUser()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });

    const unsubscribe = authService.onAuthChange((next) => {
      if (active) setUser(next);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const login = useCallback(async (data: LoginRequest) => {
    setIsLoading(true);
    try {
      const loggedIn = await authService.login(data);
      setUser(loggedIn);
      toast.success('Välkommen tillbaka');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Inloggningen misslyckades');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const { user: created, needsConfirmation } = await authService.register(data);
      setUser(created);
      toast.success(
        needsConfirmation
          ? 'Kontot är skapat. Bekräfta din e-postadress för att logga in.'
          : 'Kontot är skapat'
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Registreringen misslyckades');
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      setUser(null);
      toast.success('Du är utloggad');
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await authService.getCurrentUser());
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      login,
      register,
      logout,
      refreshUser,
      setUser,
    }),
    [user, isLoading, login, register, logout, refreshUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthStore = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthStore måste användas inuti AuthProvider');
  }
  return context;
};
