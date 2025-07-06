import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

import { config } from '@/config/app';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { errorHandler } from '@/middleware/errorHandler';
import { requestLogger } from '@/middleware/requestLogger';
import { initializeSocketService } from '@/services/socketService';
import { performanceService } from '@/services/performanceService';
import { cacheService } from '@/services/cacheService';
import { applySecurity } from '@/middleware/security';
import security, { 
  generalLimiter,
  speedLimiter,
  securityHeaders,
  sanitizeInput,
  generateCSRFToken,
  securityLogger
} from '@/middleware/security';
import { ddosProtectionMiddleware } from '@/middleware/ddosProtection';

// Route imports
import authRoutes from '@/routes/auth';
import userRoutes from '@/routes/users';
import listingRoutes from '@/routes/listings';
import messageRoutes from '@/routes/messages';
// import paymentRoutes from '@/routes/payments';
// import professionalRoutes from '@/routes/professionals';
// import consultationRoutes from '@/routes/consultations';
// import webhookRoutes from '@/routes/webhooks';
// import complianceRoutes from '@/routes/compliance';
// import kycAmlRoutes from '@/routes/kyc-aml';
// import analyticsRoutes from '@/routes/analytics';
import adminRoutes from '@/routes/admin';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
  },
});

// Trust proxy (for accurate IP detection behind load balancers)
app.set('trust proxy', 1);

// Session configuration
app.use(session({
  name: 'hansa.sid',
  secret: config.jwtSecret,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: config.databaseUrl,
    ttl: 24 * 60 * 60 // 24 hours
  }),
  cookie: {
    secure: config.nodeEnv === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// Security middleware (ORDER MATTERS!)
app.use(securityLogger); // Log all requests
app.use(ddosProtectionMiddleware); // DDoS protection first
app.use(speedLimiter); // Speed limiting
app.use(generalLimiter); // General rate limiting
app.use(securityHeaders); // Security headers
app.use(compression()); // Compression
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
}));

// Body parsing with size limits
app.use(express.json({ 
  limit: '2mb',
  verify: (req, res, buf, encoding) => {
    // Verify JSON payload isn't malicious
    try {
      JSON.parse(buf.toString());
    } catch (e) {
      throw new Error('Invalid JSON payload');
    }
  }
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '2mb',
  parameterLimit: 50 // Limit number of parameters
}));

// Input sanitization
app.use(sanitizeInput);

// CSRF token generation
app.use(generateCSRFToken);

// Request logging and performance monitoring
app.use(requestLogger);
app.use(performanceService.middleware());

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: '123hansa API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to 123hansa.se - Swedish Business Marketplace API',
    security: {
      ddosProtection: 'enabled',
      rateLimiting: 'enabled',
      csrfProtection: 'enabled',
      inputSanitization: 'enabled',
      securityHeaders: 'enabled'
    },
    endpoints: {
      health: '/health',
      security: '/security-status',
      csrfToken: '/csrf-token',
      admin: '/api/admin',
      auth: '/api/auth',
      users: '/api/users',
      listings: '/api/listings',
      messages: '/api/messages',
      payments: '/api/payments',
      professionals: '/api/professionals',
      consultations: '/api/consultations',
      webhooks: '/api/webhooks',
      compliance: '/api/compliance',
      'kyc-aml': '/api/kyc-aml',
      analytics: '/api/analytics'
    },
    timestamp: new Date().toISOString(),
  });
});

// CSRF Token endpoint
app.get('/csrf-token', (req, res) => {
  res.json({
    csrfToken: res.locals.csrfToken,
    message: 'CSRF token generated successfully'
  });
});

// Security status endpoint
app.get('/security-status', (req, res) => {
  try {
    const ddosStats = require('@/middleware/ddosProtection').getDDoSStats();
    const bannedIPs = require('@/middleware/ddosProtection').getBannedIPs();
    
    res.json({
      status: 'secure',
      timestamp: new Date().toISOString(),
      protections: {
        ddosProtection: {
          enabled: true,
          stats: ddosStats,
          bannedIPs: bannedIPs.length
        },
        rateLimiting: {
          enabled: true,
          generalLimit: '100 requests per 15 minutes',
          authLimit: '5 attempts per 15 minutes',
          paymentLimit: '10 attempts per hour'
        },
        csrfProtection: {
          enabled: true,
          tokenGenerated: !!res.locals.csrfToken
        },
        inputSanitization: {
          enabled: true,
          htmlStripping: true,
          xssProtection: true
        },
        securityHeaders: {
          enabled: true,
          hsts: true,
          csp: true,
          frameOptions: true
        },
        sessionSecurity: {
          enabled: true,
          httpOnly: true,
          secure: config.nodeEnv === 'production',
          sameSite: 'strict'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Could not retrieve security status'
    });
  }
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const health = await performanceService.getSystemHealth();
    res.status(health.status === 'critical' ? 503 : 200).json(health);
  } catch (error) {
    res.status(503).json({
      status: 'critical',
      timestamp: new Date().toISOString(),
      error: 'Health check failed',
    });
  }
});

// Performance metrics endpoint for monitoring
app.get('/metrics', async (req, res) => {
  try {
    const timeframe = req.query.timeframe as '1h' | '24h' | '7d' | '30d' || '24h';
    const analytics = await performanceService.getPerformanceAnalytics(timeframe);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get metrics' });
  }
});

// Sitemap for SEO
app.get('/sitemap', async (req, res) => {
  try {
    // Cache sitemap for 24 hours
    const sitemap = await cacheService.getOrSet(
      'sitemap',
      async () => {
        // Generate sitemap XML here
        return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://123hansa.se/</loc><changefreq>daily</changefreq></url>
  <url><loc>https://123hansa.se/listings</loc><changefreq>hourly</changefreq></url>
</urlset>`;
      },
      { ttl: 86400, json: false }
    );
    
    res.setHeader('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    res.status(500).send('Error generating sitemap');
  }
});

// Robots.txt
app.get('/robots', (req, res) => {
  res.setHeader('Content-Type', 'text/plain');
  res.send(`User-agent: *
Allow: /
Sitemap: https://123hansa.se/sitemap.xml`);
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/messages', messageRoutes);
// app.use('/api/payments', paymentRoutes);
// app.use('/api/professionals', professionalRoutes);
// app.use('/api/consultations', consultationRoutes);
// app.use('/api/webhooks', webhookRoutes);
// app.use('/api/compliance', complianceRoutes);
// app.use('/api/kyc-aml', kycAmlRoutes);
// app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

// Initialize Socket.IO service for real-time messaging
initializeSocketService(io);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

async function startServer() {
  try {
    // Connect to databases
    await connectDatabase();
    // await connectRedis(); // Disabled for CMS testing
    
    // Start server
    const PORT = config.port || 3001;
    httpServer.listen(PORT, () => {
      logger.info(`🚀 123hansa API Server running on port ${PORT}`);
      logger.info(`📊 Environment: ${config.nodeEnv}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('Received SIGTERM, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('Received SIGINT, shutting down gracefully');
  httpServer.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start the server
startServer();

export { app, io };