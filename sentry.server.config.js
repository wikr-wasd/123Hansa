import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  beforeSend(event, hint) {
    // Filter out development errors
    if (process.env.NODE_ENV === 'development' && event.request?.url?.includes('localhost')) {
      return null;
    }
    return event;
  },
});