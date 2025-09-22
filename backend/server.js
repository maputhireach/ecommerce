// Full e-commerce backend server with MongoDB
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-here-change-in-production-12345';

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174', 
    'http://localhost:5175',
    'http://localhost:5176',
    'http://localhost:5177',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  isAdmin: { type: Boolean, default: false }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Simple Product Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  priceUsd: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  stockQuantity: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

// Simple Order Schema
const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'], default: 'pending' },
  totalAmount: { type: Number, required: true },
  items: [{
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true },
    priceAtTime: { type: Number, required: true },
    product: { type: Object, required: true }
  }],
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access token required'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
};

// Routes
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'E-commerce Backend Server with MongoDB',
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
  });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isAdmin: false
    });

    await user.save();

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        },
        token
      },
      message: 'User registered successfully'
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin
        },
        token
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Product routes
app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true });
    res.json({
      success: true,
      data: products,
      message: 'Products retrieved successfully'
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Order routes
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { items, shippingAddress } = req.body;
    const userId = req.user.id;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Order must contain at least one item'
      });
    }

    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return res.status(400).json({
          success: false,
          error: `Product ${item.productId} not found`
        });
      }

      if (product.stockQuantity < item.quantity) {
        return res.status(400).json({
          success: false,
          error: `Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`
        });
      }

      totalAmount += product.priceUsd * item.quantity;
      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtTime: product.priceUsd,
        product: product.toObject()
      });
    }

    const order = new Order({
      userId,
      status: 'pending',
      totalAmount,
      items: orderItems,
      shippingAddress
    });

    await order.save();

    // Update stock quantities
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { stockQuantity: -item.quantity } }
      );
    }

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/orders/my-orders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Update order status (admin functionality)
app.put('/api/orders/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid order status'
      });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      id,
      { 
        status: status,
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!updatedOrder) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      });
    }
    
    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Basic cart endpoints (simplified)
app.get('/api/cart', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: [],
    message: 'Cart retrieved successfully (simplified implementation)'
  });
});

app.post('/api/cart/add', authenticateToken, (req, res) => {
  res.json({
    success: true,
    data: { message: 'Item added to cart (simplified implementation)' },
    message: 'Item added to cart successfully'
  });
});

// Seed data function
async function seedData() {
  try {
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    
    if (userCount > 0 || productCount > 0) {
      console.log('Database already has data, skipping seed...');
      return;
    }

    console.log('Seeding database with initial data...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      email: 'admin@example.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });

    // Create sample products
    const products = [
      {
        name: 'Wireless Bluetooth Headphones',
        description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life',
        priceUsd: 99.99,
        imageUrl: '/assets/img/headphones.jpg',
        stockQuantity: 50,
        category: 'Electronics',
        isActive: true
      },
      {
        name: 'Smart Fitness Watch',
        description: 'Track your fitness goals with this advanced smartwatch featuring heart rate monitoring',
        priceUsd: 199.99,
        imageUrl: '/assets/img/smartwatch.jpg',
        stockQuantity: 30,
        category: 'Electronics',
        isActive: true
      },
      {
        name: 'Organic Cotton T-Shirt',
        description: 'Comfortable and sustainable organic cotton t-shirt available in multiple colors',
        priceUsd: 29.99,
        imageUrl: '/assets/img/tshirt.jpg',
        stockQuantity: 100,
        category: 'Clothing',
        isActive: true
      },
      {
        name: 'Professional Laptop Backpack',
        description: 'Durable laptop backpack with multiple compartments for business professionals',
        priceUsd: 79.99,
        imageUrl: '/assets/img/backpack.jpg',
        stockQuantity: 25,
        category: 'Accessories',
        isActive: true
      }
    ];

    await Product.insertMany(products);
    console.log('✅ Database seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB successfully');
    
    // Seed initial data
    await seedData();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: development`);
      console.log(`🔗 Frontend URL: http://localhost:5173`);
      console.log(`📊 Health check: http://localhost:${PORT}/health`);
      console.log('\n📋 Available endpoints:');
      console.log('   POST /api/auth/register - User registration');
      console.log('   POST /api/auth/login - User login');
      console.log('   GET  /api/products - Get all products');
      console.log('   POST /api/orders - Create order');
      console.log('   GET  /api/orders/my-orders - Get user orders');
      console.log('   GET  /api/cart - Get user cart');
      console.log('   POST /api/cart/add - Add item to cart');
      console.log('\n🔑 Admin credentials: admin@example.com / admin123');
      console.log('\n🧪 Ready for testing!');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();