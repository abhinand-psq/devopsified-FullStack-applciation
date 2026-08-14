import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';
import './CreateCommunityModal.css';
import LoadingOverlay from './LoadingOverlay';

const CreateCommunityModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        privacy: 'public',
        description: '',
        allowedMarketplaceCategories: ''
    });
    const [iconFile, setIconFile] = useState(null);
    const [bannerFile, setBannerFile] = useState(null);
    const [iconPreview, setIconPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const iconInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const createCommunityMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.post('/communities/create', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            queryClient.invalidateQueries({ queryKey: ['myCommunities'] });
            queryClient.invalidateQueries({ queryKey: ['myCommunitiesMin'] });
            onClose();
            toast.success('Community created successfully!');
            // Redirect to home feed as requested
            navigate('/');
        },
        onError: (error) => {
            const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create community';
            toast.error(errorMsg);
            if (error.response && error.response.status === 401) {
                navigate('/login');
            }
        }
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
                toast.error('Only JPEG, JPG, and PNG files are allowed.');
                return;
            }

            if (type === 'icon') {
                setIconFile(file);
                setIconPreview(URL.createObjectURL(file));
            } else if (type === 'banner') {
                setBannerFile(file);
                setBannerPreview(URL.createObjectURL(file));
            }
        }
    };

    const handleNext = () => {
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleCreate = () => {
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);
        data.append('privacy', formData.privacy); // Sending privacy as string: 'public', 'private', or 'restricted'

        // Convert comma-separated string to array
        const categories = formData.allowedMarketplaceCategories
            .split(',')
            .map(cat => cat.trim())
            .filter(cat => cat);

        categories.forEach(cat => data.append('allowedMarketplaceCategories[]', cat));

        if (iconFile) {
            data.append('icon', iconFile);
        }
        if (bannerFile) {
            data.append('banner', bannerFile);
        }

        createCommunityMutation.mutate(data);
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>Create New Community</h2>
                        <p className="modal-subtitle">Build your community and connect with like-minded people.</p>
                    </div>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M18 6L6 18M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="stepper-container">
                    <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className={`step-line ${step >= 2 ? 'filled' : ''}`}></div>
                    <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>2</div>
                </div>

                <div className="modal-body">
                    {step === 1 ? (
                        <>
                            <div className="form-group">
                                <h3 className="form-label" style={{ fontSize: '16px', marginBottom: '12px' }}>Basic Details</h3>
                                <div className="form-row">
                                    <div className="form-col">
                                        <div className="label-row">
                                            <label className="form-label">Community Name <span className="required">*</span></label>
                                        </div>
                                        <input
                                            type="text"
                                            name="name"
                                            className="form-input"
                                            placeholder="e.g., Community Name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            maxLength={50}
                                        />
                                        <span className="char-count">{formData.name.length}/50 characters</span>
                                    </div>
                                    <div className="form-col">
                                        <div className="label-row">
                                            <label className="form-label">Privacy <span className="required">*</span></label>
                                        </div>
                                        <select
                                            name="privacy"
                                            className="form-select"
                                            value={formData.privacy}
                                            onChange={handleInputChange}
                                        >
                                            <option value="public">Public - Anyone can view and join</option>
                                            <option value="restricted">Restricted - Anyone can view, but only approved users can post</option>
                                            <option value="private">Private - Only approved users can view and submit</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="form-group">
                                <div className="label-row">
                                    <label className="form-label">Description <span className="required">*</span></label>
                                </div>
                                <textarea
                                    name="description"
                                    className="form-textarea"
                                    placeholder="Tell us about your community..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                ></textarea>
                                <span className="char-count">{formData.description.length}/500 characters</span>
                            </div>

                            <div className="form-group">
                                <h3 className="form-label" style={{ fontSize: '16px', marginBottom: '12px' }}>Media</h3>
                                <div className="media-section">
                                    <div className="media-box" onClick={() => iconInputRef.current.click()}>
                                        <div className="label-row" style={{ width: '100%', marginBottom: '8px' }}>
                                            <label className="form-label">Community Icon</label>
                                        </div>
                                        <div className="media-placeholder">
                                            {iconPreview ? (
                                                <img src={iconPreview} alt="Icon Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="upload-text">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            Upload Icon
                                        </div>
                                        <input
                                            type="file"
                                            ref={iconInputRef}
                                            style={{ display: 'none' }}
                                            accept="image/jpeg, image/jpg, image/png"
                                            onChange={(e) => handleFileChange(e, 'icon')}
                                        />
                                    </div>
                                    <div className="media-box banner" onClick={() => bannerInputRef.current.click()}>
                                        <div className="label-row" style={{ width: '100%', marginBottom: '8px' }}>
                                            <label className="form-label">Community Banner</label>
                                        </div>
                                        <div className="media-placeholder">
                                            {bannerPreview ? (
                                                <img src={bannerPreview} alt="Banner Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                                            ) : (
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                    <circle cx="8.5" cy="8.5" r="1.5" />
                                                    <polyline points="21 15 16 10 5 21" />
                                                </svg>
                                            )}
                                        </div>
                                        <div className="upload-text">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                                <polyline points="17 8 12 3 7 8" />
                                                <line x1="12" y1="3" x2="12" y2="15" />
                                            </svg>
                                            Upload Banner
                                        </div>
                                        <input
                                            type="file"
                                            ref={bannerInputRef}
                                            style={{ display: 'none' }}
                                            accept="image/jpeg, image/jpg, image/png"
                                            onChange={(e) => handleFileChange(e, 'banner')}
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-group">
                                <h3 className="form-label" style={{ fontSize: '16px', marginBottom: '4px' }}>Marketplace Settings</h3>
                                <p style={{ fontSize: '14px', color: '#7c7c7c', marginBottom: '16px' }}>Configure what items can be sold in your community</p>

                                <div className="form-group">
                                    <label className="form-label" style={{ display: 'block', marginBottom: '8px' }}>Allowed Marketplace Categories</label>
                                    <p style={{ fontSize: '12px', color: '#7c7c7c', marginBottom: '8px' }}>
                                        Enter categories separated by commas (e.g., dress, chocolate, phone). These will be available for users when listing items.
                                    </p>
                                    <input
                                        type="text"
                                        name="allowedMarketplaceCategories"
                                        className="form-input"
                                        placeholder="e.g. electronics, clothing, books"
                                        value={formData.allowedMarketplaceCategories}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="summary-box">
                                <h3 className="summary-title">Summary</h3>
                                <div className="summary-row">
                                    <span className="summary-label">Community Name:</span>
                                    <span className="summary-value">{formData.name}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Privacy:</span>
                                    <span className="summary-value">{formData.privacy}</span>
                                </div>
                                <div className="summary-row">
                                    <span className="summary-label">Marketplace Categories:</span>
                                    <span className="summary-value">
                                        {formData.allowedMarketplaceCategories ? formData.allowedMarketplaceCategories.split(',').map(cat => cat.trim()).filter(cat => cat).join(', ') : 'None'}
                                    </span>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    {step === 1 ? (
                        <>
                            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button className="btn btn-primary" onClick={handleNext}>Next</button>
                        </>
                    ) : (
                        <>
                            <button className="btn btn-secondary" onClick={handleBack}>Back</button>
                            <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                            <button
                                className="btn btn-primary green"
                                onClick={handleCreate}
                                disabled={createCommunityMutation.isPending}
                            >
                                Create Community
                            </button>
                        </>
                    )}
                </div>
            </div>
            <LoadingOverlay isOpen={createCommunityMutation.isPending} message="Creating Community..." />
        </div>,
        document.body
    );
};

export default CreateCommunityModal;
