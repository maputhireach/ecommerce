import { User, Product, Order, CartItem } from '../types';

// In-memory data storage (replace with database later)
class InMemoryStore {
  private users: Map<string, User> = new Map();
  private products: Map<string, Product> = new Map();
  private orders: Map<string, Order> = new Map();
  private cartItems: Map<string, CartItem> = new Map();
  private nextId = 1;

  // User methods
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const id = this.generateId();
    const now = new Date();
    const user: User = {
      ...userData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.users.set(id, user);
    return user;
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async findUserById(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  // Product methods
  async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const id = this.generateId();
    const now = new Date();
    const product: Product = {
      ...productData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.products.set(id, product);
    return product;
  }

  async getAllProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async updateProductStock(id: string, quantity: number): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) return false;

    if (product.stockQuantity < quantity) return false;
    
    product.stockQuantity -= quantity;
    product.updatedAt = new Date();
    return true;
  }

  // Order methods
  async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order> {
    const id = this.generateId();
    const now = new Date();
    const order: Order = {
      ...orderData,
      id,
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, order);
    return order;
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(order => order.userId === userId);
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    order.status = status as any;
    order.updatedAt = new Date();
    return order;
  }

  // Cart methods
  async addToCart(userId: string, productId: string, quantity: number): Promise<CartItem> {
    const id = this.generateId();
    const product = await this.getProductById(productId);
    if (!product) throw new Error('Product not found');

    const cartItem: CartItem = {
      id,
      userId,
      productId,
      quantity,
      product
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async getCartByUserId(userId: string): Promise<CartItem[]> {
    return Array.from(this.cartItems.values()).filter(item => item.userId === userId);
  }

  async removeFromCart(id: string): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearUserCart(userId: string): Promise<void> {
    const userCartItems = await this.getCartByUserId(userId);
    userCartItems.forEach(item => this.cartItems.delete(item.id));
  }

  // Helper methods
  private generateId(): string {
    return (this.nextId++).toString();
  }

  // Seed some initial data
  async seedData(): Promise<void> {
    // Create admin user
    const adminUser = await this.createUser({
      email: 'admin@example.com',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.s7mG', // password: admin123
      firstName: 'Admin',
      lastName: 'User',
      isAdmin: true
    });

    // Create sample products
    const products = [
      {
        name: 'Sample Product 1',
        description: 'This is a sample product description',
        priceUsd: 29.99,
        imageUrl: '/assets/img/1.jpg',
        stockQuantity: 100,
        category: 'Electronics',
        isActive: true
      },
      {
        name: 'Sample Product 2',
        description: 'Another sample product description',
        priceUsd: 49.99,
        imageUrl: '/assets/img/2.jpg',
        stockQuantity: 50,
        category: 'Clothing',
        isActive: true
      }
    ];

    for (const productData of products) {
      await this.createProduct(productData);
    }
  }
}

export const store = new InMemoryStore();
