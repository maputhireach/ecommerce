import { useMemo, useState, useEffect } from 'react'
import type { Product } from '../types'

type Props = {
	open: boolean
	product: Product | null
	onClose: () => void
}

type ProfileData = {
	email: string
	phone: string
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

import { useCart } from '../contexts/CartContext'

export default function ProductQuickBuy({ open, product, onClose }: Props) {
	const { addItem, openCart } = useCart()
	const [quantity, setQuantity] = useState<number>(1)
	const [step, setStep] = useState<'product' | 'profile'>('product')
	const [profileData, setProfileData] = useState<ProfileData>({
		email: '',
		phone: ''
	})

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

	const handleCompletePurchase = () => {
		// Here you would typically send the order to your backend
		console.log('Order completed:', {
			product,
			quantity,
			total,
			profile: profileData
		})
		
		// Reset form and close modal
		setStep('product')
		setProfileData({
			email: '',
			phone: ''
		})
		onClose()
	}

	const resetForm = () => {
		setStep('product')
		setProfileData({
			email: '',
			phone: ''
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
				
				<form onSubmit={(e) => { e.preventDefault(); handleCompletePurchase() }} className="profile-form">
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

					<div className="modal__footer">
						<button type="button" className="btn btn--secondary" onClick={() => { resetForm(); onClose() }}>
							<i className="bi bi-x"></i> Cancel
						</button>
						<button type="button" className="btn btn--secondary" onClick={handleBackToProduct}>
							<i className="bi bi-arrow-left"></i> Back
						</button>
						<button type="submit" className="btn btn--primary">
							<i className="bi bi-check-circle"></i> Complete Purchase
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
				<button className="btn btn--secondary" onClick={() => { if (product) { addItem(product, quantity); openCart(); onClose() } }}>
					<i className="bi bi-bag-plus"></i> Add to Cart
				</button>
				<button className="btn btn--primary" onClick={handleBuyNow}>
					<i className="bi bi-lightning-charge"></i> Buy Now
				</button>
			</div>
		</Modal>
	)
}


