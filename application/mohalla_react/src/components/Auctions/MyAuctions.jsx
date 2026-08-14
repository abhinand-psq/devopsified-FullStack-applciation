import React, { useState, useEffect } from 'react';
import './AuctionsList.css';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MyAuctions = () => {
    const [activeFilter, setActiveFilter] = useState('All');
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Reusing the countdown component from AuctionsList or duplicating it nicely here
    // Since we don't have it exported separately, I'll redefine it for simplicity and robustness
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


    const { data, isLoading, isError } = useQuery({
        queryKey: ['myAuctions'],
        queryFn: async () => {
            try {
                const response = await api.get('/auction/user/my-auctions');
                return response.data.data || [];
            } catch (error) {
                if (error.response) {
                    if (error.response.status === 401) {
                        toast.error("Please login to view your auctions");
                        navigate('/login');
                    } else if (error.response.status === 400) {
                        const errorMsg = error.response.data?.error?.message || error.response.data?.message || "Error fetching auctions";
                        toast.error(errorMsg);
                    } else if (error.response.status >= 500) {
                        toast.error("Server error. Please try again later.");
                    } else {
                        toast.error("Failed to load auctions");
                    }
                }
                throw error;
            }
        },
        retry: false
    });

    const auctions = data || [];

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

    if (isLoading) return <div className="auctions-container" style={{ marginTop: '20px' }}><div style={{ textAlign: 'center' }}>Loading your auctions...</div></div>;
    if (isError) return <div className="auctions-container" style={{ marginTop: '20px' }}><div style={{ textAlign: 'center' }}>Error loading your auctions.</div></div>;

    const liveCount = auctions.filter(a => a.status === 'active').length;
    const totalBids = auctions.reduce((acc, curr) => acc + (curr.stats?.bidCount || 0), 0);

    const handleFinalizeAuction = async (auctionId) => {
        try {
            await api.post(`/auction/auctions/${auctionId}/finalize`);
            toast.success("Winner selected successfully!");
            queryClient.invalidateQueries(['myAuctions']);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400) {
                    const errorMsg = error.response.data?.error?.message || error.response.data?.message || "Error finalizing auction";
                    toast.error(errorMsg);
                } else if (error.response.status === 401) {
                    toast.error("Please login again");
                    navigate('/login');
                } else {
                    toast.error("Oops retry again error");
                }
            } else {
                toast.error("Oops retry again error");
            }
        }
    };

    const handleCloseAuction = async (auctionId) => {
        try {
            await api.post(`/auction/auctions/${auctionId}/close`);
            toast.success("Auction closed successfully!");
            queryClient.invalidateQueries(['myAuctions']);
        } catch (error) {
            if (error.response) {
                if (error.response.status === 400 || error.response.status === 403) {
                    const errorMsg = error.response.data?.error?.message || error.response.data?.message || "Error closing auction";
                    toast.error(errorMsg);
                } else if (error.response.status === 401) {
                    toast.error("Please login again");
                    navigate('/login');
                } else {
                    toast.error("Oops retry again error");
                }
            } else {
                toast.error("Oops retry again error");
            }
        }
    };

    return (
        <div className="auctions-container" style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
            {/* Header Banner */}
            <div className="auctions-header" style={{ backgroundColor: '#6c5ce7', backgroundImage: 'linear-gradient(135deg, #6c5ce7 0%, #a29bfe 100%)' }}>
                <div className="auctions-header-top">
                    <div className="auctions-title-row">
                        <svg className="gavel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'white' }}>
                            <path d="M14 2L9 7M14 12l5-5M3.5 15.5l5.5 5.5M2 22l4-4M10 2l-7 7 10 10 7-7-10-10z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <h2 className="auctions-title" style={{ color: 'white' }}>My Auctions</h2>
                    </div>
                </div>
                <p className="auctions-subtitle" style={{ color: 'rgba(255,255,255,0.9)' }}>Manage the auctions you have created.</p>
                <div className="auctions-stats">
                    <div className="stat-box" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        <span className="stat-value" style={{ color: 'white' }}>{liveCount}</span>
                        <span className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Live Auctions</span>
                    </div>
                    <div className="stat-box" style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.3)' }}>
                        <span className="stat-value" style={{ color: 'white' }}>{totalBids}</span>
                        <span className="stat-label" style={{ color: 'rgba(255,255,255,0.8)' }}>Total Bids on Your Items</span>
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
                        You haven't created any auctions in this category yet.
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

                                {auction.status === 'ended' ? (
                                    <>
                                        <div className="price-row">
                                            <span>Winning Bid:</span>
                                            <span className="price-value current-bid">
                                                {auction.winningBid ? formatCurrency(auction.winningBid.amount) : 'No Bids'}
                                            </span>
                                        </div>
                                        {auction.winner ? (
                                            <div className="seller-info" style={{ color: '#00b894', fontWeight: 500, marginTop: '4px' }}>
                                                <span>Winner: </span>
                                                <span style={{ fontWeight: 600 }}>{auction.winner.username}</span>
                                            </div>
                                        ) : (
                                            <div className="seller-info" style={{ color: '#64748b', fontSize: '0.9em', marginTop: '4px' }}>
                                                Result: Unsold / No Winner
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

                                <div className="card-actions" style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>

                                    {!auction.isClosed && (auction.status === 'active' || auction.status === 'scheduled') && (
                                        <>
                                            <button
                                                className="view-btn outline"
                                                style={{ flex: 1, borderColor: '#e11d48', color: '#e11d48' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleCloseAuction(auction._id);
                                                }}
                                            >
                                                Close
                                            </button>
                                            <button
                                                className="view-btn outline"
                                                style={{ flex: 1, borderColor: '#059669', color: '#059669' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFinalizeAuction(auction._id);
                                                }}
                                            >
                                                Winner
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default MyAuctions;
