import { useState } from 'react'
import { useNotifications } from '../contexts/NotificationContext'

interface ProfileFormProps {
	isOpen: boolean
	onClose: () => void
}

export default function ProfileForm({ isOpen, onClose }: ProfileFormProps) {
	const [formData, setFormData] = useState({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		state: '',
		zipCode: '',
		country: ''
	})
	const { addNotification } = useNotifications()

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target
		setFormData(prev => ({
			...prev,
			[name]: value
		}))
	}

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault()
		console.log('Profile updated:', formData)
		
		// Show success notification
		addNotification({
			type: 'success',
			title: 'Profile Saved!',
			message: 'Your profile information has been updated successfully.',
			duration: 4000
		})
		
		onClose()
	}

	if (!isOpen) return null

	return (
		<div className="profile-overlay">
			<div className="profile-modal">
				<div className="profile-header">
					<h2>Account Profile</h2>
					<button className="close-btn" onClick={onClose}>
						<i className="bi bi-x"></i>
					</button>
				</div>

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
								required
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
						<button type="button" className="cancel-btn" onClick={onClose}>
							Cancel
						</button>
						<button type="submit" className="save-btn">
							Save Profile
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}
