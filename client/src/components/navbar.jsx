import React, { useState } from 'react';
import './navbar.css';
import { NavLink } from 'react-router-dom';
import { IoIosArrowDropdown, IoIosCloseCircleOutline } from 'react-icons/io';

export default function Navbar() {
    const [isNavExpanded, setIsNavExpanded] = useState(false);

    return (
        <nav className='nav'>
            <NavLink to="/home" className="nav-link app-name">KvilleNation</NavLink>
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
                    <NavLink to="/profile" className="nav-link mobile-profile-link" activeClassName="active">Profile</NavLink>
                </div>
            </div>
            <div className="nav-section right">
                <NavLink to="/profile" className="nav-link profile-link" activeClassName="active">Profile</NavLink>
            </div>
        </nav>
    );
}
