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
      console.log('📝 Attempting registration for:', userData.email);
      console.log('🔗 API URL:', `${API_BASE_URL}/auth/register`);
      
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      console.log('📊 Registration response status:', response.status);
      const data = await response.json();
      console.log('📊 Registration response data:', data);
      
      if (data.success) {
        console.log('✅ Registration successful, storing auth data...');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('💾 Auth data stored in localStorage');
        return data.data;
      }
      throw new Error(data.error || 'Registration failed');
    } catch (error) {
      console.error('❌ Registration error:', error);
      throw error;
    }
  }

  static async login(credentials: {
    email: string;
    password: string;
  }) {
    try {
      console.log('🔐 Attempting login for:', credentials.email);
      console.log('🔗 API URL:', `${API_BASE_URL}/auth/login`);
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      console.log('📊 Login response status:', response.status);
      const data = await response.json();
      console.log('📊 Login response data:', data);
      
      if (data.success) {
        console.log('✅ Login successful, storing auth data...');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        console.log('💾 Auth data stored in localStorage');
        return data.data;
      }
      throw new Error(data.error || 'Login failed');
    } catch (error) {
      console.error('❌ Login error:', error);
      throw error;
    }
  }

  static isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    console.log('🔑 ApiService.isAuthenticated() - token present:', !!token);
    return !!token;
  }

  static getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.log('👤 ApiService.getCurrentUser() - no user in localStorage');
      return null;
    }
    try {
      const user = JSON.parse(userStr);
      console.log('👤 ApiService.getCurrentUser() - user:', user);
      return user;
    } catch (error) {
      console.error('❌ ApiService.getCurrentUser() - parse error:', error);
      return null;
    }
  }

  static logout() {
    console.log('💪 ApiService.logout() - clearing localStorage');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Profile
  static async getUserProfile() {
    try {
      console.log('👤 Fetching user profile...');
      console.log('🔗 API URL:', `${API_BASE_URL}/auth/profile`);
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      
      console.log('📊 Profile response status:', response.status);
      const data = await response.json();
      console.log('📊 Profile response data:', data);
      
      if (data.success) {
        console.log('✅ Profile fetched successfully');
        // Update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch profile');
    } catch (error) {
      console.error('❌ Error fetching profile:', error);
      throw error;
    }
  }

  static async updateUserProfile(profileData: {
    firstName?: string;
    lastName?: string;
    profile?: {
      phone?: string;
    };
  }) {
    try {
      console.log('💾 Updating user profile...');
      console.log('🔗 API URL:', `${API_BASE_URL}/auth/profile`);
      console.log('📄 Profile data:', profileData);
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...this.getAuthHeaders(),
        },
        body: JSON.stringify(profileData),
      });
      
      console.log('📊 Update profile response status:', response.status);
      const data = await response.json();
      console.log('📊 Update profile response data:', data);
      
      if (data.success) {
        console.log('✅ Profile updated successfully');
        // Update localStorage with latest user data
        localStorage.setItem('user', JSON.stringify(data.data));
        return data.data;
      }
      throw new Error(data.error || 'Failed to update profile');
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      throw error;
    }
  }

  // Orders
  static async createOrder(orderData: {
    items: { productId: string; quantity: number }[];
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
      console.log('📋 Fetching user orders...');
      console.log('🔗 API URL:', `${API_BASE_URL}/orders/my-orders`);
      console.log('🔑 Auth headers:', this.getAuthHeaders());
      
      const response = await fetch(`${API_BASE_URL}/orders/my-orders`, {
        headers: {
          ...this.getAuthHeaders(),
        },
      });
      
      console.log('📊 Orders response status:', response.status);
      const data = await response.json();
      console.log('📊 Orders response data:', data);
      
      if (data.success) {
        console.log('✅ Orders fetched successfully:', data.data.length, 'orders');
        return data.data;
      }
      throw new Error(data.error || 'Failed to fetch orders');
    } catch (error) {
      console.error('❌ Error fetching orders:', error);
      return [];
    }
  }
}