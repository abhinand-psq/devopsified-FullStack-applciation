import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './CreateAuctionModal.css';
import api from '../../api/axios';
import { toast } from 'sonner';
import LoadingOverlay from '../LoadingOverlay';

const CreateAuctionModal = ({ onClose, onSubmit, communityId }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startingPrice, setStartingPrice] = useState('');
    const [minIncrement, setMinIncrement] = useState('100');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [image, setImage] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!communityId) {
            toast.error("Community ID is missing");
            return;
        }
        if (!title || !description || !startingPrice || !startDate || !endDate) {
            toast.error("Please fill in all required fields");
            return;
        }
        if (!image) {
            toast.error("Please upload an image");
            return;
        }

        setIsSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('communityId', communityId);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('startingPrice', startingPrice);
            formData.append('minimumBidIncrement', minIncrement);
            formData.append('auctionStartTime', new Date(startDate).toISOString());
            formData.append('auctionEndTime', new Date(endDate).toISOString());
            formData.append('image', image);

            const response = await api.post('/auction/create', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 201 || response.status === 200) {
                toast.success("Auction created successfully!");
                if (onSubmit) onSubmit(); // Trigger refetch
                onClose();
            }
        } catch (error) {
            console.error("Create auction error:", error);
            const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || "Failed to create auction";
            toast.error(errorMsg);
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-auction-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="modal-header">
                    <div className="modal-title-group">
                        <h2 className="modal-title">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14 2L9 7M14 12l5-5M3.5 15.5l5.5 5.5M2 22l4-4M10 2l-7 7 10 10 7-7-10-10z" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Create New Auction
                        </h2>
                        <p className="modal-subtitle">List your item for auction in this community</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="modal-content">
                    {/* Image Upload */}
                    <div className="form-group">
                        <label className="form-label">Product Image <span className="required-asterisk">*</span></label>
                        <p className="form-helper">Upload an image of your item</p>
                        <div className="image-upload-area" onClick={() => document.getElementById('auction-image-input').click()}>
                            {image ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{ color: '#00c853', fontWeight: 'bold' }}>Image Selected:</span>
                                    <span>{image.name}</span>
                                </div>
                            ) : (
                                <>
                                    <svg className="upload-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    <span className="upload-text">Click to Upload</span>
                                </>
                            )}
                            <input
                                type="file"
                                id="auction-image-input"
                                onChange={handleImageChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">Product Title <span className="required-asterisk">*</span></label>
                        <input
                            type="text"
                            className="form-input"
                            placeholder="e.g., Item Name"
                            maxLength={100}
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <div className="char-count">{title.length}/100 characters</div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">Description <span className="required-asterisk">*</span></label>
                        <textarea
                            className="form-textarea"
                            placeholder="Describe your product in detail, including condition and any important information..."
                            maxLength={1000}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                        <div className="char-count">{description.length}/1000 characters</div>
                    </div>

                    {/* Price Row */}
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label className="form-label">Starting Price (₹) <span className="required-asterisk">*</span></label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="₹ 0"
                                value={startingPrice}
                                onChange={(e) => setStartingPrice(e.target.value)}
                            />
                        </div>
                        <div className="form-group half-width">
                            <label className="form-label">Min. Bid Increment (₹) <span className="required-asterisk">*</span></label>
                            <input
                                type="number"
                                className="form-input"
                                placeholder="₹ 100"
                                value={minIncrement}
                                onChange={(e) => setMinIncrement(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Date Row */}
                    <div className="form-row">
                        <div className="form-group half-width">
                            <label className="form-label">Auction Start Time <span className="required-asterisk">*</span></label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="form-group half-width">
                            <label className="form-label">Auction End Time <span className="required-asterisk">*</span></label>
                            <input
                                type="datetime-local"
                                className="form-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Info Note */}
                    <div className="info-box">
                        <span className="note-bold">Note:</span> Only community members can create and participate in auctions. Make sure to provide accurate information about your product.
                    </div>
                </div>

                {/* Footer */}
                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                    <button className="btn-create" onClick={handleSubmit} disabled={isSubmitting}>
                        Create Auction
                    </button>
                </div>
            </div>
            <LoadingOverlay isOpen={isSubmitting} message="Creating Auction..." />
        </div>,
        document.body
    );
};

export default CreateAuctionModal;
