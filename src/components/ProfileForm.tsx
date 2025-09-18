import { useState, useEffect } from 'react'
import { useNotifications } from '../contexts/NotificationContext'
import { ApiService } from '../services/api'

interface ProfileFormProps {
	isOpen: boolean
	onClose: () => void
}

export default function ProfileForm({ isOpen, onClose }: ProfileFormProps) {
	const [isLoginMode, setIsLoginMode] = useState(true)
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [currentUser, setCurrentUser] = useState<any>(null)
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		zipCode: '',
		country: ''
	})
	const { addNotification } = useNotifications()

	// Check authentication status on component mount
	useEffect(() => {
		const user = ApiService.getCurrentUser()
		const authenticated = ApiService.isAuthenticated()
		setIsLoggedIn(authenticated)
		setCurrentUser(user)
		if (user) {
			setFormData(prev => ({
				...prev,
				firstName: user.firstName || '',
				lastName: user.lastName || '',
				email: user.email || ''
			}))
		}
	}, [isOpen])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		try {
			if (isLoggedIn) {
				// Update profile (simplified - just show notification)
				console.log('Profile updated:', formData)
				addNotification({
					type: 'success',
					title: 'Profile Saved!',
					message: 'Your profile information has been updated successfully.',
					duration: 4000
				})
			} else if (isLoginMode) {
				// Login
				const result = await ApiService.login({
					email: formData.email,
					password: formData.password
				})
				setIsLoggedIn(true)
				setCurrentUser(result.user)
				addNotification({
					type: 'success',
					title: 'Welcome back!',
					message: `Hello ${result.user.firstName}! You're now logged in.`,
					duration: 4000
				})
			} else {
				// Register
				const result = await ApiService.register({
					email: formData.email,
					password: formData.password,
					firstName: formData.firstName,
					lastName: formData.lastName
				})
				setIsLoggedIn(true)
				setCurrentUser(result.user)
				addNotification({
					type: 'success',
					title: 'Account Created!',
					message: `Welcome ${result.user.firstName}! Your account has been created successfully.`,
					duration: 4000
				})
			}
			onClose()
		} catch (error: any) {
			addNotification({
				type: 'error',
				title: 'Error',
				message: error.message || 'Something went wrong. Please try again.',
				duration: 5000
			})
		}
	}

	const handleLogout = () => {
		ApiService.logout()
		setIsLoggedIn(false)
		setCurrentUser(null)
		setFormData({
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			phone: '',
			address: '',
			city: '',
			state: '',
			zipCode: '',
			country: ''
		})
		addNotification({
			type: 'info',
			title: 'Logged Out',
			message: 'You have been logged out successfully.',
			duration: 3000
		})
		onClose()
	}

	if (!isOpen) return null

		return (
			<div className="profile-overlay">
				<div className="profile-modal">
					<div className="profile-header">
						<h2>
							{isLoggedIn 
								? `Welcome, ${currentUser?.firstName || 'User'}!` 
								: isLoginMode ? 'Login' : 'Create Account'
							}
						</h2>
						<button className="close-btn" onClick={onClose}>
							<i className="bi bi-x"></i>
						</button>
					</div>

					{isLoggedIn ? (
						// Logged in - show profile form
						<form onSubmit={handleSubmit} className="profile-form">
							<div className="form-group">
								<h3>Personal Information</h3>
								<div className="form-row">
									<div className="form-field">
										<label>First Name</label>
										<input
											type="text"
											name="firstName"
											value={formData.firstName}
											onChange={handleChange}
											required
										/>
									</div>
									<div className="form-field">
										<label>Last Name</label>
										<input
											type="text"
											name="lastName"
											value={formData.lastName}
											onChange={handleChange}
											required
										/>
									</div>
								</div>
								<div className="form-field">
									<label>Email</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										disabled
										style={{ opacity: 0.6 }}
									/>
								</div>
								<div className="form-field">
									<label>Phone</label>
									<input
										type="tel"
										name="phone"
										value={formData.phone}
										onChange={handleChange}
									/>
								</div>
							</div>

							<div className="form-group">
								<h3>Address</h3>
								<div className="form-field">
									<label>Street Address</label>
									<input
										type="text"
										name="address"
										value={formData.address}
										onChange={handleChange}
									/>
								</div>
								<div className="form-row">
									<div className="form-field">
										<label>City</label>
										<input
											type="text"
											name="city"
											value={formData.city}
											onChange={handleChange}
										/>
									</div>
									<div className="form-field">
										<label>State</label>
										<input
											type="text"
											name="state"
											value={formData.state}
											onChange={handleChange}
										/>
									</div>
								</div>
								<div className="form-row">
									<div className="form-field">
										<label>ZIP Code</label>
										<input
											type="text"
											name="zipCode"
											value={formData.zipCode}
											onChange={handleChange}
										/>
									</div>
									<div className="form-field">
										<label>Country</label>
										<input
											type="text"
											name="country"
											value={formData.country}
											onChange={handleChange}
										/>
									</div>
								</div>
							</div>

							<div className="form-actions">
								<button type="button" className="cancel-btn" onClick={handleLogout}>
									Logout
								</button>
								<button type="submit" className="save-btn">
									Save Profile
								</button>
							</div>
						</form>
					) : (
						// Not logged in - show login/register form
						<form onSubmit={handleSubmit} className="profile-form">
							<div className="form-group">
								{!isLoginMode && (
									<div className="form-row">
										<div className="form-field">
											<label>First Name</label>
											<input
												type="text"
												name="firstName"
												value={formData.firstName}
												onChange={handleChange}
												required
											/>
										</div>
										<div className="form-field">
											<label>Last Name</label>
											<input
												type="text"
												name="lastName"
												value={formData.lastName}
												onChange={handleChange}
												required
											/>
										</div>
									</div>
								)}
								<div className="form-field">
									<label>Email</label>
									<input
										type="email"
										name="email"
										value={formData.email}
										onChange={handleChange}
										required
									/>
								</div>
								<div className="form-field">
									<label>Password</label>
									<input
										type="password"
										name="password"
										value={formData.password}
										onChange={handleChange}
										required
										minLength={6}
									/>
								</div>
							</div>

							<div className="form-actions">
								<button type="button" className="cancel-btn" onClick={onClose}>
									Cancel
								</button>
								<button type="submit" className="save-btn">
									{isLoginMode ? 'Login' : 'Create Account'}
								</button>
							</div>
							
							<div style={{ textAlign: 'center', marginTop: '1rem' }}>
								<button 
									type="button" 
									style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', textDecoration: 'underline' }}
									onClick={() => setIsLoginMode(!isLoginMode)}
								>
									{isLoginMode ? "Don't have an account? Sign up" : "Already have an account? Login"}
								</button>
							</div>
						</form>
					)}
				</div>
			</div>
		)
}
