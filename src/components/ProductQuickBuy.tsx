import { useMemo, useState, useEffect } from 'react'
import type { Product } from '../types'
import { useCart } from '../contexts/CartContext'
import { useNotifications } from '../contexts/NotificationContext'
import { OrderService } from '../services/orderService'

type Props = {
	open: boolean
	product: Product | null
	onClose: () => void
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





	const total = useMemo(() => {
		const price = product?.priceUsd ?? 0
		return price * quantity
	}, [product, quantity])



	const handleCompletePurchase = async () => {
		console.log('🚀 ProductQuickBuy: handleCompletePurchase called')
		if (!product) {
			console.log('❌ No product available')
			return
		}

		console.log('📦 Creating order for product:', product)
		
		// Create order in localStorage
		const order = OrderService.createOrder([{
			productId: product.id,
			productName: product.name,
			productImage: product.imageUrl,
			quantity: quantity,
			price: product.priceUsd
		}])
		
		console.log('✅ Order created successfully:', order)
		
		// Show success notification
		addNotification({
			type: 'success',
			title: 'Order Placed Successfully!',
			message: `Your order for ${product.name} (${quantity} ${quantity === 1 ? 'item' : 'items'}) has been placed! Order ID: ${order.id}`,
			duration: 6000
		})
		
		// Reset form and close modal
		resetForm()
		onClose()
	}

	const handleBuyNow = () => {
		console.log('🔎 ProductQuickBuy: Buy Now button clicked')
		// Complete purchase directly without profile step
		handleCompletePurchase()
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
		// Reset quantity when closing
		setQuantity(1)
	}

	if (!product) return <Modal open={open} onClose={onClose} title="Quick Buy">Loading…</Modal>

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


