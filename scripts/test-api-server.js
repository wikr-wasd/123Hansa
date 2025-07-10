/**
 * Simple Test API Server
 * Runs basic API endpoints for testing without full database setup
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
}));

app.use(express.json());

// Health endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: '123hansa API (Test Mode)',
    version: '1.0.0'
  });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    status: 'active',
    requestCount: Math.floor(Math.random() * 1000),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    timestamp: new Date().toISOString()
  });
});

// Sentry test endpoints
app.get('/api/test-sentry/status', (req, res) => {
  res.json({
    message: 'Sentry API integration is active',
    project: '123hansa-api',
    dsn: process.env.SENTRY_DSN ? 'configured' : 'missing',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/test-sentry/error', (req, res) => {
  try {
    // Intentional error for Sentry testing
    throw new Error('Test API error for Sentry - this is intentional!');
  } catch (error) {
    console.error('Test error triggered:', error.message);
    res.status(500).json({
      error: 'Test error sent to Sentry API project',
      message: 'Check your 123hansa-api Sentry project for this error',
      timestamp: new Date().toISOString()
    });
  }
});

// Mock API endpoints that would normally require database
app.get('/api/listings', (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please login to access listings'
  });
});

app.get('/api/users', (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please login to access user data'
  });
});

app.get('/api/messages', (req, res) => {
  res.status(401).json({
    error: 'Authentication required',
    message: 'Please login to access messages'
  });
});

app.get('/api/admin', (req, res) => {
  res.status(403).json({
    error: 'Admin access required',
    message: 'Admin privileges required for this endpoint'
  });
});

// Auth endpoints (mock responses)
app.post('/api/auth/login', (req, res) => {
  res.status(400).json({
    error: 'Invalid credentials',
    message: 'Mock API - no actual authentication performed'
  });
});

app.post('/api/auth/register', (req, res) => {
  res.status(400).json({
    error: 'Registration disabled',
    message: 'Mock API - no actual registration performed'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    service: '123hansa Test API'
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('API Error:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'Something went wrong in the test API',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Test API Server Started');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🎯 Sentry Test: http://localhost:${PORT}/api/test-sentry/status`);
  console.log(`❌ Sentry Error: http://localhost:${PORT}/api/test-sentry/error`);
  console.log('');
  console.log('💡 This is a lightweight test API for functionality testing');
  console.log('💡 It does not connect to the database - only tests basic endpoints');
  console.log('');
  console.log('✅ Ready for testing!');
});

export default app;