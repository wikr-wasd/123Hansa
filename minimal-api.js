const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3002;

// Minimal test data
const testData = {
  listings: [
    { id: 1, title: 'Test Företag AB', price: 1000000, category: 'company' },
    { id: 2, title: 'Test Webbshop', price: 500000, category: 'digital' }
  ],
  status: 'OK',
  timestamp: new Date().toISOString()
};

const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  let response;

  switch (path) {
    case '/':
      response = {
        message: 'Tubba Minimal Test API',
        status: 'running',
        port: PORT,
        endpoints: ['/health', '/api/test', '/api/listings'],
        timestamp: new Date().toISOString()
      };
      break;

    case '/health':
      response = { status: 'OK', timestamp: new Date().toISOString() };
      break;

    case '/api/test':
      response = { test: 'success', data: 'API is working!' };
      break;

    case '/api/listings':
      response = { success: true, data: testData.listings };
      break;

    default:
      res.writeHead(404);
      response = { error: 'Not found', path: path };
      break;
  }

  res.writeHead(res.statusCode || 200);
  res.end(JSON.stringify(response, null, 2));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Minimal API running on port ${PORT}`);
  console.log(`🔗 Test: http://localhost:${PORT}/health`);
  console.log(`📋 Listings: http://localhost:${PORT}/api/listings`);
});

// Handle errors
server.on('error', (err) => {
  console.error('Server error:', err);
});

process.on('SIGTERM', () => {
  console.log('Shutting down server...');
  server.close();
});

process.on('SIGINT', () => {
  console.log('Shutting down server...');
  server.close();
  process.exit(0);
});