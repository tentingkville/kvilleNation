import React, { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import '../styles/login.css';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Display functions for alerts
  const displaySuccessAlert = (message) => {
    setSuccessAlert({ show: true, message });
    setTimeout(() => setSuccessAlert({ show: false, message: '' }), 5000); // Automatically hide after 5 seconds
  };

  const displayErrorAlert = (message) => {
    setErrorAlert({ show: true, message });
    setTimeout(() => setErrorAlert({ show: false, message: '' }), 5000); // Automatically hide after 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = `http://localhost:8081/api/profile/${isRegistering ? 'register' : 'login'}`;
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
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      const data = await response.text();

      if (response.ok) {
        displaySuccessAlert('Registration successful!');
        if (isRegistering) {
          setIsRegistering(false);
          setFormData({ netID: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
        } else {
          navigate('/profile');
        }
      } else {
        throw new Error(data);
      }
    } catch (error) {
      displayErrorAlert(error.message);
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setFormData({ netID: '', firstName: '', lastName: '', email: '', password: '', confirmPassword: '' });
    setSuccessAlert({ show: false, message: '' });
    setErrorAlert({ show: false, message: '' });
  };

  return (
    <div className="login-page">
      <div className={`form-container ${isRegistering ? 'register-container' : ''}`}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {successAlert.show && <Alert variant="success">{successAlert.message}</Alert>}
        {errorAlert.show && <Alert variant="danger">{errorAlert.message}</Alert>}
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
            Already have an account? <span onClick={switchMode} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Login</span>
          </p>
        ) : (
          <p>
            Don't have an account? <span onClick={switchMode} style={{ cursor: 'pointer', textDecoration: 'underline' }}>Register</span>
          </p>
        )}
      </div>
    </div>
  );
} ;

export default Login;
