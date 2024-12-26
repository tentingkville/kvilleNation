import React, { useState, useContext } from 'react';
import Alert from 'react-bootstrap/Alert';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';
import UserContext from '../userContext.js';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';


const Login = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext); // Get the setUser function from context
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    netID: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [successAlert, setSuccessAlert] = useState({ show: false, message: '' });
  const [errorAlert, setErrorAlert] = useState({ show: false, message: '' });
  const [fadeOutSuccess, setFadeOutSuccess] = useState(false);
  const [fadeOutError, setFadeOutError] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const displaySuccessAlert = (message) => {
    setSuccessAlert({ show: true, message });
    setTimeout(() => {
      setSuccessAlert({ show: false, message: '' });
    }, 5000); 
  };
  
  const displayErrorAlert = (message) => {
    setErrorAlert({ show: true, message });
    setTimeout(() => {
      setErrorAlert({ show: false, message: '' });
    }, 5000); 
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `${API_BASE_URL}/api/profile/${isRegistering ? 'register' : 'login'}`;
    const { netID, email, firstName, lastName, password, confirmPassword } = formData;
  
    if (isRegistering && password !== confirmPassword) {
      displayErrorAlert('Passwords do not match');
      return;
    }
  
    const body = isRegistering ? { netID, email, firstName, lastName, password } : { netID, password };
  
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        credentials: 'include', // Include credentials (cookies)
      });
  
      const data = await response.json();
  
      if (response.ok) {
        displaySuccessAlert(isRegistering ? 'Registration successful!' : 'Login successful!');
        if (isRegistering) {
          setIsRegistering(false);
          setFormData({ netID: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
        } else {
          setUser({
            isAuthenticated: true,
            isLineMonitor: data.isLineMonitor,
            isSuperUser: data.isSuperUser,
          });
          navigate('/profile');
        }
      } else {
        // Display detailed error from the server response
        displayErrorAlert(data.error || 'An error occurred. Please try again.');
      }
    } catch (error) {
      displayErrorAlert('An unexpected error occurred. Please try again later.');
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ netID: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    setSuccessAlert({ show: false, message: '' });
    setErrorAlert({ show: false, message: '' });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include credentials (cookies)
      });

      if (response.ok) {
        // Clear user context or state
        setUser({
          isAuthenticated: false,
          isLineMonitor: false,
          isSuperUser: false,
        });
        navigate('/'); // Redirect to home page or another appropriate page
      } else {
        const error = await response.text();
        console.error('Logout failed:', error);
      }
    } catch (error) {
      console.error('Logout request error:', error);
    }
  };

  return (
    <div className="login-page">
      <div className={`form-container ${isRegistering ? 'register-container' : ''}`}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {successAlert.show && (
          <div className={`alert alert-success ${fadeOutSuccess ? 'alert-hidden' : 'alert-visible'}`}>
            {successAlert.message}
          </div>
        )}
        {errorAlert.show && (
          <div className={`alert alert-error ${fadeOutError ? 'alert-hidden' : 'alert-visible'}`}>
            {errorAlert.message}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <input type="text" name="netID" placeholder="NetID" value={formData.netID} onChange={handleChange} required />
          {isRegistering && (
            <>
              <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
              <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
              <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
              <input type="password" name="confirmPassword" placeholder="Confirm Password" value={formData.confirmPassword} onChange={handleChange} required />
            </>
          )}
          {!isRegistering && (
            <>
              <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
            </>
          )}
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        {isRegistering ? (
          <p>
            Already have an account? <span onClick={switchMode} style={{ cursor: 'pointer'}}>Login</span>
          </p>
        ) : (
          <p>
            Don't have an account? <span onClick={switchMode} style={{ cursor: 'pointer'}}>Register</span>
          </p>
        )}
        {user.isAuthenticated && (
          <button onClick={handleLogout} className="nav-link">Logout</button>
        )}
      </div>
    </div>
  );
};

export default Login;