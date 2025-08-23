import { createContext, useContext, useMemo, useState } from 'react'
import type { Product } from '../types'
import { useNotifications } from './NotificationContext'

export type CartItem = {
	product: Product
	quantity: number
}

type CartContextValue = {
	items: CartItem[]
	isOpen: boolean
	openCart: () => void
	closeCart: () => void
	toggleCart: () => void
	addItem: (product: Product, quantity?: number) => void
	removeItem: (productId: string) => void
	setQuantity: (productId: string, quantity: number) => void
	subtotal: number
}

const CartContext = createContext<CartContextValue | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
	const [items, setItems] = useState<CartItem[]>([])
	const [isOpen, setIsOpen] = useState(false)
	const { addNotification } = useNotifications()

	function openCart() { setIsOpen(true) }
	function closeCart() { setIsOpen(false) }
	function toggleCart() { setIsOpen((v) => !v) }

	function addItem(product: Product, quantity: number = 1) {
		setItems((prev) => {
			const index = prev.findIndex((it) => it.product.id === product.id)
			if (index >= 0) {
				const updated = [...prev]
				updated[index] = { ...updated[index], quantity: updated[index].quantity + quantity }
				return updated
			}
			return [...prev, { product, quantity }]
		})

		// Show success notification
		addNotification({
			type: 'success',
			title: 'Added to Cart!',
			message: `${product.name} has been added to your cart.`,
			duration: 3000
		})
	}

	function removeItem(productId: string) {
		const itemToRemove = items.find(item => item.product.id === productId)
		setItems((prev) => prev.filter((it) => it.product.id !== productId))

		// Show info notification
		if (itemToRemove) {
			addNotification({
				type: 'info',
				title: 'Removed from Cart',
				message: `${itemToRemove.product.name} has been removed from your cart.`,
				duration: 3000
			})
		}
	}

	function setQuantity(productId: string, quantity: number) {
		const oldQuantity = items.find(item => item.product.id === productId)?.quantity || 0
		setItems((prev) => prev.map((it) => (it.product.id === productId ? { ...it, quantity: Math.max(1, quantity) } : it)))

		// Show notification for quantity changes
		const item = items.find(item => item.product.id === productId)
		if (item && quantity !== oldQuantity) {
			if (quantity > oldQuantity) {
				addNotification({
					type: 'success',
					title: 'Quantity Updated',
					message: `Increased ${item.product.name} quantity to ${quantity}.`,
					duration: 2500
				})
			} else if (quantity < oldQuantity) {
				addNotification({
					type: 'info',
					title: 'Quantity Updated',
					message: `Decreased ${item.product.name} quantity to ${quantity}.`,
					duration: 2500
				})
			}
		}
	}

	const subtotal = useMemo(() => {
		return items.reduce((sum, it) => sum + it.product.priceUsd * it.quantity, 0)
	}, [items])

	const value: CartContextValue = {
		items,
		isOpen,
		openCart,
		closeCart,
		toggleCart,
		addItem,
		removeItem,
		setQuantity,
		subtotal,
	}

	return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart(): CartContextValue {
	const ctx = useContext(CartContext)
	if (!ctx) throw new Error('useCart must be used within CartProvider')
	return ctx
}


