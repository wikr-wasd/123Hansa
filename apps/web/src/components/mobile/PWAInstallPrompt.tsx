import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { useDeviceDetection, supportsPWAInstall, isInstalledPWA } from '../../utils/deviceDetection';

interface PWAInstallPromptProps {
  className?: string;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({ className = '' }) => {
  const { isMobile, isTablet } = useDeviceDetection();
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isAppInstalled, setIsAppInstalled] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    setIsAppInstalled(isInstalledPWA());

    // Don't show on desktop or if already installed
    if (!isMobile && !isTablet || isInstalledPWA()) return;

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show our custom prompt after a delay
      setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Show after 10 seconds
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Listen for successful app install
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [isMobile, isTablet]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // Fallback for iOS Safari and other browsers
      setShowPrompt(false);
      return;
    }

    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    // Clear the deferredPrompt
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if not mobile/tablet, already installed, or user dismissed
  if (!isMobile && !isTablet || isAppInstalled || !showPrompt || !supportsPWAInstall()) {
    return null;
  }

  // Check if user already dismissed in this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className={`fixed bottom-20 left-4 right-4 z-40 ${className}`}>
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 mx-auto max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <Smartphone className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-sm">Installera 123hansa</h3>
              <p className="text-xs text-gray-600">Som app på din telefon</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        
        <p className="text-xs text-gray-600 mb-4">
          Få snabbare åtkomst, offline-funktioner och en bättre upplevelse!
        </p>
        
        <div className="flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 flex items-center justify-center"
          >
            <Download className="w-4 h-4 mr-2" />
            Installera
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-gray-600 text-sm font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Inte nu
          </button>
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;