import { useState, useEffect } from 'react'
import type { Order } from '../types'
import { OrderStatus } from '../types'
import { ApiService } from '../services/api'
import { useNotifications } from '../contexts/NotificationContext'

export default function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
        
        if (!fetchedOrders || !Array.isArray(fetchedOrders)) {
          setOrders([])
          return
        }
        
        // Process orders with safe handling
        const processedOrders = fetchedOrders.map((order: any) => {
          return {
            ...order,
            id: order._id || order.id,
            createdAt: new Date(order.createdAt),
            updatedAt: new Date(order.updatedAt),
            status: order.status as OrderStatus
          }
        })
        
        setOrders(processedOrders)
      } catch (err) {
        console.error('Failed to fetch orders:', err)
        setError('Failed to load order history')
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [addNotification])

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
      case OrderStatus.COMPLETED:
        return 'bg-green-700'
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

      {!loading && !error && orders.length === 0 && (
        <div className="order-history__empty">
          <p>You haven't placed any orders yet.</p>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="order-history__list">
          {orders.map((order, index) => (
            <div key={order.id || order._id || index} className="order-card">
              <div className="order-card__header">
                <div className="order-card__info">
                  <h3 className="order-card__id">Order #{order.id ? order.id.toString().slice(-8).toUpperCase() : 'UNKNOWN'}</h3>
                  <p className="order-card__date">{formatDate(order.createdAt)}</p>
                </div>
                <div className="order-card__status">
                  <span className={`status-badge ${getStatusBadgeColor(order.status)}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="order-card__items">
                <h4>Items ({order.items ? order.items.length : 0})</h4>
                <div className="order-items">
                  {order.items && order.items.map((item, itemIndex) => (
                    <div key={item.id || item._id || itemIndex} className="order-item">
                      <img 
                        src={item.product?.imageUrl || '/assets/img/placeholder.jpg'} 
                        alt={item.product?.name || 'Product'}
                        className="order-item__image"
                        onError={(e) => {
                          e.currentTarget.src = '/assets/img/placeholder.jpg'
                        }}
                      />
                      <div className="order-item__details">
                        <p className="order-item__name">{item.product?.name || 'Unknown Product'}</p>
                        <p className="order-item__quantity">Qty: {item.quantity || 0}</p>
                        <p className="order-item__price">${(item.priceAtTime || 0).toFixed(2)} each</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="order-card__footer">
                <div className="order-card__total">
                  <strong>Total: ${(order.totalAmount || 0).toFixed(2)}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}