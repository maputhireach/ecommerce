// Clean startup file for backend server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Start simple server to verify everything works
const app = express();
const PORT = 5000;

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Simple health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend server is running!',
    timestamp: new Date().toISOString(),
    port: PORT
  });
});

// Basic test endpoint
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API is working!',
    mongodb_status: 'Ready to connect'
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Backend server started successfully!');
  console.log(`📍 Server running on: http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log('\n✅ Ready for testing!');
});

// Export for potential use
module.exports = app;