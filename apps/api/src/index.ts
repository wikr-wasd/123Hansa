import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
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

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});

// Global middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.stripe.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.123hansa.se", "wss://api.123hansa.se"],
    },
  },
}));
app.use(compression());
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(performanceService.middleware());
app.use(applySecurity);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: '123hansa API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to 123hansa.se - Swedish Business Marketplace API',
    endpoints: {
      health: '/health',
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