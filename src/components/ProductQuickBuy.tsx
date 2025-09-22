import { useMemo, useState, useEffect } from 'react'
import type { Product } from '../types'
import { useCart } from '../contexts/CartContext'
import { useNotifications } from '../contexts/NotificationContext'
import { ApiService } from '../services/api'

type Props = {
	open: boolean
	product: Product | null
	onClose: () => void
}

type ProfileData = {
	email: string
	phone: string
	firstName: string
	lastName: string
}

function Modal({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) {
	useEffect(() => {
		if (open) {
			// Prevent body scrolling when modal is open
			document.body.style.overflow = 'hidden'
		} else {
			// Restore body scrolling when modal is closed
			document.body.style.overflow = 'unset'
		}

		// Cleanup function to restore scrolling when component unmounts
		return () => {
			document.body.style.overflow = 'unset'
		}
	}, [open])

	if (!open) return null
	return (
		<div className="modal__backdrop" onClick={onClose}>
			<div className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(e) => e.stopPropagation()}>
				<div className="modal__header">
					<h3 id="modal-title" className="modal__title">{title}</h3>
					<button className="modal__close" onClick={onClose} aria-label="Close"><i className="bi bi-x"></i></button>
				</div>
				<div className="modal__body">{children}</div>
			</div>
		</div>
	)
}

