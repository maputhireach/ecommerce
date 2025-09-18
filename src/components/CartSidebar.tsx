import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'
import CheckoutModal from './CheckoutModal'

export default function CartSidebar() {
	const { items, isOpen, closeCart, removeItem, setQuantity, subtotal } = useCart()
	const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)

	useEffect(() => {
		if (isOpen) {
			// Prevent body scrolling when cart is open
			document.body.style.overflow = 'hidden'
		} else {
			// Restore body scrolling when cart is closed
			document.body.style.overflow = 'unset'
		}

		// Cleanup function to restore scrolling when component unmounts
		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [isOpen])

	const handleCheckout = () => {
		setIsCheckoutOpen(true)
	}

	const handleCloseCheckout = () => {
		setIsCheckoutOpen(false)
	}

	return (
		<>
			<div className={`cartside${isOpen ? ' cartside--open' : ''}`} aria-hidden={!isOpen}>
				<div className="cartside__backdrop" onClick={closeCart} />
				<aside className="cartside__panel" aria-label="Cart">
					<header className="cartside__header">
						<h3 className="cartside__title"><i className="bi bi-bag me-2"></i> Your Cart</h3>
						<button className="cartside__close" onClick={closeCart} aria-label="Close"><i className="bi bi-x-lg"></i></button>
					</header>
					<div className="cartside__body">
						{items.length === 0 ? (
							<p className="cartside__empty">Your cart is empty.</p>
						) : (
							<ul className="cartside__list">
								{items.map(({ product, quantity }) => (
									<li key={product.id} className="cartside__item">
										<img src={product.imageUrl} alt={product.name} className="cartside__img" />
										<div className="cartside__info">
											<div className="cartside__row">
												<strong>{product.name}</strong>
												<span>${product.priceUsd.toFixed(2)}</span>
											</div>
											<div className="cartside__row">
												<label htmlFor={`q-${product.id}`}>Qty</label>
												<input
													id={`q-${product.id}`}
													type="number"
													min={1}
													value={quantity}
													onChange={(e) => setQuantity(product.id, Math.max(1, Number(e.target.value)))}
												/>
												<button className="btn btn--secondary" onClick={() => removeItem(product.id)}>
													<i className="bi bi-trash"></i> Remove
												</button>
											</div>
										</div>
									</li>
								))}
							</ul>
						)}
					</div>
					<footer className="cartside__footer">
						<div className="cartside__subtotal">
							<span>Subtotal</span>
							<strong>${subtotal.toFixed(2)}</strong>
						</div>
						<div className="cartside__actions">
							<button className="btn btn--secondary" onClick={closeCart}><i className="bi bi-bag-plus"></i> Continue Shopping</button>
							<button className="btn btn--primary" onClick={handleCheckout} disabled={items.length === 0}><i className="bi bi-credit-card-2-front"></i> Checkout</button>
						</div>
					</footer>
				</aside>
			</div>
			
			{/* Checkout Modal */}
			<CheckoutModal 
				isOpen={isCheckoutOpen} 
				onClose={handleCloseCheckout} 
			/>
		</>
	)
}


