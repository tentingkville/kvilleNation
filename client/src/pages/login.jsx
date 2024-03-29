import React, { useState } from 'react';
import  {Alert}  from 'react-bootstrap';
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
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = `http://localhost:8081/api/profile/${isRegistering ? 'register' : 'login'}`;
    const { netID, email, firstName, lastName, password, confirmPassword } = formData;

    if (isRegistering && password !== confirmPassword) {
      setAlert({ show: true, message: 'Passwords do not match', type: 'danger' });
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
        setAlert({ show: true, message: data, type: 'success' });
        if (isRegistering) {
          setIsRegistering(false);
          setFormData({ ...formData, password: '', confirmPassword: '' });
        } else {
          navigate('/profile');
        }
      } else {
        throw new Error(data);
      }
    } catch (error) {
      setAlert({ show: true, message: error.message, type: 'danger' });
    }
  };

  const switchMode = () => {
    setIsRegistering(!isRegistering);
    setAlert({ show: false, message: '', type: '' });
    setFormData({
      netID: isRegistering ? formData.netID : '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="login-page">
      <div className={`form-container ${isRegistering ? 'register-container' : ''}`}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        {alert.show && <Alert variant={alert.type}>{alert.message}</Alert>}
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
          {!isRegistering && <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />}
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        {isRegistering ? (
          <p>
            Already have an account? <span onClick={switchMode}>Login</span>
          </p>
        ) : (
          <p>
            Don't have an account? <span onClick={switchMode}>Register</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
