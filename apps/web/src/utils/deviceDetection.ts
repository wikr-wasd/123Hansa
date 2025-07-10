import { useState, useEffect } from 'react';

export interface DeviceInfo {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  screenWidth: number;
  screenHeight: number;
  touchSupport: boolean;
  userAgent: string;
}

// Device detection utility functions
export const detectDevice = (): DeviceInfo => {
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const screenHeight = typeof window !== 'undefined' ? window.innerHeight : 1080;
  const touchSupport = typeof window !== 'undefined' && 'ontouchstart' in window;

  // Mobile device patterns
  const mobilePatterns = [
    /Android/i,
    /webOS/i,
    /iPhone/i,
    /iPad/i,
    /iPod/i,
    /BlackBerry/i,
    /Windows Phone/i,
    /Mobile/i
  ];

  // Tablet-specific patterns
  const tabletPatterns = [
    /iPad/i,
    /Android(?=.*Tablet)/i,
    /Android(?=.*(?:Tab|Pad))/i,
    /Tablet/i
  ];

  const isMobileDevice = mobilePatterns.some(pattern => pattern.test(userAgent));
  const isTabletDevice = tabletPatterns.some(pattern => pattern.test(userAgent));
  
  // Screen size based detection (fallback)
  const isMobileScreen = screenWidth <= 768;
  const isTabletScreen = screenWidth > 768 && screenWidth <= 1024;
  const isDesktopScreen = screenWidth > 1024;

  // Combine user agent and screen size detection
  const isMobile = (isMobileDevice && !isTabletDevice) || (isMobileScreen && !isTabletDevice);
  const isTablet = isTabletDevice || (isTabletScreen && touchSupport);
  const isDesktop = !isMobile && !isTablet;

  return {
    isMobile,
    isTablet,
    isDesktop,
    screenWidth,
    screenHeight,
    touchSupport,
    userAgent
  };
};

// React hook for device detection with reactive updates
export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => detectDevice());

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(detectDevice());
    };

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return deviceInfo;
};

// Utility functions for specific checks
export const isMobileDevice = (): boolean => detectDevice().isMobile;
export const isTabletDevice = (): boolean => detectDevice().isTablet;
export const isDesktopDevice = (): boolean => detectDevice().isDesktop;
export const isMobileOrTablet = (): boolean => {
  const device = detectDevice();
  return device.isMobile || device.isTablet;
};

// Check if device supports PWA installation
export const supportsPWAInstall = (): boolean => {
  return typeof window !== 'undefined' && (
    'serviceWorker' in navigator ||
    'standalone' in window.navigator ||
    window.matchMedia('(display-mode: standalone)').matches
  );
};

// Check if already installed as PWA
export const isInstalledPWA = (): boolean => {
  return typeof window !== 'undefined' && (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
};