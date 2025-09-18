import { useState, useEffect } from 'react'
import type { Product } from '../types.ts'
import ProductQuickBuy from './ProductQuickBuy'
import { useCart } from '../contexts/CartContext'
import { useNotifications } from '../contexts/NotificationContext'
import { ApiService } from '../services/api'

export default function ProductsGrid() {
	const { addItem, openCart } = useCart()
	const { addNotification } = useNotifications()
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false)
	const [products, setProducts] = useState<Product[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Fetch products from backend
	useEffect(() => {
		const fetchProducts = async () => {
			try {
				setLoading(true)
				setError(null)
				console.log('Fetching products from API...')
				
				const fetchedProducts = await ApiService.getProducts()
				console.log('Products fetched:', fetchedProducts)
				
				if (fetchedProducts && fetchedProducts.length > 0) {
					setProducts(fetchedProducts)
					console.log('Products set successfully')
				} else {
					throw new Error('No products received from API')
				}
			} catch (err) {
				console.error('Failed to fetch products:', err)
				setError(`API connection failed - Using sample data. Backend may be unreachable.`)
				
				// Fallback to sample data if API fails
				setProducts([
					{
						id: '1',
						name: 'Classic Tee — Black',
						description: 'Comfortable premium cotton t-shirt in classic black',
						priceUsd: 24.99,
						imageUrl: '/assets/img/1.jpg',
						stockQuantity: 50,
						category: 'Clothing',
						isActive: true
					},
					{
						id: '2',
						name: 'Classic Tee — White',
						description: 'Premium cotton t-shirt in crisp white color',
						priceUsd: 22.99,
						imageUrl: '/assets/img/2.jpg',
						stockQuantity: 45,
						category: 'Clothing',
						isActive: true
					},
					{
						id: '3',
						name: 'Heavyweight Tee',
						description: 'Durable heavyweight cotton t-shirt for lasting comfort',
						priceUsd: 29.99,
						imageUrl: '/assets/img/3.jpg',
						stockQuantity: 30,
						category: 'Clothing',
						isActive: true
					},
					{
						id: '4',
						name: 'Long Sleeve Premium',
						description: 'Premium long sleeve shirt perfect for layering',
						priceUsd: 32.99,
						imageUrl: '/assets/img/4.jpg',
						stockQuantity: 35,
						category: 'Clothing',
						isActive: true
					},
					{
						id: '5',
						name: 'Designer Collection Tee',
						description: 'Limited edition designer t-shirt with premium finish',
						priceUsd: 39.99,
						imageUrl: '/assets/img/5.jpg',
						stockQuantity: 25,
						category: 'Clothing',
						isActive: true
					}
				])
			} finally {
				setLoading(false)
			}
		}

		fetchProducts()
	}, [])

	const scrollLeft = () => {
		const grid = document.querySelector('.products__grid') as HTMLElement
		if (grid) {
			grid.scrollBy({ left: -240, behavior: 'smooth' })
		}
	}

	const scrollRight = () => {
		const grid = document.querySelector('.products__grid') as HTMLElement
		if (grid) {
			grid.scrollBy({ left: 240, behavior: 'smooth' })
		}
	}

	const handleAddToCart = (product: Product) => {
		addItem(product, 1)
		openCart()
		
		// Show success notification
		addNotification({
			type: 'success',
			title: 'Added to Cart!',
			message: `${product.name} has been added to your cart.`,
			duration: 3000
		})
	}

	return (
		<section id="products" className="products">
			<h2 className="section-title">Featured Products</h2>
			{error && (
				<div style={{ textAlign: 'center', padding: '1rem', color: '#f59e0b' }}>
					⚠️ {error}
				</div>
			)}
			{loading ? (
				<div style={{ textAlign: 'center', padding: '2rem' }}>
					<div>Loading products...</div>
				</div>
			) : (
				<div className="products__container">
					<button className="products__nav products__nav--left" onClick={scrollLeft} aria-label="Scroll left">
						<i className="bi bi-chevron-left"></i>
					</button>
					<div className="products__grid">
						{products.map((p) => (
							<article key={p.id} className="product-card">
								<img className="product-card__image" src={p.imageUrl} alt={p.name} />
								<div className="product-card__body">
									<h3 className="product-card__title">{p.name}</h3>
									<p className="product-card__price">${p.priceUsd.toFixed(2)}</p>
									<div className="product-card__actions">
										<button
											className="btn btn--secondary"
											type="button"
											onClick={() => {
												setSelectedProduct(p)
												setIsQuickBuyOpen(true)
											}}
										>
											Quick Buy
										</button>
										<button
											className="btn btn--primary"
											type="button"
											onClick={() => handleAddToCart(p)}
										>
											Add to Cart
										</button>
									</div>
								</div>
							</article>
						))}
					</div>
					<button className="products__nav products__nav--right" onClick={scrollRight} aria-label="Scroll right">
						<i className="bi bi-chevron-right"></i>
					</button>
				</div>
			)}
			<ProductQuickBuy
				open={isQuickBuyOpen}
				product={selectedProduct}
				onClose={() => setIsQuickBuyOpen(false)}
			/>
		</section>
	)
}


