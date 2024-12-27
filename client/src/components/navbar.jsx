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
                headers: {
                    'Content-Type': 'application/json',
                },
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
            <NavLink to="/" className="nav-link app-name" onClick={closeMenu}>
                KVILLENATION
            </NavLink>
            <div className="nav-section left">
                <button
                    className="nav-toggle"
                    onClick={() => setIsNavExpanded(!isNavExpanded)}
                    aria-label="Toggle navigation"
                >
                    {isNavExpanded ? <IoIosCloseCircleOutline /> : <IoIosArrowDropdown />}
                </button>
                <div className={`nav-menu ${isNavExpanded ? 'show' : ''}`}>
                    <NavLink to="/history" className="nav-link" activeClassName="active" onClick={closeMenu}>
                        History
                    </NavLink>
                    <NavLink to="/policy" className="nav-link" activeClassName="active" onClick={closeMenu}>
                        Policy
                    </NavLink>
                    <NavLink to="/calendar" className="nav-link" activeClassName="active" onClick={closeMenu}>
                        Calendar
                    </NavLink>
                    <NavLink to="/line-monitors" className="nav-link" activeClassName="active" onClick={closeMenu}>
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
                    {user.isAuthenticated && (
                        <>
                            <NavLink
                                to="/profile"
                                className="nav-link"
                                activeClassName="active"
                                onClick={closeMenu}
                            >
                                Hello, {user.firstName || "User"}

                            </NavLink>
                            <button onClick={() => { handleLogout(); closeMenu(); }} className="nav-link logout-button">
                                Logout
                            </button>
                        </>
                    )}
                    {!user.isAuthenticated && (
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
            {!isNavExpanded && (
                <div className="nav-section right">
                    {user.isAuthenticated && (
                        <NavLink
                            to="/profile"
                            className="nav-link profile-link"
                            activeClassName="active"
                        >
                            Hello, {user.firstName || "User"}
                        </NavLink>
                    )}
                    {!user.isAuthenticated && (
                        <NavLink
                            to="/login"
                            className="nav-link profile-link"
                            activeClassName="active"
                        >
                            Sign In
                        </NavLink>
                    )}
                    {user.isAuthenticated && (
                        <button onClick={handleLogout} className="nav-link logout-button">
                            Logout
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}