import React, { useState } from 'react';
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

  const handleLogin = (userType: UserType, userId?: string) => {
    setAuthState({
      isAuthenticated: true,
      userType,
      userId: userId || null
    });
  };

  const handleLogout = () => {
    setAuthState({
      isAuthenticated: false,
      userType: null,
      userId: null
    });
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