import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ApiService } from '../services/api'
import ProfileForm from './ProfileForm'

export default function Header() {
	const { toggleCart } = useCart()
	const [isProfileOpen, setIsProfileOpen] = useState(false)
	const location = useLocation()
	const isAuthenticated = ApiService.isAuthenticated()

	return (
		<header className="header">
			<div className="header__brand">
				<Link to="/" aria-label="UNCIEL BRAND Home">UNCIEL BRAND</Link>
			</div>
			<div className="header__center">
				<nav className="header__nav" aria-label="Primary">
					<Link 
						to="/" 
						className={location.pathname === '/' ? 'active' : ''}
					>
						Home
					</Link>
					<Link 
						to="/orders" 
						className={location.pathname === '/orders' ? 'active' : ''}
					>
						<i className="bi bi-clock-history"></i> Orders
					</Link>
				</nav>
			</div>
			<div className="header__actions">
				<form className="search" role="search">
					<i className="bi bi-search" aria-hidden="true"></i>
					<input className="search__input" type="search" placeholder="Search" aria-label="Search products" />
				</form>
				<button 
					className="header__iconbtn" 
					aria-label="Account" 
					title="Account"
					onClick={() => setIsProfileOpen(true)}
				>
					<i className="bi bi-person"></i>
				</button>
				<button className="header__iconbtn" aria-label="Cart" title="Cart" onClick={toggleCart}>
					<i className="bi bi-bag"></i>
				</button>
			</div>
			<ProfileForm isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
		</header>
	)
}


