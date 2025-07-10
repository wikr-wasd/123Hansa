import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useDeviceDetection } from '../utils/deviceDetection';

interface AuthGateOptions {
  redirectTo?: string;
  showModal?: boolean;
  requireAuth?: boolean;
  mobileOnly?: boolean;
}

interface AuthGateHook {
  checkAuth: (action: () => void, options?: AuthGateOptions) => void;
  isAuthModalOpen: boolean;
  closeAuthModal: () => void;
  openAuthModal: () => void;
  authModalType: 'login' | 'register';
  setAuthModalType: (type: 'login' | 'register') => void;
}

export const useAuthGate = (): AuthGateHook => {
  const { isAuthenticated } = useAuthStore();
  const { isMobile, isTablet } = useDeviceDetection();
  const navigate = useNavigate();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalType, setAuthModalType] = useState<'login' | 'register'>('login');

  const openAuthModal = useCallback(() => {
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const checkAuth = useCallback((
    action: () => void, 
    options: AuthGateOptions = {}
  ) => {
    const {
      redirectTo = '/login',
      showModal = true,
      requireAuth = true,
      mobileOnly = false
    } = options;

    // If mobileOnly is true and not on mobile/tablet, allow action
    if (mobileOnly && !isMobile && !isTablet) {
      action();
      return;
    }

    // If auth is not required, always allow action
    if (!requireAuth) {
      action();
      return;
    }

    // If user is authenticated, allow action
    if (isAuthenticated) {
      action();
      return;
    }

    // User is not authenticated, handle based on device and preferences
    if ((isMobile || isTablet) && showModal) {
      // On mobile/tablet, show modal by default
      openAuthModal();
    } else {
      // On desktop or when modal is disabled, redirect
      navigate(redirectTo);
    }
  }, [isAuthenticated, isMobile, isTablet, navigate, openAuthModal]);

  return {
    checkAuth,
    isAuthModalOpen,
    closeAuthModal,
    openAuthModal,
    authModalType,
    setAuthModalType
  };
};

// Hook specifically for "Show Interest" actions on listings
export const useListingInterestAuthGate = () => {
  const authGate = useAuthGate();
  const { isMobile, isTablet } = useDeviceDetection();

  const handleShowInterest = useCallback((
    listingId: string,
    onSuccess?: () => void
  ) => {
    authGate.checkAuth(
      () => {
        // User is authenticated, proceed with showing interest
        console.log(`Showing interest in listing ${listingId}`);
        if (onSuccess) onSuccess();
        
        // Here you would typically call an API to record the interest
        // Example: showInterestInListing(listingId);
      },
      {
        mobileOnly: true, // Only require auth on mobile/tablet
        showModal: isMobile || isTablet, // Show modal on mobile, redirect on desktop
        requireAuth: true
      }
    );
  }, [authGate, isMobile, isTablet]);

  return {
    ...authGate,
    handleShowInterest
  };
};

// Hook for contact seller actions
export const useContactSellerAuthGate = () => {
  const authGate = useAuthGate();
  const { isMobile, isTablet } = useDeviceDetection();

  const handleContactSeller = useCallback((
    listingId: string,
    sellerId: string,
    onSuccess?: () => void
  ) => {
    authGate.checkAuth(
      () => {
        // User is authenticated, proceed with contacting seller
        console.log(`Contacting seller for listing ${listingId}`);
        if (onSuccess) onSuccess();
        
        // Here you would typically open a contact modal or navigate to messages
        // Example: openContactModal(listingId, sellerId);
      },
      {
        mobileOnly: true, // Only require auth on mobile/tablet
        showModal: isMobile || isTablet,
        requireAuth: true
      }
    );
  }, [authGate, isMobile, isTablet]);

  return {
    ...authGate,
    handleContactSeller
  };
};

export default useAuthGate;