const express = require('express');
const app = express();
const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.json({
    message: '123hansa test server is running!',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', port: PORT });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
});