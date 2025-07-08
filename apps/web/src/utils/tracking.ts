// Tracking utility functions for analytics and conversion tracking

// Event types for tracking
export interface TrackingEvent {
  action: string;
  category: string;
  label?: string;
  value?: number;
  userId?: string;
  properties?: Record<string, any>;
}

// Business events
export interface BusinessEvent {
  eventType: 'view_listing' | 'contact_seller' | 'place_bid' | 'register' | 'login' | 'search' | 'filter';
  listingId?: string;
  category?: string;
  price?: number;
  location?: string;
  userId?: string;
  searchQuery?: string;
  filters?: Record<string, any>;
}

// CRM Integration
export interface CRMContact {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  company?: string;
  interests?: string[];
  source: string;
  listingId?: string;
  properties?: Record<string, any>;
}

// Track general events
export const trackEvent = (event: TrackingEvent) => {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
      user_id: event.userId,
      custom_parameters: event.properties,
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track(event.action, {
      category: event.category,
      label: event.label,
      value: event.value,
      ...event.properties,
    });
  }

  // LinkedIn Insight
  if (typeof window !== 'undefined' && (window as any).lintrk) {
    (window as any).lintrk('track', {
      conversion_id: import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID,
      event_type: event.action,
      value: event.value,
      ...event.properties,
    });
  }

  // Snapchat Pixel
  if (typeof window !== 'undefined' && (window as any).snaptr) {
    (window as any).snaptr('track', event.action.toUpperCase(), {
      value: event.value,
      currency: 'SEK',
      ...event.properties,
    });
  }

  // Twitter Pixel
  if (typeof window !== 'undefined' && (window as any).twq) {
    (window as any).twq('track', event.action, {
      value: event.value,
      ...event.properties,
    });
  }
};

// Track business-specific events
export const trackBusinessEvent = (event: BusinessEvent) => {
  const trackingEvent: TrackingEvent = {
    action: event.eventType,
    category: 'business',
    label: event.listingId || event.category,
    value: event.price,
    userId: event.userId,
    properties: {
      listing_id: event.listingId,
      category: event.category,
      location: event.location,
      search_query: event.searchQuery,
      filters: event.filters,
    },
  };

  trackEvent(trackingEvent);

  // Send to CRM if applicable
  if (event.eventType === 'contact_seller' || event.eventType === 'register') {
    // This would be handled by the contact form or registration form
    console.log('Business event tracked:', event);
  }
};

// Track page views
export const trackPageView = (path: string, title?: string) => {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID, {
      page_title: title || (typeof document !== 'undefined' ? document.title : ''),
      page_location: typeof window !== 'undefined' ? window.location.href : '',
      page_path: path,
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'PageView', {
      page_title: title || (typeof document !== 'undefined' ? document.title : ''),
      page_location: typeof window !== 'undefined' ? window.location.href : '',
    });
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.page();
  }

  // LinkedIn Insight
  if (typeof window !== 'undefined' && (window as any).lintrk) {
    (window as any).lintrk('track', { conversion_id: import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID });
  }

  // Snapchat Pixel
  if (typeof window !== 'undefined' && (window as any).snaptr) {
    (window as any).snaptr('track', 'PAGE_VIEW');
  }

  // Twitter Pixel
  if (typeof window !== 'undefined' && (window as any).twq) {
    (window as any).twq('track', 'PageView');
  }
};

// Track conversions
export const trackConversion = (conversionType: string, value?: number, currency = 'SEK') => {
  // Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'conversion', {
      send_to: import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID,
      value: value,
      currency: currency,
      transaction_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    });
  }

  // Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
  }

  // TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.track('CompletePayment', {
      value: value,
      currency: currency,
    });
  }

  // LinkedIn Insight
  if (typeof window !== 'undefined' && (window as any).lintrk) {
    (window as any).lintrk('track', {
      conversion_id: import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID,
      event_type: 'conversion',
      value: value,
    });
  }

  // Snapchat Pixel
  if (typeof window !== 'undefined' && (window as any).snaptr) {
    (window as any).snaptr('track', 'PURCHASE', {
      value: value,
      currency: currency,
    });
  }

  // Twitter Pixel
  if (typeof window !== 'undefined' && (window as any).twq) {
    (window as any).twq('track', 'Purchase', {
      value: value,
      currency: currency,
    });
  }
};

