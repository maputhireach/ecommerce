import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { store } from './models/inMemoryStore';

// Import routes
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import cartRoutes from './routes/cart';

const app = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: config.frontendUrl,
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
    // Seed initial data
    await store.seedData();
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
