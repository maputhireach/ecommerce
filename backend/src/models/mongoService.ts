import mongoose from 'mongoose';
import { UserModel, ProductModel, OrderModel, CartItemModel } from './index';
import { User, Product, Order, CartItem, OrderStatus } from '../types';
import bcrypt from 'bcryptjs';

// MongoDB Database Service - Replaces InMemoryStore
class MongoDBService {
  
  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const user = new UserModel(userData);
      const savedUser = await user.save();
      return savedUser.toJSON() as User;
    } catch (error) {
      if (error instanceof Error && 'code' in error && error.code === 11000) {
        throw new Error('User already exists with this email');
      }
      throw error;
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      const user = await UserModel.findOne({ email }).exec();
      if (!user) return undefined;
      
      // Return user data with password for authentication purposes
      return {
        id: (user._id as any).toString(),
        email: user.email,
        password: user.password, // Keep password for authentication
        firstName: user.firstName,
        lastName: user.lastName,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      } as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      return undefined;
    }
  }

  async findUserById(id: string): Promise<User | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const user = await UserModel.findById(id).exec();
      return user ? (user.toJSON() as User) : undefined;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      return undefined;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const users = await UserModel.find({}).exec();
      return users.map(user => user.toJSON() as User);
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const user = await UserModel.findByIdAndUpdate(
        id, 
        { ...updates, updatedAt: new Date() }, 
        { new: true }
      ).exec();
      return user ? (user.toJSON() as User) : undefined;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  // Product methods
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const product = new ProductModel(productData);
      const savedProduct = await product.save();
      return savedProduct.toJSON() as Product;
    } catch (error) {
      console.error('Error creating product:', error);
      throw error;
    }
  }

  async getAllProducts(): Promise<Product[]> {
    try {
      const products = await ProductModel.find({ isActive: true }).exec();
      return products.map(product => product.toJSON() as Product);
    } catch (error) {
      console.error('Error getting all products:', error);
      return [];
    }
  }

  async getProductById(id: string): Promise<Product | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const product = await ProductModel.findById(id).exec();
      return product ? (product.toJSON() as Product) : undefined;
    } catch (error) {
      console.error('Error finding product by ID:', error);
      return undefined;
    }
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const product = await ProductModel.findByIdAndUpdate(
        id, 
        { ...updates, updatedAt: new Date() }, 
        { new: true }
      ).exec();
      return product ? (product.toJSON() as Product) : undefined;
    } catch (error) {
      console.error('Error updating product:', error);
      return undefined;
    }
  }

  async updateProductStock(id: string, quantity: number): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }
      
      const product = await ProductModel.findById(id).exec();
      if (!product || product.stockQuantity < quantity) {
        return false;
      }
      
      product.stockQuantity -= quantity;
      product.updatedAt = new Date();
      await product.save();
      return true;
    } catch (error) {
      console.error('Error updating product stock:', error);
      return false;
    }
  }

  // Order methods
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    try {
      const order = new OrderModel(orderData);
      const savedOrder = await order.save();
      return savedOrder.toJSON() as unknown as Order;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
      }
      const orders = await OrderModel.find({ userId })
        .sort({ createdAt: -1 })
        .exec();
      return orders.map(order => order.toJSON() as unknown as Order);
    } catch (error) {
      console.error('Error getting orders by user ID:', error);
      return [];
    }
  }

  async getAllOrders(): Promise<Order[]> {
    try {
      const orders = await OrderModel.find({})
        .sort({ createdAt: -1 })
        .exec();
      return orders.map(order => order.toJSON() as unknown as Order);
    } catch (error) {
      console.error('Error getting all orders:', error);
      return [];
    }
  }

  async getOrderById(id: string): Promise<Order | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const order = await OrderModel.findById(id).exec();
      return order ? (order.toJSON() as unknown as Order) : undefined;
    } catch (error) {
      console.error('Error finding order by ID:', error);
      return undefined;
    }
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const order = await OrderModel.findByIdAndUpdate(
        id, 
        { status, updatedAt: new Date() }, 
        { new: true }
      ).exec();
      return order ? (order.toJSON() as unknown as Order) : undefined;
    } catch (error) {
      console.error('Error updating order status:', error);
      return undefined;
    }
  }

  // Cart methods
  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(productId)) {
        throw new Error('Invalid user ID or product ID');
      }

      const product = await this.getProductById(productId);
      if (!product) {
        throw new Error('Product not found');
      }

      // Check if item already exists in cart
      const existingCartItem = await CartItemModel.findOne({ userId, productId }).exec();
      
      if (existingCartItem) {
        // Update quantity
        existingCartItem.quantity += quantity;
        existingCartItem.product = product;
        const savedItem = await existingCartItem.save();
        return savedItem.toJSON() as unknown as CartItem;
      } else {
        // Create new cart item
        const cartItem = new CartItemModel({
          userId,
          productId,
          quantity,
          product
        });
        const savedItem = await cartItem.save();
        return savedItem.toJSON() as unknown as CartItem;
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async getCartByUserId(userId: string): Promise<CartItem[]> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return [];
      }
      const cartItems = await CartItemModel.find({ userId }).exec();
      return cartItems.map(item => item.toJSON() as unknown as CartItem);
    } catch (error) {
      console.error('Error getting cart by user ID:', error);
      return [];
    }
  }

  async removeFromCart(id: string): Promise<boolean> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return false;
      }
      const result = await CartItemModel.findByIdAndDelete(id).exec();
      return !!result;
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  async clearUserCart(userId: string): Promise<void> {
    try {
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return;
      }
      await CartItemModel.deleteMany({ userId }).exec();
    } catch (error) {
      console.error('Error clearing user cart:', error);
    }
  }

  async updateCartItemQuantity(id: string, quantity: number): Promise<CartItem | undefined> {
    try {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return undefined;
      }
      const cartItem = await CartItemModel.findByIdAndUpdate(
        id, 
        { quantity }, 
        { new: true }
      ).exec();
      return cartItem ? (cartItem.toJSON() as unknown as CartItem) : undefined;
    } catch (error) {
      console.error('Error updating cart item quantity:', error);
      return undefined;
    }
  }

  // Seed some initial data
  async seedData(): Promise<void> {
    try {
      // Check if data already exists
      const userCount = await UserModel.countDocuments();
      const productCount = await ProductModel.countDocuments();
      
      if (userCount > 0 || productCount > 0) {
        console.log('Database already has data, skipping seed...');
        return;
      }

      console.log('Seeding database with initial data...');

      // Create admin user
      const hashedPassword = await bcrypt.hash('admin123', 12);
      await this.createUser({
        email: 'admin@example.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        isAdmin: true
      });

      // Create sample products
      const products = [
        {
          name: 'Classic Tee — Black',
          description: 'Comfortable premium cotton t-shirt in classic black',
          priceUsd: 24.99,
          imageUrl: '/assets/img/1.jpg',
          stockQuantity: 50,
          category: 'Clothing',
          isActive: true
        },
        {
          name: 'Classic Tee — White',
          description: 'Premium cotton t-shirt in crisp white color',
          priceUsd: 22.99,
          imageUrl: '/assets/img/2.jpg',
          stockQuantity: 45,
          category: 'Clothing',
          isActive: true
        },
        {
          name: 'Heavyweight Tee',
          description: 'Durable heavyweight cotton t-shirt for lasting comfort',
          priceUsd: 29.99,
          imageUrl: '/assets/img/3.jpg',
          stockQuantity: 30,
          category: 'Clothing',
          isActive: true
        },
        {
          name: 'Long Sleeve Premium',
          description: 'Premium long sleeve shirt perfect for layering',
          priceUsd: 32.99,
          imageUrl: '/assets/img/4.jpg',
          stockQuantity: 35,
          category: 'Clothing',
          isActive: true
        },
        {
          name: 'Designer Collection Tee',
          description: 'Limited edition designer t-shirt with premium finish',
          priceUsd: 39.99,
          imageUrl: '/assets/img/5.jpg',
          stockQuantity: 25,
          category: 'Clothing',
          isActive: true
        }
      ];

      for (const productData of products) {
        await this.createProduct(productData);
      }

      console.log('✅ Database seeded successfully!');
    } catch (error) {
      console.error('❌ Error seeding database:', error);
    }
  }
}

export const mongoService = new MongoDBService();