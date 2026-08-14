import React, { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import './ServiceDetailPanel.css';

const ServiceDetailPanel = ({ service, onClose }) => {
    const [rating, setRating] = useState(0);

    const handleRating = (rate) => {
        console.log(rate);
        setRating(rate);
        console.log(rating);
        // Logic to submit rating would go here
    };

    if (!service) return null;

    const {
        title,
        description,
        category,
        priceMin,
        priceMax,
        provider,
        community,
        phone,
        image,
        available,
        createdAt
    } = service;

    console.log(community);

    return (
        <div className="service-detail-overlay" onClick={onClose}>
            <div className="service-detail-panel" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                <div className="detail-image-container">
                    <img
                        src={image?.url || 'https://via.placeholder.com/800x450?text=Service+Detail'}
                        alt={title}
                        className="detail-image"
                    />
                    <div className="detail-category-pill">{category}</div>
                </div>

                <div className="detail-content">
                    <div className="detail-header">
                        <h2 className="detail-title">{title}</h2>
                        <div className="detail-price">₹{priceMin} - ₹{priceMax}</div>
                    </div>

                    <div className="detail-meta-row">
                        <span className={`status-badge ${available ? 'available' : 'unavailable'}`}>
                            {available ? 'Available Now' : 'Currently Busy'}
                        </span>
                        <span className="posted-date">Posted {new Date(createdAt).toLocaleDateString()}</span>
                    </div>

                    <div className="provider-card">
                        <img
                            src={provider?.profilePic?.url || 'https://via.placeholder.com/48'}
                            alt={provider?.username}
                            className="provider-avatar-large"
                        />
                        <div className="provider-details">
                            <div className="provider-name-large">{provider?.firstName || provider?.username}</div>
                            <div className="provider-rating">
                                <span className="star">★</span> 4.8 (12 reviews)
                            </div>
                        </div>
                        <button className="view-profile-btn">View Profile</button>
                    </div>

                    <div className="detail-description">
                        <h3>Description</h3>
                        <p>{description}</p>
                    </div>

                    <div className="service-rating-input">
                        <h4>Rate this Service</h4>
                        <Rating
                            onClick={handleRating}
                            initialValue={5}
                            size={30}
                            transition
                            allowFraction
                            SVGstyle={{ display: 'inline' }}
                        />
                    </div>

                    <div className="detail-actions">
                        <button className="primary-cta-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            Call {phone || 'Provider'}
                        </button>

                        <div className="secondary-actions">
                            <button className="secondary-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                                </svg>
                                Save
                            </button>
                            <button className="secondary-btn report-btn">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                                    <line x1="4" y1="22" x2="4" y2="15"></line>
                                </svg>
                                Report
                            </button>
                        </div>
                    </div>

                    {community && (
                        <div className="community-chip">
                            Posted in <strong>{community.name}</strong>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ServiceDetailPanel;
