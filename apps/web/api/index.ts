import { VercelRequest, VercelResponse } from '@vercel/node';
import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import { config } from '../../api/src/config/app';
import { connectDatabase } from '../../api/src/config/database';
import { logger } from '../../api/src/utils/logger';
import { errorHandler } from '../../api/src/middleware/errorHandler';
import { requestLogger } from '../../api/src/middleware/requestLogger';
import { applySecurity } from '../../api/src/middleware/security';

// Route imports
import authRoutes from '../../api/src/routes/auth';
import userRoutes from '../../api/src/routes/users';
import listingRoutes from '../../api/src/routes/listings';
import messageRoutes from '../../api/src/routes/messages';
import adminRoutes from '../../api/src/routes/admin';

// Create express app
const app = express();

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
  origin: '*',
  credentials: true,
}));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
app.use(applySecurity);

// Root endpoint
app.get('/', (req, res) => {
  res.status(200).json({
    name: '123hansa API',
    version: '1.0.0',
    status: 'running',
    message: 'Welcome to 123hansa.se - Swedish Business Marketplace API',
    timestamp: new Date().toISOString(),
  });
});

// Health check endpoint
app.get('/health', async (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: 'production'
  });
});

// API routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/listings', listingRoutes);
app.use('/messages', messageRoutes);
app.use('/admin', adminRoutes);

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Initialize database connection (only once)
let isConnected = false;

async function initializeDatabase() {
  if (!isConnected) {
    try {
      await connectDatabase();
      isConnected = true;
      logger.info('✅ Database connected for Vercel function');
    } catch (error) {
      logger.error('Failed to connect database:', error);
    }
  }
}

// Vercel handler function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Initialize database if not connected
  await initializeDatabase();
  
  // Use express app to handle the request
  return app(req, res);
}