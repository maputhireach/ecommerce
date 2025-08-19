import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductsGrid from './components/ProductsGrid'
import Footer from './components/Footer'
import { CartProvider } from './contexts/CartContext'
import CartSidebar from './components/CartSidebar'

export default function App() {
	return (
		<CartProvider>
			<Header />
			<Hero />
			<ProductsGrid />
			<Footer />
			<CartSidebar />
		</CartProvider>
	)
}
