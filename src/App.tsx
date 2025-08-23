import './App.css'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductsGrid from './components/ProductsGrid'
import Footer from './components/Footer'
import { CartProvider } from './contexts/CartContext'
import { NotificationProvider } from './contexts/NotificationContext'
import CartSidebar from './components/CartSidebar'
import NotificationPopup from './components/NotificationPopup'

export default function App() {
	return (
		<NotificationProvider>
			<CartProvider>
				<Header />
				<Hero />
				<ProductsGrid />
				<Footer />
				<CartSidebar />
				<NotificationPopup />
			</CartProvider>
		</NotificationProvider>
	)
}
