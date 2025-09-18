import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { connectToDatabase } from './config/database';
import { mongoService } from './models/mongoService';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000',
    config.frontendUrl
  ],
  credentials: true
}));
app.use(morgan('combined')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cart', cartRoutes);

// MongoDB Viewer Route
app.get('/mongo-viewer', (req, res) => {
  res.sendFile(path.join(__dirname, '../mongo-viewer.html'));
});

// Admin API endpoints for data viewing
app.get('/api/users', async (req, res) => {
  try {
    const users = await mongoService.getAllUsers();
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch users' });
  }
});

app.get('/api/orders', async (req, res) => {
  try {
    const orders = await mongoService.getAllOrders();
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch orders' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Global error handler:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectToDatabase();
    
    // Seed initial data
    await mongoService.seedData();
    console.log('✅ Initial data seeded successfully');
    
    app.listen(config.port, () => {
      console.log(`🚀 Server running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log('\n📋 Available endpoints:');
      console.log('   POST /api/auth/register - User registration');
      console.log('   POST /api/auth/login - User login');
      console.log('   GET  /api/products - Get all products');
      console.log('   GET  /api/products/:id - Get product by ID');
      console.log('   POST /api/products - Create product (admin only)');
      console.log('   PUT  /api/products/:id - Update product (admin only)');
      console.log('   DELETE /api/products/:id - Delete product (admin only)');
      console.log('   POST /api/orders - Create order');
      console.log('   GET  /api/orders/my-orders - Get user orders');
      console.log('   PUT  /api/orders/:id/status - Update order status (admin only)');
      console.log('   GET  /api/cart - Get user cart');
      console.log('   POST /api/cart/add - Add item to cart');
      console.log('   DELETE /api/cart/remove/:id - Remove item from cart');
      console.log('   DELETE /api/cart/clear - Clear cart');
      console.log('\n🔑 Admin credentials: admin@example.com / admin123');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

