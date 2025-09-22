import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useNotifications } from '../contexts/NotificationContext'
import { ApiService } from '../services/api'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal } = useCart()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)


  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ApiService.isAuthenticated()) {
      addNotification({
        type: 'error',
        title: 'Authentication Required',
        message: 'Please login to place an order.',
        duration: 5000
      })
      return
    }

    if (items.length === 0) {
      addNotification({
        type: 'error',
        title: 'Empty Cart',
        message: 'Your cart is empty. Add some items before checkout.',
        duration: 5000
      })
      return
    }

    setLoading(true)
    
    try {
      const orderData = {
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      }

      const order = await ApiService.createOrder(orderData)
      
      addNotification({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Your order #${order._id} has been placed and saved to your account.`,
        duration: 6000
      })
      
      // Clear form and close modal
      onClose()
      
    } catch (error: any) {
      addNotification({
        type: 'error',
        title: 'Order Failed',
        message: error.message || 'Failed to place order. Please try again.',
        duration: 5000
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="profile-overlay">
      <div className="profile-modal">
        <div className="profile-header">
          <h2>Checkout</h2>
          <button className="close-btn" onClick={onClose} disabled={loading}>
            <i className="bi bi-x"></i>
          </button>
        </div>

        <form onSubmit={handleSubmitOrder} className="profile-form">
          {/* Order Summary */}
          <div className="form-group">
            <h3>Order Summary</h3>
            <div style={{ marginBottom: '1rem' }}>
              {items.map(item => (
                <div key={item.product.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  padding: '0.5rem',
                  borderBottom: '1px solid #eee'
                }}>
                  <span>{item.product.name} × {item.quantity}</span>
                  <span>${(item.product.priceUsd * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                padding: '0.5rem',
                fontWeight: 'bold',
                borderTop: '2px solid #333'
              }}>
                <span>Total:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading || items.length === 0}>
              {loading ? 'Placing Order...' : `Place Order - $${subtotal.toFixed(2)}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}