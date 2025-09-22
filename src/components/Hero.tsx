import { useState, useEffect } from 'react'
import { ApiService } from '../services/api'

export default function Hero() {
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [currentUser, setCurrentUser] = useState<any>(null)

	useEffect(() => {
		const checkAuth = () => {
			const authenticated = ApiService.isAuthenticated()
			const user = ApiService.getCurrentUser()
			setIsLoggedIn(authenticated)
			setCurrentUser(user)
		}
		checkAuth()
		
		// Check periodically for auth changes
		const interval = setInterval(checkAuth, 1000)
		return () => clearInterval(interval)
	}, [])
		return (
			<section className="hero">
				<div className="hero__background"></div>
				<div className="hero__content">
					{isLoggedIn && currentUser ? (
						<>
							<h1 className="hero__title">Welcome back, {currentUser.firstName}!</h1>
							<p className="hero__subtitle">Ready to shop for premium merch? Browse our collection below or check your order history.</p>
							<div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
								<a className="btn btn--primary" href="#products">Shop Now</a>
								<a className="btn btn--secondary" href="/orders">View Orders</a>
							</div>
						</>
					) : (
						<>
							<h1 className="hero__title">Your Logo. Your Shirt.</h1>
							<p className="hero__subtitle">Create premium merch in seconds — quality tees designed by UNCIEL BRAND.</p>
							<a className="btn btn--primary" href="#products">Shop Now</a>
						</>
					)}
				</div>
			</section>
		)
}


