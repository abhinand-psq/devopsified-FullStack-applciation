import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../api/axios';
import './CreateServiceForm.css';
import LoadingOverlay from '../LoadingOverlay';

import { toast } from 'sonner';

const CreateServiceForm = ({ onClose, communityId, onSuccess, allowedCategories }) => {
    const [formData, setFormData] = useState({
        title: '',
        category: '',
        priceMin: '',
        priceMax: '',
        phone: '',
        available: true,
        description: '',
        image: null
    });

    const [previewUrl, setPreviewUrl] = useState(null);


    const categories = (allowedCategories && allowedCategories.length > 0) ? allowedCategories : [];

    const createServiceMutation = useMutation({
        mutationFn: async (serviceData) => {
            const response = await api.post(`/communities/${communityId}/services`, serviceData, {
                headers: {
                    'Content-Type': undefined,
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            toast.success("Service created successfully");
            if (onSuccess) onSuccess(data);
            else onClose();
        },
        onError: (error) => {
            console.error("Error creating service:", error);
            toast.error(error.response?.data?.error?.message || error.response?.data?.message || "Failed to create service");
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    // Monitor form data changes


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        console.log("File selected:", file);

        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Basic validation
        if (!formData.title || !formData.category || !formData.priceMin) {
            alert('Please fill in required fields');
            return;
        }

        const data = new FormData();

        data.append('title', formData.title);
        data.append('category', formData.category);
        data.append('priceMin', formData.priceMin);
        if (formData.priceMax) data.append('priceMax', formData.priceMax);
        data.append('phone', formData.phone);
        data.append('available', formData.available);
        data.append('description', formData.description);

        data.append('image', formData.image);



        createServiceMutation.mutate(data);
    };

    return ReactDOM.createPortal(
        <div className="create-service-overlay" onClick={onClose}>
            <div className="create-service-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Service</h2>
                    <button className="close-btn-simple" onClick={onClose}>&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="create-service-form">
                    <div className="form-group">
                        <label>Service Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="e.g. House Cleaning Service"
                            required
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Category *</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Phone Number *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                placeholder="+1 234 567 8900"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Min Price (₹)</label>
                            <input
                                type="number"
                                name="priceMin"
                                value={formData.priceMin}
                                onChange={handleChange}
                                placeholder="0"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Max Price (₹)</label>
                            <input
                                type="number"
                                name="priceMax"
                                value={formData.priceMax}
                                onChange={handleChange}
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor='disc'>Description</label>
                        <textarea
                            name="description"
                            id='disc'
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="Describe your service..."
                            rows="4"
                        ></textarea>
                    </div>

                    <div className="form-group">
                        <label htmlFor="service-image">Service Image</label>
                        <div className="image-upload-area">
                            <input
                                type="file"
                                id="service-image"
                                accept="image/*"
                                onChange={handleImageChange}
                                hidden
                            />
                            <label htmlFor="service-image" className="upload-label">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Preview" className="image-preview" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    <div className="form-group checkbox-group">
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                name="available"
                                checked={formData.available}
                                onChange={handleChange}
                            />
                            <span className="slider round"></span>
                            <span className="toggle-label">Available for new clients</span>
                        </label>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="cancel-btn" onClick={onClose} disabled={createServiceMutation.isPending}>Cancel</button>
                        <button type="submit" className="submit-btn" disabled={createServiceMutation.isPending}>
                            Create Service
                        </button>
                    </div>
                </form>
            </div>
            <LoadingOverlay isOpen={createServiceMutation.isPending} message="Creating Service..." />
        </div>,
        document.body
    );
};

export default CreateServiceForm;
