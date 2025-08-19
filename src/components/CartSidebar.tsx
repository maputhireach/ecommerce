import { useCart } from '../contexts/CartContext'
import { useState, useEffect } from 'react'

type ProfileData = {
	email: string
	phone: string
}

export default function CartSidebar() {
	const { items, isOpen, closeCart, removeItem, setQuantity, subtotal } = useCart()
	const [step, setStep] = useState<'cart' | 'checkout'>('cart')
	const [profileData, setProfileData] = useState<ProfileData>({
		email: '',
		phone: ''
	})

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

	const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setProfileData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleCheckout = () => {
		setStep('checkout')
	}

	const handleBackToCart = () => {
		setStep('cart')
	}

	const handleCompleteOrder = () => {
		// Here you would typically send the order to your backend
		console.log('Order completed:', {
			items,
			subtotal,
			profile: profileData
		})
		
		// Reset form and close modal
		setStep('cart')
		setProfileData({
			email: '',
			phone: ''
		})
		closeCart()
	}

	const resetForm = () => {
		setStep('cart')
		setProfileData({
			email: '',
			phone: ''
		})
	}

	if (step === 'checkout') {
		return (
			<div className={`cartside${isOpen ? ' cartside--open' : ''}`} aria-hidden={!isOpen}>
				<div className="cartside__backdrop" onClick={() => { resetForm(); closeCart() }} />
				<aside className="cartside__panel" aria-label="Checkout">
					<header className="cartside__header">
						<h3 className="cartside__title"><i className="bi bi-credit-card-2-front me-2"></i> Checkout</h3>
						<button className="cartside__close" onClick={() => { resetForm(); closeCart() }} aria-label="Close"><i className="bi bi-x-lg"></i></button>
					</header>
					<div className="cartside__body">
						<div className="checkout-summary">
							<h4>Order Summary</h4>
							<ul className="checkout-items">
								{items.map(({ product, quantity }) => (
									<li key={product.id} className="checkout-item">
										<img src={product.imageUrl} alt={product.name} className="checkout-item__img" />
										<div className="checkout-item__info">
											<strong>{product.name}</strong>
											<span>Qty: {quantity} × ${product.priceUsd.toFixed(2)}</span>
										</div>
									</li>
								))}
							</ul>
							<div className="checkout-total">
								<strong>Total: ${subtotal.toFixed(2)}</strong>
							</div>
						</div>
						
						<form onSubmit={(e) => { e.preventDefault(); handleCompleteOrder() }} className="profile-form">
							<div className="form-group">
								<h3>Contact Information</h3>
								<div className="form-field">
									<label>Email *</label>
									<input
										type="email"
										name="email"
										value={profileData.email}
										onChange={handleProfileChange}
										placeholder="your.email@example.com"
										required
									/>
								</div>
								<div className="form-field">
									<label>Phone Number</label>
									<input
										type="tel"
										name="phone"
										value={profileData.phone}
										onChange={handleProfileChange}
										placeholder="+1 (555) 123-4567"
									/>
								</div>
							</div>
						</form>
					</div>
					<footer className="cartside__footer">
						<div className="cartside__actions">
							<button className="btn btn--secondary" onClick={handleBackToCart}>
								<i className="bi bi-arrow-left"></i> Back to Cart
							</button>
							<button className="btn btn--primary" onClick={handleCompleteOrder}>
								<i className="bi bi-check-circle"></i> Complete Order
							</button>
						</div>
					</footer>
				</aside>
			</div>
		)
	}

	return (
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
	)
}


