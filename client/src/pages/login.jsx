import React, { useState } from 'react';
import '../styles/login.css';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);

  return (
    <div className="login-page">
      <div className={`form-container ${isRegistering ? 'register-container' : ''}`}>
        <h2>{isRegistering ? 'Register' : 'Login'}</h2>
        <form>
          <input type="text" placeholder="NetID" required />
          {isRegistering && (
            <>
              <input type="text" placeholder="First Name" required />
              <input type="text" placeholder="Last Name" required />
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <input type="password" placeholder="Confirm Password" required />
            </>
          )}
          {!isRegistering && <input type="password" placeholder="Password" required />}
          <button type="submit">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        {isRegistering ? (
          <p>
            Already have an account? <span onClick={() => setIsRegistering(false)}>Login</span>
          </p>
        ) : (
          <p>
            Don't have an account? <span onClick={() => setIsRegistering(true)}>Register</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;
