import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import { useNotifications } from '../contexts/NotificationContext'
import { OrderService } from '../services/orderService'

interface CheckoutModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CheckoutModal({ isOpen, onClose }: CheckoutModalProps) {
  const { items, subtotal, clearCart } = useCart()
  const { addNotification } = useNotifications()
  const [loading, setLoading] = useState(false)


  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    
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
    
    // Simulate order processing delay
    setTimeout(() => {
      // Create order in localStorage
      const orderItems = items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.imageUrl,
        quantity: item.quantity,
        price: item.product.priceUsd
      }))
      
      const order = OrderService.createOrder(orderItems)
      
      addNotification({
        type: 'success',
        title: 'Order Placed Successfully!',
        message: `Your order #${order.id} has been placed! Total: $${subtotal.toFixed(2)}`,
        duration: 6000
      })
      
      // Clear cart after successful order
      clearCart()
      
      // Clear form and close modal
      setLoading(false)
      onClose()
    }, 1000)
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