import React, { useState } from 'react';
import './navbar.css';
import { NavLink } from 'react-router-dom';
import { IoIosArrowDropdown, IoIosCloseCircleOutline } from 'react-icons/io';

// Simulated User Context/State (replace this with actual context or state logic)
const user = {
  isAuthenticated: true, // Assume user is authenticated for demonstration
  isLineMonitor: true,
  isSuperUser: true,
};

export default function Navbar() {
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    return (
        <nav className='nav'>
            <NavLink to="/" className="nav-link app-name">KvilleNation</NavLink>
            <div className="nav-section left">
                <button
                    className="nav-toggle"
                    onClick={() => setIsNavExpanded(!isNavExpanded)}
                    aria-label="Toggle navigation"
                >
                    {isNavExpanded ? <IoIosCloseCircleOutline /> : <IoIosArrowDropdown />}    
                </button>
                <div className={`nav-menu ${isNavExpanded ? 'show' : ''}`}>
                    <NavLink to="/history" className="nav-link" activeClassName="active">History</NavLink>
                    <NavLink to="/policy" className="nav-link" activeClassName="active">Policy</NavLink>
                    <NavLink to="/calendar" className="nav-link" activeClassName="active">Calendar</NavLink>
                    <NavLink to="/line-monitors" className="nav-link" activeClassName="active">Line Monitors</NavLink>
                    {/* Conditional Navigation Links based on User Role */}
                    {user.isLineMonitor && (
                        <>
                            <NavLink to="/tent-check" className="nav-link" activeClassName="active">Tent Check</NavLink>
                            <NavLink to="/form" className="nav-link" activeClassName="active">Form</NavLink>
                        </>
                    )}
                    {user.isSuperUser && (
                        <NavLink to="/lm-dashboard" className="nav-link" activeClassName="active">LM Dashboard</NavLink>
                    )}
                    {/* Show Profile or Sign In based on Authentication Status */}
                    <NavLink 
                        to={user.isAuthenticated ? "/profile" : "/sign-in"} 
                        className="nav-link mobile-profile-link" 
                        activeClassName="active"
                    >
                        {user.isAuthenticated ? "Profile" : "Sign In"}
                    </NavLink>
                </div>
            </div>
            <div className="nav-section right">
                {/* Show Profile or Sign In based on Authentication Status */}
                <NavLink 
                    to={user.isAuthenticated ? "/profile" : "/sign-in"} 
                    className="nav-link profile-link" 
                    activeClassName="active"
                >
                    {user.isAuthenticated ? "Profile" : "Sign In"}
                </NavLink>
            </div>
        </nav>
    );
}
