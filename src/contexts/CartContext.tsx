import { createContext, useContext, useMemo, useState } from 'react'
import type { Product } from '../types'

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
	}

	function removeItem(productId: string) {
		setItems((prev) => prev.filter((it) => it.product.id !== productId))
	}

	function setQuantity(productId: string, quantity: number) {
		setItems((prev) => prev.map((it) => (it.product.id === productId ? { ...it, quantity: Math.max(1, quantity) } : it)))
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


