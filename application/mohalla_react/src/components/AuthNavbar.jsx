import React from 'react';
import { Link } from 'react-router-dom';
import './AuthNavbar.css';

const AuthNavbar = () => {
    return (
        <nav className="auth-navbar">
            <Link to="/" className="auth-logo">
                <svg viewBox="0 0 20 20" className="auth-logo-icon" fill="currentColor">
                    <circle cx="10" cy="10" r="10" fill="#8B5CF6" />
                    <path fill="#FFF" d="M16.67,10A3.32,3.32,0,0,0,13.34,6.68a3.31,3.31,0,0,0-1.06.19,6.49,6.49,0,0,0-4.56-1.85V2.09h2.36a1.67,1.67,0,1,0,1.66-1.67,1.66,1.66,0,0,0-1.66,1.67H9.38a.42.42,0,0,0-.42.42V5a6.49,6.49,0,0,0-4.56,1.85A3.3,3.3,0,0,0,3.33,10a3.31,3.31,0,0,0,2.18,3.11,5.39,5.39,0,0,0-.16,1.32c0,2.71,3.13,4.91,7,4.91s7-2.2,7-4.91a5.27,5.27,0,0,0-.16-1.32A3.31,3.31,0,0,0,16.67,10Z" />
                </svg>
                <span className="auth-logo-text">mohallahub</span>
            </Link>
        </nav>
    );
};

export default AuthNavbar;
