import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import './Marketplace.css';
import CreateShopModal from './CreateShopModal';

const Marketplace = ({ communityData }) => {
    const [isCreateShopModalOpen, setIsCreateShopModalOpen] = useState(false);

    const { subreddit: communityId } = useParams();
    const navigate = useNavigate();

    const { data: marketplaceData, isLoading, error, refetch } = useQuery({
        queryKey: ['marketplace', communityId],
        queryFn: async () => {
            const response = await api.get(`/community/${communityId}/marketplace`);
            return response.data;
        },
        retry: false
    });

    useEffect(() => {
        if (error) {
            if (error.response?.status === 401) {
                navigate('/login');
            } else {
                console.error("Error fetching marketplace data:", error);
            }
        }
    }, [error, navigate]);

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: '40px' }}>Loading marketplace...</div>;
    }

    if (error && error.response?.status !== 401) {
        return <div style={{ textAlign: 'center', padding: '40px', color: 'red' }}>Error loading marketplace: {error.response?.data?.error?.message || error.response?.data?.message || error.message}</div>;
    }
    console.log(marketplaceData.data);
    const shops = marketplaceData?.data?.map(shop => ({
        id: shop._id,
        name: shop.name,
        owner: shop.owner?.username || 'unknown',
        description: shop.description,
        tags: shop.categories || [],
        productCount: shop.stats?.productCount || 0,
        image: shop.logo?.url || shop.logo?.publicId || 'https://via.placeholder.com/100',
        banner: shop.banner?.url || shop.banner?.publicId || null
    })) || [];

    return (
        <div className="marketplace-container">
            {/* Header Banner */}
            <div className="marketplace-header-banner">
                <div className="marketplace-header-content">
                    <div className="marketplace-header-left">
                        <div className="marketplace-header-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                            </svg>
                        </div>
                        <div className="marketplace-header-text">
                            <h2>Community Marketplace</h2>
                            <p>Discover and shop from local sellers in r/{communityData?.name || 'community'}</p>
                            <div className="marketplace-stats">
                                <span><strong>{shops.length}</strong> Active Shops</span>
                                <span><strong>{shops.reduce((acc, shop) => acc + shop.productCount, 0)}</strong> Products Listed</span>
                            </div>
                        </div>
                    </div>
                    <button className="create-shop-btn-header" onClick={() => setIsCreateShopModalOpen(true)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Create Shop
                    </button>
                </div>
            </div>

            {/* Start Selling Banner */}
            <div className="start-selling-banner">
                <div className="start-selling-content">
                    <div className="start-selling-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <path d="M16 10a4 4 0 0 1-8 0"></path>
                        </svg>
                    </div>
                    <div className="start-selling-text">
                        <h3>Start Selling Today!</h3>
                        <p>Create your own shop in this community and start selling your products to members. It's free and easy to set up!</p>
                    </div>
                </div>
                <button className="create-shop-btn-blue" onClick={() => setIsCreateShopModalOpen(true)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                    Create Your Shop
                </button>
            </div>

            {/* Browse Shops */}
            <div className="browse-shops-section">
                <h3>Browse Shops</h3>
                <div className="shops-grid">
                    {shops.length > 0 ? (
                        shops.map(shop => (
                            <div className="shop-card" key={shop.id}>
                                {shop.banner && (
                                    <div className="shop-card-banner" style={{ backgroundImage: `url(${shop.banner})` }}></div>
                                )}
                                <div className="shop-card-content">
                                    <div className="shop-card-header">
                                        <img src={shop.image} alt={shop.name} className="shop-image" />
                                        <div className="shop-info">
                                            <h4>{shop.name}</h4>
                                            <span className="shop-owner">by u/{shop.owner}</span>
                                        </div>
                                    </div>
                                    <div className="shop-card-body">
                                        <p>{shop.description}</p>
                                        <div className="shop-tags">
                                            {shop.tags.map(tag => <span key={tag} className="shop-tag">{tag}</span>)}
                                        </div>
                                    </div>
                                    <div className="shop-card-footer">
                                        <span className="product-count">
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                                <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                            </svg>
                                            {shop.productCount} products
                                        </span>
                                        <button className="visit-shop-btn" onClick={() => navigate(`/shop/${shop.id}/${shop.name}`)}>Visit Shop</button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="no-shops-message" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', background: 'white', borderRadius: '8px', border: '1px solid #ccc' }}>
                            <h3>No shops found</h3>
                            <p>There are no shops in this community yet. Be the first to create one!</p>
                            <button className="create-shop-btn-blue" onClick={() => setIsCreateShopModalOpen(true)} style={{ margin: '20px auto' }}>
                                Create Your Shop
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <CreateShopModal
                isOpen={isCreateShopModalOpen}
                onClose={() => setIsCreateShopModalOpen(false)}
                onShopCreated={refetch}
                allowedCategories={communityData?.allowedMarketplaceCategories}
            />
        </div>
    );
};

export default Marketplace;
