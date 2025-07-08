import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import AdvancedAdminPanel from './AdvancedAdminPanel';
import CustomerAdminPanel from './CustomerAdminPanel';

type UserType = 'admin' | 'customer';

interface AuthState {
  isAuthenticated: boolean;
  userType: UserType | null;
  userId: string | null;
}

const AuthenticatedAdminWrapper: React.FC = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    userType: null,
    userId: null
  });

  // Restore authentication state from localStorage on component mount
  useEffect(() => {
    const savedAuthState = localStorage.getItem('adminAuthState');
    if (savedAuthState) {
      try {
        const parsedState = JSON.parse(savedAuthState);
        setAuthState(parsedState);
      } catch (error) {
        console.error('Failed to parse saved auth state:', error);
        localStorage.removeItem('adminAuthState');
      }
    }
  }, []);

  const handleLogin = (userType: UserType, userId?: string) => {
    const newAuthState = {
      isAuthenticated: true,
      userType,
      userId: userId || null
    };
    setAuthState(newAuthState);
    // Save to localStorage for persistence across browser navigation
    localStorage.setItem('adminAuthState', JSON.stringify(newAuthState));
  };

  const handleLogout = () => {
    const newAuthState = {
      isAuthenticated: false,
      userType: null,
      userId: null
    };
    setAuthState(newAuthState);
    // Clear all authentication data from localStorage on logout
    localStorage.removeItem('adminAuthState');
    localStorage.removeItem('loginAttempts');
    localStorage.removeItem('lockoutEndTime');
    
    // Show logout confirmation
    console.log('User logged out successfully');
  };

  if (!authState.isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (authState.userType === 'admin') {
    return <AdvancedAdminPanel onLogout={handleLogout} />;
  }

  if (authState.userType === 'customer' && authState.userId) {
    return <CustomerAdminPanel customerId={authState.userId} onLogout={handleLogout} />;
  }

  // Fallback - should not reach here
  return <AdminLogin onLogin={handleLogin} />;
};

export default AuthenticatedAdminWrapper;