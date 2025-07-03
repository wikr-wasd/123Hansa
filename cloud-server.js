const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());

// Använd samma mock data från demo-server
const MOCK_LISTINGS = [
  {
    id: 'comp-001',
    title: 'TechStartup AB - AI Betalningslösningar',
    category: 'companies',
    subcategory: 'aktiebolag',
    askingPrice: 12500000,
    currency: 'SEK',
    location: 'Stockholm',
    description: 'Etablerat fintech-företag som utvecklar AI-driven betalningslösningar för e-handel.',
    highlights: [
      '200+ aktiva företagskunder',
      'AI-driven teknologi',
      'Internationell expansion'
    ],
    status: 'ACTIVE',
    createdAt: '2024-06-20T10:00:00Z'
  },
  {
    id: 'dig-001',
    title: 'ScandiShop.se - E-handelsplattform',
    category: 'digital',
    subcategory: 'webbplatser',
    askingPrice: 2300000,
    currency: 'SEK',
    location: 'Online',
    description: 'Etablerad e-handelsplattform för nordisk design och heminredning.',
    status: 'ACTIVE',
    createdAt: '2024-06-22T08:15:00Z'
  }
];

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: '123hansa Test API',
    version: '1.0.0',
    status: 'running',
    message: 'Cloud-baserad testserver för 123hansa',
    timestamp: new Date().toISOString(),
    endpoints: {
      listings: '/api/listings/search',
      categories: '/api/categories',
      health: '/health'
    }
  });
});

// Health endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Listings endpoint
app.get('/api/listings/search', (req, res) => {
  res.json({
    success: true,
    data: {
      listings: MOCK_LISTINGS,
      totalCount: MOCK_LISTINGS.length,
      hasMore: false
    }
  });
});

// Categories endpoint  
app.get('/api/categories', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 'companies',
        name: 'Företag & Bolag',
        count: 1
      },
      {
        id: 'digital', 
        name: 'Digitala Tillgångar',
        count: 1
      }
    ]
  });
});

// Catch all
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    availableEndpoints: ['/', '/health', '/api/listings/search', '/api/categories']
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 123hansa Cloud Test Server running on port ${PORT}`);
  console.log(`📍 Server accessible at:`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Network: http://0.0.0.0:${PORT}`);
  console.log(`🧪 Test endpoints:`);
  console.log(`   GET /health`);
  console.log(`   GET /api/listings/search`);
  console.log(`   GET /api/categories`);
});