import React, { useState } from 'react';
import './navbar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoIosArrowDropdown, IoIosCloseCircleOutline } from 'react-icons/io';
import { useUser } from '../userContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

export default function Navbar() {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (response.ok) {
        setUser({
          isAuthenticated: false,
          isLineMonitor: false,
          isSuperUser: false,
          firstName: null,
          lastName: null,
          email: null,
        });
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        const error = await response.json();
        console.error('Logout failed:', error.message);
      }
    } catch (error) {
      console.error('Logout request error:', error.message);
    }
  };

  const closeMenu = () => {
    setIsNavExpanded(false);
  };

  return (
    <nav className="nav">
      {/* Logo / App Name */}
      <NavLink to="/" className="nav-link app-name" onClick={closeMenu}>
        KVILLENATION
      </NavLink>

      {/* LEFT SECTION (nav menu + mobile toggle) */}
      <div className="nav-section left">
        {/* Hamburger icon (mobile only) */}
        <button
          className="nav-toggle"
          onClick={() => setIsNavExpanded(!isNavExpanded)}
          aria-label="Toggle Menu"
        >
          {isNavExpanded ? <IoIosCloseCircleOutline /> : <IoIosArrowDropdown />}
        </button>

        {/* Main nav menu (horizontal on desktop, dropdown on mobile) */}
        <div className={`nav-menu ${isNavExpanded ? 'show' : ''}`}>
          <NavLink
            to="/history"
            className="nav-link"
            activeClassName="active"
            onClick={closeMenu}
          >
            History
          </NavLink>
          <NavLink
            to="/policy"
            className="nav-link"
            activeClassName="active"
            onClick={closeMenu}
          >
            Policy
          </NavLink>
          <NavLink
            to="/calendar"
            className="nav-link"
            activeClassName="active"
            onClick={closeMenu}
          >
            Calendar
          </NavLink>
          <NavLink
            to="/line-monitors"
            className="nav-link"
            activeClassName="active"
            onClick={closeMenu}
          >
            Line Monitors
          </NavLink>
          {user.isLineMonitor && (
            <NavLink
              to="/tent-check"
              className="nav-link"
              activeClassName="active"
              onClick={closeMenu}
            >
              Tent Check
            </NavLink>
          )}
          {user.isSuperUser && (
            <NavLink
              to="/line-monitor-dashboard"
              className="nav-link"
              activeClassName="active"
              onClick={closeMenu}
            >
              LM Dashboard
            </NavLink>
          )}

          {/* MOBILE-ONLY AUTH LINKS */}
          <div className="mobile-auth-links">
            {user.isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="nav-link"
                  activeClassName="active"
                  onClick={closeMenu}
                >
                  Hello, {user.firstName || 'User'}
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="nav-link logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="nav-link"
                activeClassName="active"
                onClick={closeMenu}
              >
                Sign In
              </NavLink>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT SECTION (desktop-only) */}
      <div className="nav-section right">
      {user.isAuthenticated ? (
              <>
                <NavLink
                  to="/profile"
                  className="nav-link"
                  activeClassName="active"
                  onClick={closeMenu}
                >
                  Hello, {user.firstName || 'User'}
                </NavLink>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="nav-link logout-button"
                >
                  Logout
                </button>
              </>
            ) : (
              <NavLink
                to="/login"
                className="nav-link"
                activeClassName="active"
                onClick={closeMenu}
              >
                Sign In
              </NavLink>
            )}
      </div>
    </nav>
  );
}