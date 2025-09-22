import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useCart } from '../contexts/CartContext'
import { ApiService } from '../services/api'
import ProfileForm from './ProfileForm'

export default function Header() {
	const { toggleCart } = useCart()
	const [isProfileOpen, setIsProfileOpen] = useState(false)
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [currentUser, setCurrentUser] = useState<any>(null)
	const location = useLocation()

	// Check authentication status
	useEffect(() => {
		const checkAuth = () => {
			const authenticated = ApiService.isAuthenticated()
			const user = ApiService.getCurrentUser()
			setIsLoggedIn(authenticated)
			setCurrentUser(user)
		}
		
		// Check on mount
		checkAuth()
		
		// Check periodically to catch login state changes
		const interval = setInterval(checkAuth, 1000)
		
		return () => clearInterval(interval)
	}, [])

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
					{(currentUser?.isAdmin || currentUser?.email === 'admin@example.com') && (
						<Link 
							to="/admin" 
							className={location.pathname === '/admin' ? 'active' : ''}
							style={{ color: '#fbbf24' }}
						>
							<i className="bi bi-shield-check"></i> Admin
						</Link>
					)}
				</nav>
			</div>
			<div className="header__actions">
				<form className="search" role="search">
					<i className="bi bi-search" aria-hidden="true"></i>
					<input className="search__input" type="search" placeholder="Search" aria-label="Search products" />
				</form>
				<button 
					className={`header__iconbtn ${isLoggedIn ? 'header__iconbtn--active' : ''}`}
					aria-label={isLoggedIn ? `Account - ${currentUser?.firstName}` : 'Login/Register'}
					title={isLoggedIn ? `Logged in as ${currentUser?.firstName} ${currentUser?.lastName}` : 'Login or Create Account'}
					onClick={() => setIsProfileOpen(true)}
				>
					<i className={`bi ${isLoggedIn ? 'bi-person-check' : 'bi-person'}`}></i>
					{isLoggedIn && currentUser?.firstName && (
						<span style={{ fontSize: '12px', marginLeft: '4px', display: 'none' }}>
							{currentUser.firstName}
						</span>
					)}
				</button>
				<button className="header__iconbtn" aria-label="Cart" title="Cart" onClick={toggleCart}>
					<i className="bi bi-bag"></i>
				</button>
			</div>
			<ProfileForm isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
		</header>
	)
}