const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  
  if (req.method === 'OPTIONS') {
    res.end();
    return;
  }
  
  const response = {
    message: '123hansa test server is working!',
    port: 3002,
    timestamp: new Date().toISOString(),
    url: req.url,
    method: req.method
  };
  
  res.end(JSON.stringify(response, null, 2));
});

server.listen(3002, '0.0.0.0', () => {
  console.log('✅ Test server running on:');
  console.log('   http://localhost:3002');
  console.log('   http://172.26.160.15:3002');
  console.log('   Port 3002 is listening on all interfaces');
});

server.on('error', (err) => {
  console.error('Server error:', err);
});