import React, { useState, useRef } from 'react';
import { toast } from 'sonner';
import api from '../api/axios';
import './CreateProductModal.css';

const CreateProductModal = ({ isOpen, onClose, shopId, onProductCreated, categories = [] }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const imageInputRef = useRef(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        stock: '',
        category: '',
        condition: 'new',
        image: null
    });

    if (!isOpen) return null;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.price || !formData.stock || !formData.category) {
            toast.error("Please fill in all required fields.");
            return;
        }

        setIsSubmitting(true);
        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('price', formData.price);
        data.append('stock', formData.stock);
        data.append('category', formData.category);
        data.append('condition', formData.condition);

        if (formData.image) {
            data.append('image', formData.image);
        }

        try {
            await api.post(`/shop/${shopId}/product`, data, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            toast.success("Product created successfully!");
            if (onProductCreated) {
                onProductCreated();
            }
            onClose();

            // Reset form
            setFormData({
                title: '',
                description: '',
                price: '',
                stock: '',
                category: '',
                condition: 'new',
                image: null
            });
            setImagePreview(null);

        } catch (error) {
            console.error("Error creating product:", error);
            toast.error(error.response?.data?.error?.message || error.response?.data?.message || "Failed to create product.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="create-product-modal">
                <button className="close-modal-btn" onClick={onClose}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                <div className="modal-header">
                    <h2>Add New Product</h2>
                    <p>List a new item in your shop.</p>
                </div>

                <div className="modal-body">
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Product Title <span className="required">*</span></label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleInputChange}
                                placeholder="e.g., Product Name"
                                maxLength={100}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe your product..."
                                rows={4}
                                maxLength={1000}
                            />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Price (₹) <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    placeholder="0.00"
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Stock <span className="required">*</span></label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleInputChange}
                                    placeholder="0"
                                    min="0"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Category <span className="required">*</span></label>
                                <select
                                    name="category"
                                    value={formData.category}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Select Category</option>
                                    {categories.length > 0 ? (
                                        categories.map((cat, index) => (
                                            <option key={index} value={typeof cat === 'string' ? cat : cat.name || cat.title}>
                                                {typeof cat === 'string' ? cat : cat.name || cat.title}
                                            </option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No categories available</option>
                                    )}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Condition</label>
                                <select name="condition" value={formData.condition} onChange={handleInputChange}>
                                    <option value="new">New</option>
                                    <option value="like_new">Like New</option>
                                    <option value="good">Good</option>
                                    <option value="fair">Fair</option>
                                    <option value="poor">Poor</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Product Image</label>
                            <div className="upload-area" onClick={() => imageInputRef.current.click()}>
                                {imagePreview ? (
                                    <img src={imagePreview} alt="Preview" className="preview-image" />
                                ) : (
                                    <div className="upload-placeholder">
                                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                            <polyline points="21 15 16 10 5 21"></polyline>
                                        </svg>
                                        <span>Click to upload image</span>
                                    </div>
                                )}
                                <input
                                    type="file"
                                    ref={imageInputRef}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button type="button" className="btn-cancel" onClick={onClose} disabled={isSubmitting}>Cancel</button>
                            <button type="submit" className="btn-create" disabled={isSubmitting}>
                                {isSubmitting ? 'Creating...' : 'Create Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreateProductModal;
