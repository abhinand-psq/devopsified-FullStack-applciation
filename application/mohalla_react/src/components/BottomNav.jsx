import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreatePost } from '../context/CreatePostContext';
import { useUser, useLogout } from '../hooks/useAuth';
import './BottomNav.css';

const BottomNav = () => {
    const { openCreatePostModal } = useCreatePost();
    const { data: user } = useUser();
    const { mutate: logout } = useLogout();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout(null, {
            onSuccess: () => {
                navigate('/login');
            }
        });
    };

    if (!user) {
        return (
            <div className="bottom-nav">
                <div className="auth-mobile-group">
                    <Link to="/login" className="auth-mobile-btn login-nav-btn">Log In</Link>
                    <Link to="/signup" className="auth-mobile-btn signup-nav-btn">Sign Up</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="bottom-nav">
            {/* My Auctions */}
            <button className="bottom-nav-item" onClick={() => navigate('/my-auctions')} aria-label="My Auctions">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"></path>
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
                    <path d="M4 22h16"></path>
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                </svg>
            </button>

            {/* Notifications (Placeholder) */}
            <button className="bottom-nav-item" onClick={() => { }} aria-label="Notifications">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                    <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
            </button>

            {/* Create Post */}
            <button className="bottom-nav-item" onClick={openCreatePostModal}>
                <div className="create-btn-mobile">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                </div>
            </button>

            {/* User Profile (Visual only for now) */}
            <button className="bottom-nav-item" aria-label="Profile">
                <div className="user-avatar-mobile">
                    {user.username ? user.username[0].toUpperCase() : 'U'}
                </div>
            </button>

            {/* Logout */}
            <button className="bottom-nav-item" onClick={handleLogout} aria-label="Logout">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
            </button>
        </div>
    );
};

export default BottomNav;