export default function ProductQuickBuy({ open, product, onClose }: Props) {
	const { addItem, openCart } = useCart()
	const { addNotification } = useNotifications()
	const [quantity, setQuantity] = useState<number>(1)
	const [step, setStep] = useState<'product' | 'profile'>('product')
	const [profileData, setProfileData] = useState<ProfileData>({
		email: '',
		phone: '',
		firstName: '',
		lastName: ''
	})
	const [loadingUserData, setLoadingUserData] = useState<boolean>(false)

	// Load user profile data when component opens
	useEffect(() => {
		if (open && ApiService.isAuthenticated()) {
			loadUserProfile()
		}
	}, [open])

	const loadUserProfile = async () => {
		try {
			setLoadingUserData(true)
			const userProfile = await ApiService.getUserProfile()
			
			// Auto-fill form with user data
			setProfileData({
				email: userProfile.email || '',
				firstName: userProfile.firstName || '',
				lastName: userProfile.lastName || '',
				phone: userProfile.profile?.phone || ''
			})
			
			addNotification({
				type: 'info',
				title: 'Info Pre-filled',
				message: 'Your profile information has been automatically filled in.',
				duration: 3000
			})
		} catch (error) {
			console.error('Failed to load user profile:', error)
			// Don't show error notification, just use empty form
		} finally {
			setLoadingUserData(false)
		}
	}

	const total = useMemo(() => {
		const price = product?.priceUsd ?? 0
		return price * quantity
	}, [product, quantity])

	const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setProfileData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleBuyNow = () => {
		setStep('profile')
	}

	const handleBackToProduct = () => {
		setStep('product')
	}

	const handleCompletePurchase = async () => {
		try {
			// Check if user is authenticated
			if (!ApiService.isAuthenticated()) {
				addNotification({
					type: 'error',
					title: 'Authentication Required',
					message: 'Please log in to complete your purchase.',
					duration: 4000
				})
				return
			}

			// Validate required fields
			if (!profileData.email || !profileData.firstName || !profileData.lastName) {
				addNotification({
					type: 'error',
					title: 'Missing Information',
					message: 'Please fill in all required fields.',
					duration: 4000
				})
				return
			}

			if (!product) return

			// Save/update user profile if any information was changed
			try {
				await ApiService.updateUserProfile({
					firstName: profileData.firstName,
					lastName: profileData.lastName,
					profile: {
						phone: profileData.phone
					}
				})
			} catch (profileError) {
				console.error('Failed to update profile:', profileError)
				// Continue with order creation even if profile update fails
			}

			// Create order data
			const orderData = {
				items: [{
					productId: product.id,
					quantity: quantity
				}]
			}

			// Create the order
			const order = await ApiService.createOrder(orderData)
			
			// Show success notification
			addNotification({
				type: 'success',
				title: 'Order Placed Successfully!',
				message: `Your order for ${product.name} has been placed. Order ID: ${order.id.slice(-8).toUpperCase()}`,
				duration: 6000
			})
			
			// Reset form and close modal
			resetForm()
			onClose()
			
		} catch (error) {
			console.error('Order creation failed:', error)
			addNotification({
				type: 'error',
				title: 'Order Failed',
				message: 'There was an error placing your order. Please try again.',
				duration: 5000
			})
		}
	}

	const handleAddToCart = () => {
		if (product) {
			addItem(product, quantity)
			openCart()
			onClose()
			
			// Show success notification
			addNotification({
				type: 'success',
				title: 'Added to Cart!',
				message: `${product.name} (${quantity} ${quantity === 1 ? 'item' : 'items'}) has been added to your cart.`,
				duration: 3000
			})
		}
	}

	const resetForm = () => {
		setStep('product')
		setProfileData({
			email: '',
			phone: '',
			firstName: '',
			lastName: ''
		})
	}

	if (!product) return <Modal open={open} onClose={onClose} title="Quick Buy">Loading…</Modal>

	if (step === 'profile') {
		return (
			<Modal open={open} onClose={() => { resetForm(); onClose() }} title="Complete Your Purchase">
				<div className="quickbuy">
					<img src={product.imageUrl} alt={product.name} className="quickbuy__image" />
					<div>
						<h4 className="quickbuy__name">{product.name}</h4>
						<p className="quickbuy__price">${product.priceUsd.toFixed(2)} × {quantity} = ${total.toFixed(2)}</p>
					</div>
				</div>
				
				{loadingUserData && (
					<div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
						<p>Loading your profile information...</p>
					</div>
				)}
				
				<form onSubmit={(e) => { e.preventDefault(); handleCompletePurchase() }} className="profile-form">
					<div className="form-group">
						<h3>Contact Information</h3>
						<div className="form-row">
							<div className="form-field">
								<label>First Name *</label>
								<input
									type="text"
									name="firstName"
									value={profileData.firstName}
									onChange={handleProfileChange}
									placeholder="John"
									required
								/>
							</div>
							<div className="form-field">
								<label>Last Name *</label>
								<input
									type="text"
									name="lastName"
									value={profileData.lastName}
									onChange={handleProfileChange}
									placeholder="Doe"
									required
								/>
							</div>
						</div>
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

					<div className="modal__footer">
						<button type="button" className="btn btn--secondary" onClick={() => { resetForm(); onClose() }}>
							<i className="bi bi-x"></i> Cancel
						</button>
						<button type="button" className="btn btn--secondary" onClick={handleBackToProduct}>
							<i className="bi bi-arrow-left"></i> Back
						</button>
						<button type="submit" className="btn btn--primary">
							<i className="bi bi-check-circle"></i> Complete Purchase (${total.toFixed(2)})
						</button>
					</div>
				</form>
			</Modal>
		)
	}

	return (
		<Modal open={open} onClose={onClose} title="Quick Buy">
			<div className="quickbuy">
				<img src={product.imageUrl} alt={product.name} className="quickbuy__image" />
				<div>
					<h4 className="quickbuy__name">{product.name}</h4>
					<p className="quickbuy__price">${product.priceUsd.toFixed(2)}</p>
				</div>
			</div>
			<div className="quickbuy__row">
				<label htmlFor="qty">Quantity</label>
				<input id="qty" type="number" min={1} value={quantity} onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))} />
			</div>
			<div className="quickbuy__row">
				<span>Total</span>
				<strong>${total.toFixed(2)}</strong>
			</div>
			<div className="modal__footer">
				<button className="btn btn--secondary" onClick={handleAddToCart}>
					<i className="bi bi-bag-plus"></i> Add to Cart
				</button>
				<button className="btn btn--primary" onClick={handleBuyNow}>
					<i className="bi bi-lightning-charge"></i> Buy Now
				</button>
			</div>
		</Modal>
	)
}


