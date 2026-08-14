import React from 'react';
import './ServiceCard.css';

const ServiceCard = ({ service, onClick, onCall, onSave }) => {
    const {
        title,
        category,
        priceMin,
        priceMax,
        provider,
        image,
        available,
        stats
    } = service;

    return (
        <div className="service-card" onClick={onClick}>
            <div className="service-thumbnail-container">
                <img
                    src={image?.url || 'https://via.placeholder.com/400x300?text=Service'}
                    alt={title}
                    className="service-thumbnail"
                />
                <div className={`availability-pill ${available ? 'available' : 'unavailable'}`}>
                    {available ? 'Available' : 'Busy'}
                </div>
            </div>

            <div className="service-content">
                <div className="service-header">
                    <span className="category-pill">{category}</span>
                    <div className="service-actions">
                        <button
                            className="action-icon-btn"
                            onClick={(e) => { e.stopPropagation(); onSave(); }}
                            title="Save"
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </button>
                    </div>
                </div>

                <h3 className="service-title">{title}</h3>

                <div className="service-price">
                    ₹{priceMin} - ₹{priceMax}
                </div>

                <div className="service-footer">
                    <div className="provider-info">
                        <img
                            src={provider?.profilePic?.url || 'https://via.placeholder.com/32'}
                            alt={provider?.username}
                            className="provider-avatar"
                        />
                        <span className="provider-name">{provider?.firstName || provider?.username}</span>
                    </div>

                    <div className="service-meta">
                        <span className="views-count">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            {stats?.views || 0}
                        </span>
                    </div>
                </div>

                <button
                    className="call-btn-mobile"
                    onClick={(e) => { e.stopPropagation(); onCall(); }}
                >
                    Call Now
                </button>
            </div>
        </div>
    );
};

export default ServiceCard;
