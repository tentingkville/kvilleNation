import React, { useState, useContext } from 'react';
import './navbar.css';
import { NavLink, useNavigate } from 'react-router-dom';
import { IoIosArrowDropdown, IoIosCloseCircleOutline } from 'react-icons/io';
import UserContext from '../userContext';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8081';

export default function Navbar() {
    const [isNavExpanded, setIsNavExpanded] = useState(false);
    const { user, setUser } = useContext(UserContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/profile/logout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.ok) {
                setUser({
                    isAuthenticated: false,
                    isLineMonitor: false,
                    isSuperUser: false,
                });
                navigate('/login');
            } else {
                const error = await response.text();
                console.error('Logout failed:', error);
            }
        } catch (error) {
            console.error('Logout request error:', error);
        }
    };

    return (
        <nav className='nav'>
            <NavLink to="/" className="nav-link app-name">KVILLENATION</NavLink>
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
                    {user.isLineMonitor && (
                        <>
                            <NavLink to="/tent-check" className="nav-link" activeClassName="active">Tent Check</NavLink>
                        </>
                    )}
                    {user.isSuperUser && (
                        <NavLink to="/line-monitor-dashboard" className="nav-link" activeClassName="active">LM Dashboard</NavLink>
                    )}
                    {/* Render Profile/Sign In only in the dropdown for mobile */}
                    {isNavExpanded && (
                        <NavLink 
                            to={user.isAuthenticated ? "/profile" : "/login"} 
                            className="nav-link mobile-profile-link" 
                            activeClassName="active"
                        >
                            {user.isAuthenticated ? "Profile" : "Sign In"}
                        </NavLink>
                    )}
                </div>
            </div>
            {!isNavExpanded && (
                <div className="nav-section right">
                    {/* Render Profile/Sign In only for desktop */}
                    <NavLink 
                        to={user.isAuthenticated ? "/profile" : "/login"} 
                        className="nav-link profile-link" 
                        activeClassName="active"
                    >
                        {user.isAuthenticated ? "Profile" : "Sign In"}
                    </NavLink>
                    {user.isAuthenticated && (
                        <button onClick={handleLogout} className="nav-link logout-button">Logout</button>
                    )}
                </div>
            )}
        </nav>
    );
}