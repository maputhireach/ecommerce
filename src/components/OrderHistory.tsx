import { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { useCart } from '../contexts/CartContext'
import { OrderService } from '../services/orderService'

interface OrderItem {
  productId: string
  productName: string
  productImage: string
  quantity: number
  price: number
}

interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt: Date
}

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'shipped' | 'delivered'>('all')
  const { addNotification } = useNotifications()
  const { addItem } = useCart()

  useEffect(() => {
    loadOrderHistory()
  }, [])

  const loadOrderHistory = () => {
    try {
      setLoading(true)
      // Use OrderService instead of direct localStorage access
      const ordersFromService = OrderService.getOrders()
      setOrders(ordersFromService)
    } catch (error) {
      console.error('Failed to load order history:', error)
      addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to load order history',
        duration: 3000
      })
      setOrders([])
    } finally {
      setLoading(false)
    }
  }

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true
    return order.status === filter
  })

  const getStatusBadge = (status: Order['status']) => {
    const statusConfig = {
      pending: { icon: '⏳', color: '#f59e0b', bg: 'rgba(251, 191, 36, 0.1)', text: 'Pending' },
      confirmed: { icon: '✅', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: 'Confirmed' },
      shipped: { icon: '🚚', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', text: 'Shipped' },
      delivered: { icon: '📦', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', text: 'Delivered' }
    }
    const config = statusConfig[status] || statusConfig.pending
    
    return (
      <span className="status-badge" style={{
        color: config.color,
        backgroundColor: config.bg,
        border: `1px solid ${config.color}`,
      }}>
        <span>{config.icon}</span>
        {config.text}
      </span>
    )
  }

  const handleReorder = (order: Order) => {
    order.items.forEach(item => {
      // Create a mock product object for adding to cart
      const product = {
        id: item.productId,
        name: item.productName,
        imageUrl: item.productImage,
        priceUsd: item.price
      }
      addItem(product, item.quantity)
    })
    
    addNotification({
      type: 'success',
      title: 'Items Added to Cart',
      message: `${order.items.length} item${order.items.length !== 1 ? 's' : ''} from order #${order.id} added to your cart.`,
      duration: 4000
    })
  }

  if (loading) {
    return (
      <div className="order-history">
        <div className="order-history__header">
          <div className="header-content">
            <h1 className="page-title">
              <i className="bi bi-clock-history"></i>
              Order History
            </h1>
            <p className="page-subtitle">Track your orders and purchase history</p>
          </div>
        </div>
        <div className="loading-state">
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
          <p>Loading your order history...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="order-history">
        <div className="order-history__header">
          <div className="header-content">
            <h1 className="page-title">
              <i className="bi bi-clock-history"></i>
              Order History
            </h1>
            <p className="page-subtitle">Track your orders and purchase history</p>
          </div>
        </div>
        <div className="empty-state">
          <div className="empty-state__icon">
            <i className="bi bi-bag-x"></i>
          </div>
          <h2 className="empty-state__title">No Orders Yet</h2>
          <p className="empty-state__message">
            You haven't placed any orders yet. Start shopping to see your order history here!
          </p>
          <a href="/#products" className="btn btn--primary btn--large">
            <i className="bi bi-shop"></i>
            Start Shopping
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="order-history">
      <div className="order-history__header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="bi bi-clock-history"></i>
            Order History
          </h1>
          <p className="page-subtitle">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} found
          </p>
        </div>
        <div className="header-filters">
          <select 
            className="filter-select"
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>
      </div>
      
      <div className="orders-grid">
        {filteredOrders.map((order) => (
          <div key={order.id} className="order-card">
            {/* Order Header */}
            <div className="order-card__header">
              <div className="order-info">
                <h3 className="order-number">
                  <i className="bi bi-receipt"></i>
                  Order #{order.id}
                </h3>
                <div className="order-meta">
                  <span className="order-date">
                    <i className="bi bi-calendar3"></i>
                    {order.createdAt.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="order-time">
                    <i className="bi bi-clock"></i>
                    {order.createdAt.toLocaleTimeString('en-US', {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              <div className="order-status">
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Order Summary */}
            <div className="order-summary">
              <div className="summary-item">
                <span className="summary-label">
                  <i className="bi bi-box"></i>
                  Items
                </span>
                <span className="summary-value">{order.items.length}</span>
              </div>
              <div className="summary-item total">
                <span className="summary-label">
                  <i className="bi bi-currency-dollar"></i>
                  Total
                </span>
                <span className="summary-value">${order.totalAmount.toFixed(2)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="order-items">
              <h4 className="items-title">
                <i className="bi bi-list-ul"></i>
                Items Ordered
              </h4>
              <div className="items-list">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img 
                        src={item.productImage} 
                        alt={item.productName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyMEg0MFY0MEgyMFYyMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h5 className="item-name">{item.productName}</h5>
                      <div className="item-info">
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="item-total">
                      <span className="total-label">Total</span>
                      <span className="total-amount">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Actions */}
            <div className="order-actions">
              <button 
                className="btn btn--secondary"
                onClick={() => {
                  addNotification({
                    type: 'info',
                    title: 'Order Details',
                    message: `Order #${order.id} placed on ${order.createdAt.toLocaleDateString('en-US')} with ${order.items.length} item${order.items.length !== 1 ? 's' : ''} for $${order.totalAmount.toFixed(2)}`,
                    duration: 5000
                  })
                }}
              >
                <i className="bi bi-eye"></i>
                View Details
              </button>
              <button 
                className="btn btn--primary"
                onClick={() => handleReorder(order)}
              >
                <i className="bi bi-arrow-repeat"></i>
                Reorder Items
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}