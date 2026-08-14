import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSignup } from '../hooks/useAuth';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import SignupLoading from './SignupLoading';
import './SignupPage.css';
import api from '../api/axios';
import communityHeart from '../assets/community-heart.png';
import AuthNavbar from './AuthNavbar';





const SignupPage = () => {


    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        password: '',
        state: '',
        district: '',
        taluk: '',
        block: '',
        panchayath: '',
        ward: ''
    });

    const [showLoading, setShowLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const navigate = useNavigate();
    const { mutate: signup, isPending, error } = useSignup();

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        setShowLoading(true);
        signup(formData, {
            onSuccess: () => {
                setTimeout(() => {
                    navigate('/login');
                }, 10000);
            },
            onError: (err) => {
                console.error('Signup failed:', err);
                setShowLoading(false);
                // You might want to show an error message to the user here
            }
        });
    };

    const getLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by this browser.");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            successCallback,
            (error) => {
                console.error("Error getting location:", error.message);
            }
        );
    };


    const successCallback = (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        console.log(`Lat: ${lat}, Lon: ${lon}`);
        fetchAddress(lat, lon);
    };

    const fetchAddress = async (lat, lon) => {
        try {
            const response = await api.get(
                `/location/reverse?lat=${lat}&lon=${lon}`
            );

            const location = response.data.data;
            console.log("Resolved location:", location);

            // Example: set form state (adjust to your setup)
            setFormData((prev) => ({
                ...prev,
                state: location.state || "",
                district: location.district || "",
                taluk: location.taluk || "",
                panchayath: location.panchayath || "",
            }));

        } catch (error) {
            console.error("Error fetching address:", error.response?.data || error.message);
        }
    };

    if (showLoading) {
        return <SignupLoading />;
    }

    return (
        <div className="signup-container">
            <AuthNavbar />
            <div className="signup-card">
                <div className="signup-content">
                    <div className="signup-image-section">
                        <div className="signup-image-container">
                            <img src={communityHeart} alt="Community Heart" className="auth-image" />
                            <div className="signup-image-text">
                                <h3>Join Our Community</h3>
                                <p>Connect with your neighbors and make a difference.</p>
                            </div>
                        </div>
                    </div>

                    <div className="signup-form-section">
                        <div className="signup-header">
                            <h2>Create Account</h2>
                            <p>Join our community today</p>
                        </div>

                        <form className="signup-form" onSubmit={handleSubmit}>

                            <div className="form-section">
                                <h3 className="section-title">Personal Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="firstName">First Name</label>
                                        <input
                                            type="text"
                                            id="firstName"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            placeholder="e.g. John"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="lastName">Last Name</label>
                                        <input
                                            type="text"
                                            id="lastName"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            placeholder="e.g. Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="username">Username</label>
                                        <input
                                            type="text"
                                            id="username"
                                            name="username"
                                            value={formData.username}
                                            onChange={handleChange}
                                            placeholder="e.g. johndoe"
                                            required
                                        />
                                    </div>
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
                                </div>

                                <div className="form-group">
                                    <label htmlFor="password">Password</label>
                                    <div className="password-input-wrapper">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            id="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Enter your password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle-btn"
                                            onClick={() => setShowPassword(!showPassword)}
                                            aria-label={showPassword ? "Hide password" : "Show password"}
                                        >
                                            {showPassword ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07-2.3 2.3"></path>
                                                    <line x1="1" y1="1" x2="23" y2="23"></line>
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                                    <circle cx="12" cy="12" r="3"></circle>
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {formData.password.length > 0 && formData.password.length < 8 && (
                                        <p id="password-error" style={{ color: "red", fontSize: "0.875rem", marginTop: "0.5rem" }}>
                                            Password must be 8 or more characters
                                        </p>
                                    )}
                                </div>

                            </div>

                            <div className="form-section">
                                <div className="section-header-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 className="section-title">Address Details</h3>
                                    <button
                                        type="button"
                                        className="auto-location-btn"
                                        onClick={getLocation}
                                        style={{
                                            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                                            color: 'white',
                                            border: 'none',
                                            padding: '8px 16px',
                                            borderRadius: '8px',
                                            cursor: 'pointer',
                                            fontSize: '0.875rem',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    >
                                        <span>📍</span> Detect Location
                                    </button>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="state">State</label>
                                        <input
                                            type="text"
                                            id="state"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                            placeholder="e.g. State"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="district">District</label>
                                        <input
                                            type="text"
                                            id="district"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                            placeholder="e.g. District"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="taluk">Taluk</label>
                                        <input
                                            type="text"
                                            id="taluk"
                                            name="taluk"
                                            value={formData.taluk}
                                            onChange={handleChange}
                                            placeholder="e.g. Taluk"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="block">Block</label>
                                        <input
                                            type="text"
                                            id="block"
                                            name="block"
                                            value={formData.block}
                                            onChange={handleChange}
                                            placeholder="e.g. Block"
                                        />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label htmlFor="panchayath">Panchayath</label>
                                        <input
                                            type="text"
                                            id="panchayath"
                                            name="panchayath"
                                            value={formData.panchayath}
                                            onChange={handleChange}
                                            placeholder="e.g. Grama Panchayath"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ward">Ward</label>
                                        <input
                                            type="text"
                                            id="ward"
                                            name="ward"
                                            value={formData.ward}
                                            onChange={handleChange}
                                            placeholder="e.g. Ward No"
                                        />
                                    </div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="signup-btn"
                                disabled={isPending || formData.password.length < 8}
                            >
                                {isPending ? 'Signing up...' : 'Sign Up'}
                            </button>
                            {error && <p className="error-message">{error.response?.data?.error?.message || error.response?.data?.message || 'Signup failed. Please try again.'}</p>}
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignupPage;
