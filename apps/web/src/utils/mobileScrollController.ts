import { useEffect, useRef } from 'react';
import { detectDevice } from './deviceDetection';

// Scroll position manager for mobile
class MobileScrollController {
  private static instance: MobileScrollController;
  private scrollPositions: Map<string, number> = new Map();
  private preventAutoScroll: boolean = false;
  
  private constructor() {
    this.setupScrollListener();
  }
  
  public static getInstance(): MobileScrollController {
    if (!MobileScrollController.instance) {
      MobileScrollController.instance = new MobileScrollController();
    }
    return MobileScrollController.instance;
  }
  
  private setupScrollListener() {
    if (typeof window === 'undefined') return;
    
    const device = detectDevice();
    if (!device.isMobile && !device.isTablet) return;
    
    // Prevent automatic scrolling on page load
    window.addEventListener('beforeunload', () => {
      this.saveScrollPosition(window.location.pathname);
    });
    
    // Handle scroll restoration
    window.addEventListener('load', () => {
      if (this.preventAutoScroll) {
        window.scrollTo(0, 0);
        this.preventAutoScroll = false;
      }
    });
  }
  
  public saveScrollPosition(path: string): void {
    this.scrollPositions.set(path, window.scrollY);
  }
  
  public restoreScrollPosition(path: string): void {
    const position = this.scrollPositions.get(path) || 0;
    window.scrollTo(0, position);
  }
  
  public preventNextAutoScroll(): void {
    this.preventAutoScroll = true;
  }
  
  public smoothScrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
  
  public smoothScrollToElement(elementId: string): void {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }
  
  public disableScroll(): void {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
  }
  
  public enableScroll(): void {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
  }
}

// React hook for mobile scroll control
export const useMobileScrollControl = () => {
  const controller = useRef(MobileScrollController.getInstance());
  const device = detectDevice();
  
  useEffect(() => {
    if (!device.isMobile && !device.isTablet) return;
    
    // Prevent auto-scroll to bottom on page load
    controller.current.preventNextAutoScroll();
    
    return () => {
      // Save scroll position when component unmounts
      controller.current.saveScrollPosition(window.location.pathname);
    };
  }, [device.isMobile, device.isTablet]);
  
  return {
    saveScrollPosition: (path: string) => controller.current.saveScrollPosition(path),
    restoreScrollPosition: (path: string) => controller.current.restoreScrollPosition(path),
    smoothScrollToTop: () => controller.current.smoothScrollToTop(),
    smoothScrollToElement: (id: string) => controller.current.smoothScrollToElement(id),
    disableScroll: () => controller.current.disableScroll(),
    enableScroll: () => controller.current.enableScroll(),
    isMobile: device.isMobile,
    isTablet: device.isTablet
  };
};

// Hook for preventing scroll on mobile when modals are open
export const useMobileModalScroll = (isOpen: boolean) => {
  const { disableScroll, enableScroll, isMobile, isTablet } = useMobileScrollControl();
  
  useEffect(() => {
    if (!isMobile && !isTablet) return;
    
    if (isOpen) {
      disableScroll();
    } else {
      enableScroll();
    }
    
    return () => {
      enableScroll();
    };
  }, [isOpen, disableScroll, enableScroll, isMobile, isTablet]);
};

// Hook for smooth scrolling on mobile
export const useMobileSmoothScroll = () => {
  const { smoothScrollToTop, smoothScrollToElement, isMobile, isTablet } = useMobileScrollControl();
  
  return {
    scrollToTop: smoothScrollToTop,
    scrollToElement: smoothScrollToElement,
    isMobileDevice: isMobile || isTablet
  };
};

export default MobileScrollController;