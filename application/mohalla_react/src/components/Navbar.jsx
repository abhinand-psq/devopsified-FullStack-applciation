import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCreatePost } from '../context/CreatePostContext';
import { useUser, useLogout } from '../hooks/useAuth';
import './Navbar.css';

import { toast } from 'sonner';

const Navbar = ({ onMenuClick }) => {
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

    const handleSearch = (e) => {
        toast.info("Search functionality will be implemented later");

    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <button className="menu-toggle-btn" onClick={onMenuClick}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                <Link to="/" className="logo">
                    <svg viewBox="0 0 20 20" className="reddit-icon" fill="currentColor">
                        <circle cx="10" cy="10" r="10" fill="#8B5CF6" />
                        <path fill="#FFF" d="M16.67,10A3.32,3.32,0,0,0,13.34,6.68a3.31,3.31,0,0,0-1.06.19,6.49,6.49,0,0,0-4.56-1.85V2.09h2.36a1.67,1.67,0,1,0,1.66-1.67,1.66,1.66,0,0,0-1.66,1.67H9.38a.42.42,0,0,0-.42.42V5a6.49,6.49,0,0,0-4.56,1.85A3.3,3.3,0,0,0,3.33,10a3.31,3.31,0,0,0,2.18,3.11,5.39,5.39,0,0,0-.16,1.32c0,2.71,3.13,4.91,7,4.91s7-2.2,7-4.91a5.27,5.27,0,0,0-.16-1.32A3.31,3.31,0,0,0,16.67,10Z" />
                    </svg>
                    <span className="logo-text">mohallahub</span>
                </Link>
            </div>

            <div className="navbar-center">
                <div className="search-bar">
                    <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" onClick={handleSearch} style={{ cursor: 'pointer' }}>
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input type="text" placeholder="Search here" onKeyDown={handleSearch} />
                </div>
            </div>

            <div className="navbar-right">
                {user ? (
                    <>
                        <button className="icon-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                        <button className="icon-btn">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                        </button>
                        <button className="create-btn" onClick={openCreatePostModal} title="Create Post">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <div className="user-menu">
                            <div className="user-avatar">
                                <span >{user.username ? user.username[0].toUpperCase() : 'U'}</span>
                            </div>
                            <button className="logout-btn" onClick={() => navigate('/my-auctions')} title='My Auctions' style={{ marginRight: '8px' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"></path>
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
                                    <path d="M4 22h16"></path>
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                                </svg>
                            </button>
                            <button className="logout-btn" onClick={handleLogout} title='logout'>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                    <polyline points="16 17 21 12 16 7"></polyline>
                                    <line x1="21" y1="12" x2="9" y2="12"></line>
                                </svg>
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="nav-btn login-nav-btn">Log In</Link>
                        <Link to="/signup" className="nav-btn signup-nav-btn">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
