import { useState, useEffect } from 'react'
import type { Order } from '../types'
import { OrderStatus } from '../types'
import { ApiService } from '../services/api'
import { useNotifications } from '../contexts/NotificationContext'

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const { addNotification } = useNotifications()

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        setError(null)
        
        if (!ApiService.isAuthenticated()) {
          setError('Please log in to view your order history')
          return
        }

        const fetchedOrders = await ApiService.getUserOrders()
        
        // Convert date strings to Date objects and ensure status is properly typed
        const processedOrders = fetchedOrders.map((order: any) => ({
          ...order,
          createdAt: new Date(order.createdAt),
          updatedAt: new Date(order.updatedAt),
          status: order.status as OrderStatus
        }))
        
        setOrders(processedOrders)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load order history')
        addNotification({
          type: 'error',
          title: 'Error',
          message: 'Failed to load order history',
          duration: 4000
        })
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [addNotification])

  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter)

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-600'
      case OrderStatus.CONFIRMED:
        return 'bg-blue-600'
      case OrderStatus.SHIPPED:
        return 'bg-purple-600'
      case OrderStatus.DELIVERED:
        return 'bg-green-600'
      case OrderStatus.CANCELLED:
        return 'bg-red-600'
      default:
        return 'bg-gray-600'
    }
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!ApiService.isAuthenticated()) {
    return (
      <div className="order-history">
        <div className="order-history__header">
          <h2 className="section-title">Order History</h2>
        </div>
        <div className="order-history__empty">
          <p>Please log in to view your order history.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="order-history">
      <div className="order-history__header">
        <h2 className="section-title">Order History</h2>
        
        {/* Status Filter */}
        <div className="order-history__filters">
          <select 
            className="order-history__filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
          >
            <option value="all">All Orders</option>
            <option value={OrderStatus.PENDING}>Pending</option>
            <option value={OrderStatus.CONFIRMED}>Confirmed</option>
            <option value={OrderStatus.SHIPPED}>Shipped</option>
            <option value={OrderStatus.DELIVERED}>Delivered</option>
            <option value={OrderStatus.CANCELLED}>Cancelled</option>
          </select>
        </div>
      </div>

      {loading && (
        <div className="order-history__loading">
          <p>Loading your orders...</p>
        </div>
      )}

      {error && (
        <div className="order-history__error">
          <p>⚠️ {error}</p>
        </div>
      )}

      {!loading && !error && filteredOrders.length === 0 && (
        <div className="order-history__empty">
          {statusFilter === 'all' ? (
            <p>You haven't placed any orders yet.</p>
          ) : (
            <p>No orders found with status: {statusFilter}</p>
          )}
        </div>
      )}

      {!loading && !error && filteredOrders.length > 0 && (
        <div className="order-history__list">
          {filteredOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card__header">
                <div className="order-card__info">
                  <h3 className="order-card__id">Order #{order.id.slice(-8).toUpperCase()}</h3>
                  <p className="order-card__date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-card__status">
                  <span className={`status-badge ${getStatusBadgeColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-card__items">
                <h4>Items ({order.items.length})</h4>
                <div className="order-items">
                  {order.items.map((item) => (
                    <div key={item.id} className="order-item">
                      <img 
                        src={item.product.imageUrl} 
                        alt={item.product.name}
                        className="order-item__image"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/img/placeholder.jpg'
                        }}
                      />
                      <div className="order-item__details">
                        <p className="order-item__name">{item.product.name}</p>
                        <p className="order-item__quantity">Qty: {item.quantity}</p>
                        <p className="order-item__price">${item.priceAtTime.toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-card__footer">
                <div className="order-card__total">
                  <strong>Total: ${order.totalAmount.toFixed(2)}</strong>
                </div>
                <div className="order-card__shipping">
                  <p>Ship to: {order.shippingAddress.street}, {order.shippingAddress.city}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}