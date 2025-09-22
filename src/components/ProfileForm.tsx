import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../contexts/NotificationContext'
import { ApiService } from '../services/api'

interface ProfileFormProps {
	isOpen: boolean
	onClose: () => void
}

export default function ProfileForm({ isOpen, onClose }: ProfileFormProps) {
	const navigate = useNavigate()
	const [isLoginMode, setIsLoginMode] = useState(true)
	const [isLoggedIn, setIsLoggedIn] = useState(false)
	const [currentUser, setCurrentUser] = useState<any>(null)
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		phone: ''
	})
	const { addNotification } = useNotifications()

	// Check authentication status on component mount
	useEffect(() => {
		const user = ApiService.getCurrentUser()
		const authenticated = ApiService.isAuthenticated()
		setIsLoggedIn(authenticated)
		setCurrentUser(user)
		if (user && authenticated) {
			// Load full profile data from API
			loadUserProfile()
		}
	}, [isOpen])

	const loadUserProfile = async () => {
		try {
			const userProfile = await ApiService.getUserProfile()
			setFormData({
				firstName: userProfile.firstName || '',
				lastName: userProfile.lastName || '',
				email: userProfile.email || '',
				password: '',
				phone: userProfile.profile?.phone || ''
			})
		} catch (error) {
			console.error('Failed to load user profile:', error)
			// Fallback to localStorage data
			const user = ApiService.getCurrentUser()
			if (user) {
				setFormData(prev => ({
					...prev,
					firstName: user.firstName || '',
					lastName: user.lastName || '',
					email: user.email || ''
				}))
			}
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		
		console.log('🚀 Form submission started');
		console.log('📄 Form data:', { email: formData.email, hasPassword: !!formData.password });
		console.log('🔄 Is login mode:', isLoginMode);
		
			try {
				if (isLoggedIn) {
					// Update profile
					console.log('Profile updated:', formData)
					
					await ApiService.updateUserProfile({
						firstName: formData.firstName,
						lastName: formData.lastName,
						profile: {
							phone: formData.phone
						}
					})
					
					addNotification({
						type: 'success',
						title: 'Profile Saved!',
						message: 'Your profile information has been updated successfully.',
						duration: 4000
					})
				} else if (isLoginMode) {
				// Login
				console.log('🔑 Attempting login...');
				console.log('📧 Email entered:', `"${formData.email}"`);
				console.log('🔒 Password length:', formData.password.length);
				console.log('🧹 Email after trim:', `"${formData.email.trim()}"`);
				
				if (!formData.email || !formData.password) {
					throw new Error('Please fill in both email and password');
				}
				
				// Additional validation
				const trimmedEmail = formData.email.trim().toLowerCase();
				if (!trimmedEmail.includes('@')) {
					throw new Error('Please enter a valid email address');
				}
				
				const result = await ApiService.login({
					email: trimmedEmail,
					password: formData.password
				})
				
				console.log('✅ Login result:', result);
				setIsLoggedIn(true)
				setCurrentUser(result.user)
				
				// Close modal first
				onClose()
				
				// Show success notification
				addNotification({
					type: 'success',
					title: 'Welcome back!',
					message: `Hello ${result.user.firstName}! You're now logged in.`,
					duration: 4000
				})
				
				// Navigate to home page to refresh the view
				setTimeout(() => {
					navigate('/', { replace: true })
				}, 500)
			} else {
				// Register
				console.log('📁 Attempting registration...');
				
				if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
					throw new Error('Please fill in all required fields');
				}
				
				if (formData.password.length < 6) {
					throw new Error('Password must be at least 6 characters long');
				}
				
				const result = await ApiService.register({
					email: formData.email.trim(),
					password: formData.password,
					firstName: formData.firstName.trim(),
					lastName: formData.lastName.trim()
				})
				
				console.log('✅ Registration result:', result);
				setIsLoggedIn(true)
				setCurrentUser(result.user)
				
				// Close modal first
				onClose()
				
				// Show success notification
				addNotification({
					type: 'success',
					title: 'Account Created!',
					message: `Welcome ${result.user.firstName}! Your account has been created successfully.`,
					duration: 4000
				})
				
				// Navigate to home page to refresh the view
				setTimeout(() => {
					navigate('/', { replace: true })
				}, 500)
			}
		} catch (error: any) {
			console.error('❌ Form submission error:', error);
			
			let errorMessage = 'Something went wrong. Please try again.';
			
			if (error.message) {
				errorMessage = error.message;
			} else if (error.response?.data?.error) {
				errorMessage = error.response.data.error;
			}
			
			addNotification({
				type: 'error',
				title: isLoginMode ? 'Login Failed' : 'Registration Failed',
				message: errorMessage,
				duration: 6000
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
			phone: ''
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
