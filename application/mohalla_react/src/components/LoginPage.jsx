import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLogin } from '../hooks/useAuth';
import './LoginPage.css';
import communityHeart from '../assets/community-heart.png';
import AuthNavbar from './AuthNavbar';

const LoginPage = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const navigate = useNavigate();
    const { mutate: login, isPending, error } = useLogin();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Login submitted:', formData);
        login(formData, {
            onSuccess: () => {
                navigate('/');
            },
            onError: (err) => {
                console.error('Login failed:', err);
            }
        });
    };

    return (
        <div className="login-container">
            <AuthNavbar />
            <div className="login-card">
                <div className="login-content">
                    <div className="login-image-section">
                        <img src={communityHeart} alt="Community Heart" className="auth-image" />
                    </div>
                    <div className="login-form-section">
                        <div className="login-header">
                            <h2>Welcome Back</h2>
                            <p>Please enter your details to sign in</p>
                        </div>

                        <form className="login-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="e.g. user@example.com"
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>

                            <button type="submit" className="login-btn" disabled={isPending}>
                                {isPending ? 'Signing In...' : 'Sign In'}
                            </button>
                            {error && <p className="error-message">{error.response?.data?.error?.message || error.response?.data?.message || 'Login failed. Please check your credentials.'}</p>}
                        </form>

                        <div className="login-footer">
                            <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
