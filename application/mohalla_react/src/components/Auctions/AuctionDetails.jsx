import React, { useState, useEffect } from 'react';
import './AuctionDetails.css';
import api from '../../api/axios';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';

const AuctionDetails = () => {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [bidAmount, setBidAmount] = useState('');
    const [timeLeft, setTimeLeft] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Auction Data
    const { data: auction, isLoading, isError } = useQuery({
        queryKey: ['auction', auctionId],
        queryFn: async () => {
            const response = await api.get(`/auction/${auctionId}`);

            return response.data.data || response.data;
        },
        enabled: !!auctionId
    });

    console.log("anwe", auction?.createdBy);
    // Fetch Bid History
    const { data: bidHistoryData } = useQuery({
        queryKey: ['auctionHistory', auctionId],
        queryFn: async () => {
            const response = await api.get(`/auction/${auctionId}/history`);
            return response.data.data;
        },
        enabled: !!auctionId
    });

    const bidHistory = bidHistoryData?.history || [];

    // Update time left timer
    useEffect(() => {
        if (!auction) return;

        const calculateTimeLeft = () => {
            let targetDate;
            if (auction.status === 'scheduled') {
                targetDate = auction.auctionStartTime;
            } else {
                targetDate = auction.auctionEndTime;
            }

            if (!targetDate) return null;

            const difference = +new Date(targetDate) - +new Date();
            let tl = {};

            if (difference > 0) {
                tl = {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            } else {
                return null; // Time is up
            }
            return tl;
        };

        setTimeLeft(calculateTimeLeft());

        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [auction]);


    // Set initial bid amount when auction data is loaded
    useEffect(() => {
        if (auction) {
            const currentPrice = auction.highestBid?.amount || auction.stats?.highestBidAmount || auction.startingPrice || 0;
            const minIncrement = auction.minimumBidIncrement || 100;
            setBidAmount((currentPrice + minIncrement).toString());
        }
    }, [auction]);


    if (isLoading) {
        return (
            <div className="auction-details-container">
                <div style={{ textAlign: 'center', padding: '40px' }}>Loading auction details...</div>
            </div>
        );
    }

    if (isError || !auction) {
        return (
            <div className="auction-details-container">
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <h2>Auction not found</h2>
                    <button className="back-to-auctions-btn" onClick={() => navigate(-1)} style={{ margin: '20px auto' }}>
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // Destructure data from the auction object
    const {
        _id,
        title,
        description,
        startingPrice,
        minimumBidIncrement = 100,
        stats,
        image: imageObj,
        highestBid,
        winningBid,
        winner,
        createdBy,
        status: apiStatus,
        seller,
        community,
        auctionStartTime,
        auctionEndTime,
        isClosed
    } = auction;

    // Derive status if not present (handling raw DB objects)
    const status = apiStatus || (() => {
        if (isClosed) return 'ended';
        const now = new Date();
        const start = new Date(auctionStartTime);
        const end = new Date(auctionEndTime);
        if (now < start) return 'scheduled';
        if (now > end) return 'ended';
        return 'active';
    })();

    // Derived values
    const imageUrl = imageObj?.url || (typeof imageObj === 'string' ? imageObj : '') || '';

    // Calculate current price or winning price
    // If ended, prefer winningBid.amount. If active, prefer highestBid.amount. generic fallback to stats
    const currentPrice = winningBid?.amount || highestBid?.amount || stats?.highestBidAmount || startingPrice || 0;
    const bidCountVal = stats?.bidCount || 0;

    // Calculate minimum valid bid
    const minBid = currentPrice + minimumBidIncrement;

    // Winner Logic
    const winnerUser = winner || (typeof winner === 'object' ? winner : null);
    const winnerName = winnerUser?.username || (typeof winner === 'string' ? "User" : null);

    const formatTimeRemaining = (tl) => {
        if (!tl) {
            if (status === 'scheduled') return "Starting Soon";
            return "Ended";
        }
        const { days, hours, minutes, seconds } = tl;
        const timeStr = days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m ${seconds}s`;

        if (status === 'scheduled') return `Starts in ${timeStr}`;
        return `Ends in ${timeStr}`;
    };

    console.log(seller);


    const timeRemainingString = formatTimeRemaining(timeLeft);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // User / Seller Display Logic
    // API returns 'createdBy' as object with username, OR 'seller'
    const sellerInfo = typeof createdBy === 'object' && createdBy;
    const sellerName = sellerInfo?.username || 'Unknown Seller';
    const sellerAvatarUrl = sellerInfo?.profilePic?.url;
    const sellerAvatarInitial = sellerName.charAt(0).toUpperCase();


    const handleQuickBid = (increment) => {
        setBidAmount((parseInt(bidAmount || 0) + increment).toString());
    };

    const handlePlaceBid = async () => {
        if (!bidAmount) {
            toast.error("Please enter a bid amount");
            return;
        }

        const amount = parseFloat(bidAmount);
        if (isNaN(amount)) {
            toast.error("Invalid bid amount");
            return;
        }

        // Validate against current calculated minBid
        const latestMinBid = (highestBid?.amount || startingPrice) + minimumBidIncrement;
        if (amount < latestMinBid) {
            // If we want to be strict, we check against the latest data, 
            // but using local derived 'minBid' is usually fine for UI feedback.
            toast.error(`Bid must be at least ${formatCurrency(latestMinBid)}`);
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await api.post(`/auction/bids/${_id}/bid`, { amount });

            if (response.status === 200 || response.status === 201) {
                toast.success("Bid placed successfully!");
                queryClient.invalidateQueries(['auction', auctionId]); // Refetch this auction
                queryClient.invalidateQueries(['auctionHistory', auctionId]); // Refetch history
                if (community) {
                    queryClient.invalidateQueries(['communityAuctions', community]);
                }
            }
        } catch (error) {
            console.error("Place bid error:", error);
            if (error.response) {
                if (error.response.status === 400) {
                    // Show specific error from backend for bad requests (e.g. bid too low)
                    const errorMsg = error.response.data.error?.message || error.response.data.message || "Invalid bid";
                    toast.error(errorMsg);
                } else if (error.response.status === 401) {
                    toast.error("Please login to place a bid");
                    navigate('/login');
                } else {
                    toast.error("Error in placing bid");
                }
            } else {
                toast.error("Error in placing bid");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const onBack = () => {
        navigate(-1);
    };


    console.log(auction);


    return (
        <div className="auction-details-container">
            {/* Back Button */}
            <div className="back-btn-container">
                <button className="back-to-auctions-btn" onClick={onBack}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Auctions
                </button>
            </div>

            <div className="details-layout">
                {/* Left Column */}
                <div className="details-left">
                    <div className="main-image-card">
                        {imageUrl ? (
                            <img src={imageUrl} alt={title} className="main-image" />
                        ) : (
                            <div style={{ width: '100%', height: '300px', backgroundColor: '#f0f2f5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                No Image Available
                            </div>
                        )}

                        {status === 'active' && (
                            <div className="live-badge-overlay">
                                <span className="live-dot"></span>
                                LIVE
                            </div>
                        )}
                        {status === 'scheduled' && (
                            <div className="live-badge-overlay" style={{ background: 'rgba(59, 130, 246, 0.9)' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                                UPCOMING
                            </div>
                        )}
                        {status === 'ended' && (
                            <div className="live-badge-overlay" style={{ background: 'rgba(100, 116, 139, 0.9)' }}>
                                ENDED
                            </div>
                        )}
                    </div>

                    <div className="info-card">
                        <h3>Product Details</h3>
                        <div className="product-title-section" style={{ marginBottom: '10px' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1a1a1b' }}>{title}</h2>
                        </div>
                        <p className="product-description">{description || "No description provided by the seller."}</p>
                    </div>

                    <div className="info-card">
                        <h3>Seller Information</h3>
                        <div className="seller-profile">
                            <div className="seller-avatar-large">
                                {sellerAvatarUrl ? (
                                    <img src={sellerAvatarUrl} alt={sellerName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                ) : (
                                    sellerAvatarInitial
                                )}
                            </div>
                            <div className="seller-details">
                                <h4>{sellerName}</h4>
                                <span className="seller-role">Community Member</span>
                            </div>
                        </div>
                        <div className="seller-meta">

                            <div className="meta-item verified-text">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                                </svg>
                                {auction?.createdBy.isVerified ? "Verified" : "Not Verified"}

                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="details-right">
                    {/* Current Bid */}
                    <div className="current-bid-card">
                        <div className="bid-label">
                            {status === 'ended' ? 'Winning Bid' : 'Current Highest Bid'}
                        </div>
                        <div className="bid-amount-large">{formatCurrency(currentPrice)}</div>
                        <div className="bid-timer">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"></circle>
                                <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            {status === 'ended' ? 'Auction Ended' : timeRemainingString}
                        </div>
                    </div>

                    {/* Place Bid - Only Active */}
                    {status === 'active' && (
                        <div className="place-bid-card">
                            <h3>Place Your Bid</h3>
                            <div className="min-bid-hint">Minimum bid: {formatCurrency(minBid)}</div>

                            <div className="bid-input-group">
                                <span className="currency-symbol">₹</span>
                                <input
                                    type="number"
                                    className="bid-input"
                                    value={bidAmount}
                                    onChange={(e) => setBidAmount(e.target.value)}
                                    min={minBid}
                                />
                            </div>

                            <button
                                className="place-bid-btn"
                                onClick={handlePlaceBid}
                                disabled={isSubmitting}
                                style={{ opacity: isSubmitting ? 0.7 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
                            >
                                {isSubmitting ? (
                                    <>
                                        <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="31.4 31.4" strokeLinecap="round" transform="rotate(-90 12 12)">
                                                <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite" />
                                            </circle>
                                        </svg>
                                        Placing Bid...
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2L9 7M14 12l5-5M3.5 15.5l5.5 5.5M2 22l4-4M10 2l-7 7 10 10 7-7-10-10z" />
                                        </svg>
                                        Place Bid
                                    </>
                                )}
                            </button>

                            <div className="quick-bid-buttons">
                                <button className="quick-bid-btn" onClick={() => handleQuickBid(100)}>+₹100</button>
                                <button className="quick-bid-btn" onClick={() => handleQuickBid(500)}>+₹500</button>
                            </div>
                        </div>
                    )}

                    {/* Scheduled Info */}
                    {status === 'scheduled' && (
                        <div className="place-bid-card" style={{ borderColor: '#3b82f6', backgroundColor: '#eff6ff' }}>
                            <h3 style={{ color: '#1d4ed8' }}>Upcoming Auction</h3>
                            <p style={{ color: '#444', marginBottom: '10px' }}>
                                This auction is scheduled to start on <br />
                                <strong>{new Date(auctionStartTime).toLocaleString()}</strong>
                            </p>
                            <div className="min-bid-hint" style={{ color: '#3b82f6' }}>
                                Prepare to bid! Starting Price: {formatCurrency(startingPrice)}
                            </div>
                        </div>
                    )}

                    {/* Winner Display for Ended Auctions */}
                    {status === 'ended' && (
                        <div className="place-bid-card" style={{ borderColor: winnerName ? '#00b894' : '#64748b', backgroundColor: winnerName ? '#f0fdf4' : '#f8fafc' }}>
                            <h3 style={{ color: winnerName ? '#00b894' : '#64748b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5z"></path>
                                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5 2.5 2.5 0 0 0 0 5z"></path>
                                    <path d="M4 22h16"></path>
                                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"></path>
                                </svg>
                                {winnerName ? "Auction Winner" : "Auction Ended"}
                            </h3>

                            {winnerName ? (
                                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{
                                            width: '40px', height: '40px', borderRadius: '50%', background: '#00b894', color: 'white',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', overflow: 'hidden'
                                        }}>
                                            {/* We could use winner profile pic here if available in winner object */}
                                            {winnerName.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '600', color: '#1e293b' }}>{winnerName}</div>
                                            <div style={{ fontSize: '12px', color: '#64748b' }}>Winning Bidder</div>
                                        </div>
                                        <div style={{ marginLeft: 'auto', fontWeight: 'bold', fontSize: '18px', color: '#00b894' }}>
                                            {formatCurrency(winningBid?.amount || currentPrice)}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ marginTop: '10px', color: '#64748b' }}>
                                    No winner declared or no bids were placed.
                                </div>
                            )}
                        </div>
                    )}

                    {/* Stats Summary */}
                    <div className="stats-card">
                        <div className="stat-row">
                            <span className="stat-key">Starting Price:</span>
                            <span className="stat-val">{formatCurrency(startingPrice)}</span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-key">Total Bids:</span>
                            <span className="stat-val group-val">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 4 }}>
                                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="9" cy="7" r="4"></circle>
                                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                                </svg>
                                {bidCountVal}
                            </span>
                        </div>
                        <div className="stat-row">
                            <span className="stat-key">Min. Increment:</span>
                            <span className="stat-val">{formatCurrency(minimumBidIncrement)}</span>
                        </div>
                    </div>

                    {/* Bid History */}
                    <div className="info-card">
                        <div className="bid-history-header">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                                <polyline points="17 6 23 6 23 12"></polyline>
                            </svg>
                            Bid History
                        </div>
                        <div className="bid-history-list">
                            {bidHistory.length > 0 ? bidHistory.map((bid, index) => (
                                <div key={bid._id || index} className="history-item">
                                    <div className="bidder-info">
                                        <div className="bidder-avatar" style={{ backgroundColor: '#3b82f6', overflow: 'hidden' }}>
                                            {bid.bidder.profilePic?.url ? (
                                                <img src={bid.bidder.profilePic.url} alt="av" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                            ) : (
                                                (bid.bidder.username || 'U').charAt(0).toUpperCase()
                                            )}
                                        </div>
                                        <div className="bidder-details">
                                            <span className="bidder-name">{bid.bidder.username || "Unknown"}</span>
                                            <span className="bid-time">
                                                {new Date(bid.createdAt).toLocaleDateString()} {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                    <span className="bid-history-amount">{formatCurrency(bid.amount)}</span>
                                </div>
                            )) : (
                                <div style={{ padding: '10px', textAlign: 'center', color: '#878a8c' }}>
                                    No bids yet. Be the first to bid!
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuctionDetails;
