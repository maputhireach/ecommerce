import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Header from './components/Header'
import Hero from './components/Hero'
import ProductsGrid from './components/ProductsGrid'
import OrderHistory from './components/OrderHistory'
import Footer from './components/Footer'
import { CartProvider } from './contexts/CartContext'
import { NotificationProvider } from './contexts/NotificationContext'
import CartSidebar from './components/CartSidebar'
import NotificationPopup from './components/NotificationPopup'

// Home page component
function HomePage() {
	return (
		<>
			<Hero />
			<ProductsGrid />
		</>
	)
}

export default function App() {
	return (
		<NotificationProvider>
			<CartProvider>
				<Router>
					<Header />
					<main>
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route path="/orders" element={<OrderHistory />} />
						</Routes>
					</main>
					<Footer />
					<CartSidebar />
					<NotificationPopup />
				</Router>
			</CartProvider>
		</NotificationProvider>
	)
}