// CRM Integration functions
export const sendToCRM = async (contact: CRMContact, crmType: string = 'hubspot') => {
  try {
    const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' ? `${window.location.origin}/api` : '');
    
    const response = await fetch(`${API_URL}/crm/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contact,
        crmType,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send to CRM');
    }

    const result = await response.json();
    console.log('Contact sent to CRM:', result);
    return result;
  } catch (error) {
    console.error('Error sending to CRM:', error);
    throw error;
  }
};

// Track user registration
export const trackUserRegistration = (userId: string, method: string, email: string) => {
  trackEvent({
    action: 'sign_up',
    category: 'user',
    label: method,
    userId,
    properties: {
      method,
      email,
    },
  });

  // Send to CRM
  sendToCRM({
    email,
    source: 'website_registration',
    properties: {
      registration_method: method,
      user_id: userId,
    },
  }).catch(console.error);
};

// Track user login
export const trackUserLogin = (userId: string, method: string) => {
  trackEvent({
    action: 'login',
    category: 'user',
    label: method,
    userId,
    properties: {
      method,
    },
  });
};

// Track listing view
export const trackListingView = (listingId: string, category: string, price: number, userId?: string) => {
  trackBusinessEvent({
    eventType: 'view_listing',
    listingId,
    category,
    price,
    userId,
  });
};

// Track contact seller
export const trackContactSeller = (listingId: string, sellerId: string, userId?: string, email?: string) => {
  trackBusinessEvent({
    eventType: 'contact_seller',
    listingId,
    userId,
  });

  // Send to CRM if email provided
  if (email) {
    sendToCRM({
      email,
      source: 'listing_contact',
      listingId,
      properties: {
        seller_id: sellerId,
        user_id: userId,
      },
    }).catch(console.error);
  }
};

// Track search
export const trackSearch = (query: string, filters: Record<string, any>, userId?: string) => {
  trackBusinessEvent({
    eventType: 'search',
    searchQuery: query,
    filters,
    userId,
  });
};

// Track bid placement
export const trackBidPlacement = (listingId: string, bidAmount: number, userId?: string) => {
  trackBusinessEvent({
    eventType: 'place_bid',
    listingId,
    price: bidAmount,
    userId,
  });
};

// Initialize tracking for the current user
export const initializeUserTracking = (userId: string, email?: string) => {
  // Set user ID for Google Analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID, {
      user_id: userId,
    });
  }

  // Set user for Meta Pixel
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('init', import.meta.env.VITE_META_PIXEL_ID, {
      em: email, // hashed email
    });
  }

  // Set user for TikTok Pixel
  if (typeof window !== 'undefined' && (window as any).ttq) {
    (window as any).ttq.identify({
      email: email,
      external_id: userId,
    });
  }

  // Set user for Snapchat Pixel
  if (typeof window !== 'undefined' && (window as any).snaptr) {
    (window as any).snaptr('init', import.meta.env.VITE_SNAPCHAT_PIXEL_ID, {
      user_email: email,
    });
  }
};

// Debug tracking (for development)
export const debugTracking = () => {
  console.log('Tracking Debug Info:');
  console.log('Google Analytics:', !!(window as any).gtag);
  console.log('Meta Pixel:', !!(window as any).fbq);
  console.log('TikTok Pixel:', !!(window as any).ttq);
  console.log('LinkedIn Insight:', !!(window as any).lintrk);
  console.log('Snapchat Pixel:', !!(window as any).snaptr);
  console.log('Twitter Pixel:', !!(window as any).twq);
  console.log('Environment Variables:', {
    GA_ID: import.meta.env.VITE_GOOGLE_ANALYTICS_MEASUREMENT_ID,
    META_PIXEL: import.meta.env.VITE_META_PIXEL_ID,
    TIKTOK_PIXEL: import.meta.env.VITE_TIKTOK_PIXEL_ID,
    LINKEDIN_TAG: import.meta.env.VITE_LINKEDIN_INSIGHT_TAG_ID,
    SNAPCHAT_PIXEL: import.meta.env.VITE_SNAPCHAT_PIXEL_ID,
    TWITTER_PIXEL: import.meta.env.VITE_TWITTER_PIXEL_ID,
  });
};