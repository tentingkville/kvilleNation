import React, { useState, useEffect, useContext } from 'react';
import '../styles/profile.css'; // Add a CSS file for styling
import UserContext from '../userContext.js';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function Profile() {
    const { user, setUser } = useContext(UserContext);
    const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        if (!user.isAuthenticated) {
            navigate('/login'); // Redirect if the user is not authenticated
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async () => {
        const { email, password, confirmPassword } = formData;
    
        console.log('Updating profile with:', { email, password });
    
        // Check if passwords match
        if (password && password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            setSuccessMessage('');
            return;
        }
    
        try {
            let success = false;
    
            // Update email if provided
            if (email) {
                console.log('Sending email update request...');
                const emailResponse = await fetch(`${API_BASE_URL}/api/profile/update-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ email }),
                });
    
                console.log('Email update response:', emailResponse);
    
                if (emailResponse.ok) {
                    const emailData = await emailResponse.json();
                    console.log('Email update successful:', emailData);
                    setUser((prevUser) => ({ ...prevUser, email: emailData.email })); // Update context
                    success = true;
                } else {
                    const errorData = await emailResponse.json();
                    console.log('Email update failed:', errorData);
                    setErrorMessage(errorData.error || 'Failed to update email.');
                    return;
                }
            }
    
            // Update password if provided
            if (password) {
                console.log('Sending password update request...');
                const passwordResponse = await fetch(`${API_BASE_URL}/api/profile/update-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                    body: JSON.stringify({ oldPassword: password, newPassword: password }),
                });
    
                console.log('Password update response:', passwordResponse);
    
                if (passwordResponse.ok) {
                    console.log('Password update successful');
                    success = true;
                } else {
                    const errorData = await passwordResponse.json();
                    console.log('Password update failed:', errorData);
                    setErrorMessage(errorData.error || 'Failed to update password.');
                    return;
                }
            }
    
            // Show success message and clear form if any updates were successful
            if (success) {
                setSuccessMessage('Profile updated successfully!');
                setErrorMessage('');
                setFormData({ email: '', password: '', confirmPassword: '' }); // Reset form
            }
        } catch (error) {
            console.error('Error during profile update:', error);
            setErrorMessage('An unexpected error occurred.');
            setSuccessMessage('');
        }
    };

    return (
        <div className="profile-container">
            <h1>Welcome, {user.firstName}!</h1>
            <p className="profile-greeting">We're glad to have you here. Manage your profile below.</p>

            <div className="profile-form">
            <label>
                Update Email:
                <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    onBlur={(e) => handleChange(e)} // Ensure value is captured on blur
                    placeholder="Enter your new email"
                />
            </label>
            <label>
                Update Password:
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    onBlur={(e) => handleChange(e)}
                    placeholder="Enter your new password"
                />
            </label>
            <label>
                Confirm Password:
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    onBlur={(e) => handleChange(e)}
                    placeholder="Confirm your new password"
                />
            </label>
                <button className="profile-update-btn" onClick={handleUpdate}>
                    Update Profile
                </button>
                {successMessage && <p className="success-message">{successMessage}</p>}
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>
        </div>
    );
}

export default Profile;