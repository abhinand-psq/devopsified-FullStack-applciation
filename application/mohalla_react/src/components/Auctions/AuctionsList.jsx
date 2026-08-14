import React, { useState, useEffect } from 'react';
import './AuctionsList.css';
import AuctionDetails from './AuctionDetails';
import CreateAuctionModal from './CreateAuctionModal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';

const Countdown = ({ targetDate, status }) => {
    const calculateTimeLeft = () => {
        const difference = +new Date(targetDate) - +new Date();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                d: Math.floor(difference / (1000 * 60 * 60 * 24)),
                h: Math.floor((difference / (1000 * 60 * 60)) % 24),
                m: Math.floor((difference / 1000 / 60) % 60),
                s: Math.floor((difference / 1000) % 60),
            };
        } else {
            return null; // Time is up
        }
        return timeLeft;
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    if (!timeLeft) {
        return <span>{status === 'active' ? 'Auction Ended' : 'Starting Soon'}</span>;
    }

    const { d, h, m, s } = timeLeft;
    const timeString = `${d > 0 ? `${d}d ` : ''}${h}h ${m}m ${s}s`;

    return (
        <span>
            {status === 'active' ? 'Ends in ' : 'Starts in '}
            {timeString}
        </span>
    );
};

import { useNavigate } from 'react-router-dom';

const AuctionsList = ({ communityId }) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['communityAuctions', communityId],
        queryFn: async () => {
            if (!communityId) return { auctions: [] }; // Safety check
            const response = await api.get(`/auction/community/${communityId}/feed?page=1&limit=20`);
            const feed = response.data.data || response.data || [];
            return Array.isArray(feed) ? feed : (feed.auctions || []);
        },
        enabled: !!communityId,
    });

    const auctions = data || [];

    const queryClient = useQueryClient();

    const handleCreateAuction = (newAuction) => {
        setIsCreateModalOpen(false);
        queryClient.invalidateQueries(['communityAuctions', communityId]);
    };

    const filteredAuctions = activeFilter === 'All'
        ? auctions
        : auctions.filter(a => a.status.toLowerCase() === activeFilter.toLowerCase());

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };


    if (isLoading) return <div className="auctions-container"><div style={{ textAlign: 'center' }}>Loading auctions...</div></div>;
    if (isError) return <div className="auctions-container"><div style={{ textAlign: 'center' }}>Error loading auctions.</div></div>;

    const liveCount = auctions.filter(a => a.status === 'active').length;
    const totalBids = auctions.reduce((acc, curr) => acc + (curr.stats?.bidCount || 0), 0);

    return (
        <div className="auctions-container">
            {/* Header Banner */}
            <div className="auctions-header">
                <div className="auctions-header-top">
                    <div className="auctions-title-row">
                        <svg className="gavel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M14 2L9 7M14 12l5-5M3.5 15.5l5.5 5.5M2 22l4-4M10 2l-7 7 10 10 7-7-10-10z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="auctions-title">Community Auctions</h2>
                    </div>
                    <button className="create-auction-btn" onClick={() => setIsCreateModalOpen(true)}>Create Auction</button>
                </div>
                <p className="auctions-subtitle">Bid on items from trusted community members.</p>
                <div className="auctions-stats">
                    <div className="stat-box">
                        <span className="stat-value">{liveCount}</span>
                        <span className="stat-label">Live Auctions</span>
                    </div>
                    <div className="stat-box">
                        <span className="stat-value">{totalBids}</span>
                        <span className="stat-label">Total Bids</span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="auctions-filters">
                {['All', 'Active', 'Scheduled', 'Ended'].map(filter => (
                    <button
                        key={filter}
                        className={`filter-tab ${activeFilter === filter ? 'active' : ''}`}
                        onClick={() => setActiveFilter(filter)}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="auctions-grid">
                {filteredAuctions.length === 0 ? (
                    <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#64748b' }}>
                        No auctions found in this category.
                    </div>
                ) : (
                    filteredAuctions.map(auction => (
                        <div key={auction._id || auction.id} className="auction-card">
                            <div className="card-image-container">
                                {auction.image && auction.image.url ? (
                                    <img src={auction.image.url} alt={auction.title} className="card-image" />
                                ) : (
                                    <div style={{ width: '100%', height: '100%', background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        No Image
                                    </div>
                                )}
                                <span className={`status-badge ${auction.status}`}>
                                    {auction.status.toUpperCase()}
                                </span>
                            </div>
                            <div className="card-details">
                                <h3 className="auction-title" title={auction.title}>{auction.title}</h3>
                                {/* <div className="seller-info">by u/{auction.seller?.username || 'user'}</div> */}

                                {auction.status === 'ended' ? (
                                    <>
                                        <div className="price-row">
                                            <span>Winning Bid:</span>
                                            <span className="price-value current-bid">
                                                {auction.highestBid ? formatCurrency(auction.highestBid.amount) : 'No Bids'}
                                            </span>
                                        </div>
                                        {auction.highestBid?.bidder && (
                                            <div className="seller-info" style={{ color: '#00b894', fontWeight: 500 }}>
                                                {typeof auction.highestBid.bidder === 'object' && auction.highestBid.bidder.username
                                                    ? `Winner: u/${auction.highestBid.bidder.username}`
                                                    : `Winner ID: ${typeof auction.highestBid.bidder === 'string' ? auction.highestBid.bidder.substring(0, 8) + '...' : 'Unknown'}`
                                                }
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <div className="price-row">
                                            <span>Starting Price:</span>
                                            <span className="price-value">{formatCurrency(auction.startingPrice)}</span>
                                        </div>
                                        <div className="price-row">
                                            <span>Current Bid:</span>
                                            <span className="price-value current-bid">
                                                {auction.highestBid ? formatCurrency(auction.highestBid.amount) : 'No Bids'}
                                            </span>
                                        </div>
                                    </>
                                )}

                                <div className="time-row">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"></circle>
                                        <polyline points="12 6 12 12 16 14"></polyline>
                                    </svg>
                                    {auction.status === 'active' && <Countdown targetDate={auction.auctionEndTime} status="active" />}
                                    {auction.status === 'scheduled' && <Countdown targetDate={auction.auctionStartTime} status="scheduled" />}
                                    {auction.status === 'ended' && <span>Ended</span>}
                                </div>

                                <div className="bids-count">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                        <circle cx="9" cy="7" r="4"></circle>
                                        <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                        <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                    </svg>
                                    {auction.stats?.bidCount || 0} bids
                                </div>

                                <button
                                    className={`view-btn ${auction.status === 'active' ? 'primary' : 'outline'}`}
                                    onClick={() => navigate(`/auction/${auction._id}`)}
                                >
                                    {auction.status === 'active' ? 'Bid Now' : 'View Details'}
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Auction Modal */}
            {isCreateModalOpen && (
                <CreateAuctionModal
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateAuction}
                    communityId={communityId}
                />
            )}
        </div>
    );
};

export default AuctionsList;
