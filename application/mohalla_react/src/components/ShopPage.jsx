import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import { useUser } from '../hooks/useAuth';
import CreateProductModal from './CreateProductModal';
import CartDrawer from './CartDrawer';
import './ShopPage.css';

const ShopPage = () => {
    const { shopId, shopName } = useParams();
    const navigate = useNavigate();
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isCreateProductModalOpen, setIsCreateProductModalOpen] = useState(false);
    const { data: user } = useUser();

    const { data: shopData } = useQuery({
        queryKey: ['shop', shopId],
        queryFn: async () => {
            const response = await api.get(`/shop/${shopId}`);
            return response.data;
        },
        enabled: !!shopId
    });

    const { data: productsData, isLoading, error, refetch: refetchProducts } = useQuery({
        queryKey: ['shopProducts', shopId],
        queryFn: async () => {
            const response = await api.get(`/shop/${shopId}/products`);
            return response.data;
        },
        enabled: !!shopId
    });

    const products = productsData?.data?.map(product => ({
        id: product._id,
        name: product.title,
        description: product.description,
        price: product.price,
        image: product.image?.url,
        type: product.category,
        stock: product.stock,
        condition: product.condition
    })) || [];

    const shopOwnerId = shopData?.data?.owner?._id || shopData?.data?.owner;
    const isOwner = user?._id && shopOwnerId && user._id === shopOwnerId;

    const handleAddToCart = (product) => {
        setCartItems(prev => [...prev, product]);
        setIsCartOpen(true);
    };

    const handleRemoveFromCart = (index) => {
        setCartItems(prev => prev.filter((_, i) => i !== index));
    };

    if (isLoading) {
        return (
            <div className="shop-page">
                <header className="shop-header">
                    <div className="shop-logo-container">
                        <div className="logo-blur"></div>
                        <h1 className="shop-logo">{shopName || 'Alloy Beauty'}</h1>
                    </div>
                </header>
                <main className="shop-content">
                    <div style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="shop-page">
                <header className="shop-header">
                    <div className="shop-logo-container">
                        <div className="logo-blur"></div>
                        <h1 className="shop-logo">{shopName || 'Alloy Beauty'}</h1>
                    </div>
                </header>
                <main className="shop-content">
                    <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error loading products. Please try again later.</div>
                </main>
            </div>
        );
    }

    return (
        <div className="shop-page">
            {/* Header */}
            <header className="shop-header">
                <div className="shop-logo-container">
                    <div className="logo-blur"></div>
                    <h1 className="shop-logo">{shopName || 'Alloy Beauty'}</h1>
                </div>

                <div className="shop-nav-actions">
                    {isOwner && (
                        <button className="nav-btn create-product-btn" onClick={() => setIsCreateProductModalOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                            <span>Create Product</span>
                        </button>
                    )}
                    <button className="nav-btn user-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <span>{user ? user.username : 'Log In'}</span>
                    </button>
                    <button className="nav-btn cart-btn" onClick={() => setIsCartOpen(true)}>
                        <div className="cart-icon-wrapper">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <path d="M16 10a4 4 0 0 1-8 0"></path>
                            </svg>
                            <span className="cart-count">{cartItems.length}</span>
                        </div>
                    </button>
                    <button className="nav-btn menu-btn">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="shop-content">
                {products.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', width: '100%', gridColumn: '1 / -1' }}>
                        No products found in this shop.
                    </div>
                ) : (
                    <div className="products-grid">
                        {products.map((product) => (
                            <div key={product.id} className="product-card">
                                <div className="product-image-container">
                                    <img src={product.image || "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?auto=format&fit=crop&w=800&q=80"} alt={product.name} />
                                    <div className="product-overlay-logo">Alloy</div>
                                </div>
                                <div className="product-info">
                                    <h2>{product.name}</h2>
                                    <p>{product.description}</p>
                                    <div className="product-meta">
                                        <span className="product-stock">Stock: {product.stock}</span>
                                        <span className="product-condition">Condition: {product.condition}</span>
                                    </div>
                                    <div className="product-price">₹{product.price}</div>
                                    <button className="add-to-cart-btn" onClick={() => handleAddToCart(product)}>
                                        ADD TO CART
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Chat Button */}
            <button className="chat-btn">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                </svg>
            </button>

            <CreateProductModal
                isOpen={isCreateProductModalOpen}
                onClose={() => setIsCreateProductModalOpen(false)}
                shopId={shopId}
                onProductCreated={refetchProducts}
                categories={shopData?.data?.categories || []}
            />

            <CartDrawer
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                cartItems={cartItems}
                onRemoveItem={handleRemoveFromCart}
            />
        </div>
    );
};

export default ShopPage;
