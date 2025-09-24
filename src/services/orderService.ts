// Local order management service
export interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

export interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: Date
}

export class OrderService {
  private static readonly STORAGE_KEY = 'orderHistory'

  // Create a new order and save to localStorage
  static createOrder(items: OrderItem[]): Order {
    console.log('🛍️ OrderService.createOrder called with items:', items)
    
    const orderId = Math.random().toString(36).substring(2, 10).toUpperCase()
    const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    
    const newOrder: Order = {
      id: orderId,
      items: items,
      totalAmount: totalAmount,
      status: 'confirmed', // Start as confirmed since it's a simple local order
      createdAt: new Date()
    }

    console.log('📦 Created new order:', newOrder)

    // Save to localStorage
    this.saveOrder(newOrder)
    
    console.log('💾 Order saved to localStorage')
    
    return newOrder
  }

  // Save order to localStorage
  private static saveOrder(order: Order) {
    try {
      console.log('💾 Saving order to localStorage...')
      
      // Get existing orders directly from localStorage to avoid infinite recursion
      const stored = localStorage.getItem(this.STORAGE_KEY)
      const existingOrders: Order[] = stored ? JSON.parse(stored).map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt)
      })) : []
      
      console.log('📋 Existing orders count:', existingOrders.length)
      
      const updatedOrders = [order, ...existingOrders]
      console.log('📋 Updated orders count:', updatedOrders.length)
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedOrders))
      console.log('✅ Order saved successfully to localStorage')
    } catch (error) {
      console.error('❌ Failed to save order:', error)
    }
  }

  // Get all orders from localStorage
  static getOrders(): Order[] {
    try {
      console.log('📖 Getting orders from localStorage...')
      const stored = localStorage.getItem(this.STORAGE_KEY)
      
      if (!stored) {
        console.log('📭 No orders found in localStorage')
        return []
      }
      
      console.log('📦 Raw orders from localStorage:', stored)
      const orders = JSON.parse(stored)
      const processedOrders = orders.map((order: any) => ({
        ...order,
        createdAt: new Date(order.createdAt)
      }))
      
      console.log('📋 Processed orders:', processedOrders)
      
      // Sort by most recent first
      processedOrders.sort((a: Order, b: Order) => b.createdAt.getTime() - a.createdAt.getTime())
      
      return processedOrders
    } catch (error) {
      console.error('❌ Failed to load orders:', error)
      return []
    }
  }

  // Update order status (for future features)
  static updateOrderStatus(orderId: string, status: Order['status']): boolean {
    try {
      const orders = this.getOrders()
      const orderIndex = orders.findIndex(order => order.id === orderId)
      
      if (orderIndex === -1) return false
      
      orders[orderIndex].status = status
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(orders))
      return true
    } catch (error) {
      console.error('Failed to update order status:', error)
      return false
    }
  }

  // Clear all orders (for testing/reset)
  static clearOrders() {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  // Get order count
  static getOrderCount(): number {
    return this.getOrders().length
  }
}