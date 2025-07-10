import * as Sentry from '@sentry/react';

Sentry.init({
  dsn: process.env.VITE_SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysOnErrorSampleRate: 1.0,
  beforeSend(event, hint) {
    // Filter out localhost errors in development
    if (process.env.NODE_ENV === 'development' && event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },
});