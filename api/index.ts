import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { url, method } = req;
  console.log(`${method} ${url}`);

  // Root API endpoint
  if (url === '/api' || url === '/api/') {
    return res.status(200).json({
      name: '123hansa API',
      version: '1.0.0',
      status: 'running',
      message: 'Welcome to 123hansa.se - Swedish Business Marketplace API',
      timestamp: new Date().toISOString(),
    });
  }

  // Health check
  if (url === '/api/health') {
    return res.status(200).json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'production'
    });
  }

  // Auth endpoints
  if (url?.startsWith('/api/auth')) {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Auth service available',
      endpoint: url
    });
  }

  // Listings endpoints
  if (url?.startsWith('/api/listings')) {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Listings service available',
      endpoint: url,
      data: [
        {
          id: '1',
          title: 'Test Business',
          category: 'Technology',
          price: 1000000,
          status: 'ACTIVE'
        }
      ]
    });
  }

  // Admin endpoints
  if (url?.startsWith('/api/admin')) {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Admin service available',
      endpoint: url
    });
  }

  // Messages endpoints
  if (url?.startsWith('/api/messages')) {
    return res.status(200).json({ 
      status: 'ok', 
      message: 'Messages service available',
      endpoint: url
    });
  }

  // Default 404 for unknown routes
  return res.status(404).json({
    error: 'Not Found',
    message: `API route ${url} not found`,
    availableRoutes: ['/api/health', '/api/auth', '/api/listings', '/api/admin', '/api/messages']
  });
}