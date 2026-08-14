import React from 'react';
import ReactDOM from 'react-dom';
import './LoadingOverlay.css';

const LoadingOverlay = ({ isOpen, message = 'Loading...' }) => {
    if (!isOpen) return null;

    return ReactDOM.createPortal(
        <div className="loading-overlay-container">
            <div className="loading-spinner-box">
                <div className="loading-spinner"></div>
                <p className="loading-message">{message}</p>
            </div>
        </div>,
        document.body
    );
};

export default LoadingOverlay;
