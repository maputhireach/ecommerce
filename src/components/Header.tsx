import { useState } from 'react'
import { useCart } from '../contexts/CartContext'
import ProfileForm from './ProfileForm'

export default function Header() {
	const { toggleCart } = useCart()
	const [isProfileOpen, setIsProfileOpen] = useState(false)

	return (
		<header className="header">
			<div className="header__brand">
				<a href="#" aria-label="UNCIEL BRAND Home">UNCIEL BRAND</a>
			</div>
			<nav className="header__nav" aria-label="Primary"></nav>
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


