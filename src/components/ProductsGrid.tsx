import { useMemo, useState } from 'react'
import type { Product } from '../types'
import ProductQuickBuy from './ProductQuickBuy'
import { useCart } from '../contexts/CartContext'

export default function ProductsGrid() {
	const { addItem, openCart } = useCart()
	const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
	const [isQuickBuyOpen, setIsQuickBuyOpen] = useState(false)
	const products: Product[] = useMemo(
		() => [
			{
				id: '1',
				name: 'Classic Tee — Black',
				priceUsd: 24.0,
				imageUrl: '/assets/img/1.jpg',
			},
			{
				id: '2',
				name: 'Classic Tee — White',
				priceUsd: 22.0,
				imageUrl: '/assets/img/2.jpg',
			},
			{
				id: '3',
				name: 'Heavyweight Tee',
				priceUsd: 29.0,
				imageUrl: '/assets/img/3.jpg',
			},
			{
				id: '4',
				name: 'Long Sleeve',
				priceUsd: 32.0,
				imageUrl: '/assets/img/4.jpg',
			},
			{
				id: '5',
				name: 'Premium Collection',
				priceUsd: 35.0,
				imageUrl: '/assets/img/5.jpg',
			},
			{
				id: '6',
				name: 'Summer Collection',
				priceUsd: 28.0,
				imageUrl: '/assets/img/1.jpg',
			},
			{
				id: '7',
				name: 'Winter Edition',
				priceUsd: 38.0,
				imageUrl: '/assets/img/2.jpg',
			},
			{
				id: '8',
				name: 'Limited Edition',
				priceUsd: 42.0,
				imageUrl: '/assets/img/3.jpg',
			},
		],
		[]
	)

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

	return (
		<section id="products" className="products">
			<h2 className="section-title">Featured Products</h2>
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
										onClick={() => {
											addItem(p, 1)
											openCart()
										}}
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
			<ProductQuickBuy
				open={isQuickBuyOpen}
				product={selectedProduct}
				onClose={() => setIsQuickBuyOpen(false)}
			/>
		</section>
	)
}


