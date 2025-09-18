// API service for communicating with backend
// Environment-aware API configuration
const getApiBaseUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }
  
  // Fallback logic for different environments
  if (import.meta.env.PROD) {
    // Production: Try to detect the backend URL
    // Option 1: Same domain (if backend and frontend are on same server)
    return `${window.location.origin}/api`;
    
    // Option 2: Different domain (uncomment and modify as needed)
    // return 'https://your-backend-domain.com/api';
  } else {
    // Development: Use localhost
    return 'http://localhost:5000/api';
  }
};

const API_BASE_URL = getApiBaseUrl();

// Debug logging
console.log('🔗 API Base URL:', API_BASE_URL);
console.log('🌍 Environment:', import.meta.env.MODE);

export class ApiService {
  private static getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Products
  static async getProducts() {
    try {
      const response = await fetch(`${API_BASE_URL}/products`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.map((product: any) => ({
          ...product,
          id: product._id || product.id
        }));
      }
      throw new Error(data.error || 'Failed to fetch products');
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  // Auth
  static async register(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      throw new Error(data.error || 'Registration failed');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(credentials: {
    email: string;
    password: string;
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return data.data;
      }
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Orders
  static async createOrder(orderData: {
    items: { productId: string; quantity: number }[];
    shippingAddress: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }) {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(orderData),
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Order creation failed');
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  static async getUserOrders() {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch orders');
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  // Utility
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }
}