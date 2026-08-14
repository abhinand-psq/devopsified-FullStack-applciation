import React, { useState, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import api from '../api/axios';
import './CreateShopModal.css';
import LoadingOverlay from './LoadingOverlay';

const CreateShopModal = ({ isOpen, onClose, onShopCreated, allowedCategories }) => {
    const { subreddit: communityId } = useParams();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        categories: [],
        logo: null,
        banner: null
    });
    const [logoPreview, setLogoPreview] = useState(null);
    const [bannerPreview, setBannerPreview] = useState(null);

    const logoInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    const categoriesList = allowedCategories && allowedCategories.length > 0
        ? allowedCategories
        : [
            "Electronics", "Fashion", "Home & Garden", "Books", "Sports",
            "Toys & Games", "Health & Beauty", "Automotive", "Food & Beverage", "Art & Crafts"
        ];

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCategoryToggle = (category) => {
        setFormData(prev => {
            const newCategories = prev.categories.includes(category)
                ? prev.categories.filter(c => c !== category)
                : [...prev.categories, category];
            return { ...prev, categories: newCategories };
        });
    };

    const handleFileChange = (e, type) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, [type]: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                if (type === 'logo') setLogoPreview(reader.result);
                if (type === 'banner') setBannerPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleNext = () => {
        if (!formData.name.trim() || !formData.description.trim() || formData.categories.length === 0) {
            toast.error("Please enter Shop Name, Shop Description, and select at least one Category.");
            return;
        }
        setStep(2);
    };

    const handleBack = () => {
        setStep(1);
    };

    const handleCreate = async () => {
        if (!formData.logo) {
            toast.error("Please upload a Shop Logo.");
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append('name', formData.name);
        data.append('description', formData.description);

        // Append categories. Assuming backend expects array of strings.
        // If backend expects 'categories[]', use that key. 
        // Based on typical express/multer setup, appending same key works for arrays.
        formData.categories.forEach(cat => {
            data.append('categories[]', cat);
        });

        if (formData.logo) {
            data.append('logo', formData.logo);
        }
        if (formData.banner) {
            data.append('banner', formData.banner);
        }

        try {
            await api.post(`/community/${communityId}/marketplace/shop`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Shop created successfully!");
            if (onShopCreated) {
                onShopCreated();
            }
            onClose();

            // Reset form
            setStep(1);
            setFormData({ name: '', description: '', categories: [], logo: null, banner: null });
            setLogoPreview(null);
            setBannerPreview(null);

        } catch (error) {
            console.error("Error creating shop:", error);
            if (error.response) {
                const errorMsg = error.response.data?.error?.message || error.response.data?.message || "Failed to create shop.";
                toast.error(errorMsg);

                if (error.response.status === 401) {
                    navigate('/login');
                }
            } else {
                toast.error("Network error. Please try again.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return ReactDOM.createPortal(
        <div className="modal-overlay">
            <div className="create-shop-modal">
                <button className="close-modal-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="modal-header">
                    <h2>Set Up Your Shop</h2>
                    <p>Create your marketplace shop to start selling in this community.</p>
                </div>

                <div className="progress-container">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1</div>
                    <div className="progress-line">
                        <div className="progress-line-fill" style={{ width: step === 2 ? '100%' : '0%' }}></div>
                    </div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2</div>
                </div>

                <div className="modal-body">
                    {step === 1 ? (
                        <>
                            <h3>Basic Information</h3>

                            <div className="form-group">
                                <label>Shop Name <span className="required">*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="e.g. Shop Name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    maxLength={50}
                                />
                                <span className="char-count">{formData.name.length}/50 characters</span>
                            </div>

                            <div className="form-group">
                                <label>Shop Description <span className="required">*</span></label>
                                <textarea
                                    name="description"
                                    placeholder="Tell customers about your shop..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    maxLength={500}
                                />
                                <span className="char-count">{formData.description.length}/500 characters</span>
                            </div>

                            <div className="form-group">
                                <label>Categories <span className="required">*</span></label>
                                <p className="helper-text">Select all categories that apply to your shop</p>
                                <div className="categories-grid">
                                    {categoriesList.map(cat => (
                                        <button
                                            key={cat}
                                            className={`category-chip ${formData.categories.includes(cat) ? 'selected' : ''}`}
                                            onClick={() => handleCategoryToggle(cat)}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3>Shop Visuals</h3>
                            <p className="helper-text-large">Add a logo and banner to make your shop stand out</p>

                            <div className="form-group">
                                <label>Shop Logo <span className="required">*</span></label>
                                <div className="upload-area logo-upload" onClick={() => logoInputRef.current.click()}>
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo Preview" className="preview-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={logoInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'logo')}
                                    />
                                </div>
                                <button className="upload-btn-outline" onClick={() => logoInputRef.current.click()}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    Upload Logo
                                </button>
                                <span className="helper-text-small">Square image recommended (min. 200x200px)</span>
                            </div>

                            <div className="form-group">
                                <label>Shop Banner (Optional)</label>
                                <div className="upload-area banner-upload" onClick={() => bannerInputRef.current.click()}>
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner Preview" className="preview-image" />
                                    ) : (
                                        <div className="upload-placeholder">
                                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                                <polyline points="21 15 16 10 5 21"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={bannerInputRef}
                                        style={{ display: 'none' }}
                                        accept="image/*"
                                        onChange={(e) => handleFileChange(e, 'banner')}
                                    />
                                </div>
                                <button className="upload-btn-outline" onClick={() => bannerInputRef.current.click()}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                    Upload Banner
                                </button>
                                <span className="helper-text-small">Wide image recommended (min. 1200x300px)</span>
                            </div>
                        </>
                    )}
                </div>

                <div className="modal-footer">
                    {step === 1 ? (
                        <>
                            <button className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button className="btn-next" onClick={handleNext}>Next</button>
                        </>
                    ) : (
                        <>
                            <button className="btn-back" onClick={handleBack}>Back</button>
                            <div className="footer-right">

                                <button className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                                <button className="btn-create" onClick={handleCreate} disabled={isSubmitting}>
                                    Create Shop
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <LoadingOverlay isOpen={isSubmitting} message="Creating Shop..." />
        </div>,
        document.body
    );
};

export default CreateShopModal;
