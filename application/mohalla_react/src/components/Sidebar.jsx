import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import CreateCommunityModal from './CreateCommunityModal';
import './Sidebar.css';

const Sidebar = () => {
    const location = useLocation();
    const currentPath = location.pathname;
    const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);

    const { data: communitiesData, isLoading, error } = useQuery({
        queryKey: ['myCommunities'],
        queryFn: async () => {
            try {
                const response = await api.get('/communities/my');
                return response.data;
            } catch (err) {
                if (err.response && err.response.status === 401) {
                    return { data: [], isUnauthorized: true };
                }
                throw err;
            }
        },
        retry: false
    });

    const communities = communitiesData?.data || [];
    const isUnauthorized = communitiesData?.isUnauthorized;
    const isEmpty = communities.length === 0;

    return (
        <aside className="sidebar">
            <div className="sidebar-section">
                <h3 className="sidebar-title">Feeds</h3>
                <Link to="/" className={`sidebar-item ${currentPath === '/' ? 'active' : ''}`}>
                    <span className="icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </span>
                    Home
                </Link>
                <Link to="/r/popular" className={`sidebar-item ${currentPath === '/r/popular' ? 'active' : ''}`}>
                    <span className="icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M23 6l-9.5 9.5-5-5L1 18"></path>
                            <path d="M17 6h6v6"></path>
                        </svg>
                    </span>
                    Popular
                </Link>
            </div>

            <div className="sidebar-section">
                <h3 className="sidebar-title">Communities</h3>
                <button
                    className="create-community-btn-sidebar"
                    onClick={() => setIsCreateCommunityModalOpen(true)}
                >
                    <span className="icon">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </span>
                    Create Community
                </button>
                {isLoading ? (
                    <div className="sidebar-loading">Loading...</div>
                ) : (isUnauthorized || isEmpty) ? (
                    <div className="sidebar-empty-state">
                        <p>Join communities to see them here!</p>
                    </div>
                ) : (
                    communities.map((community) => (
                        <Link
                            key={community._id}
                            to={`/r/${community._id}`}
                            className={`sidebar-item ${currentPath === `/r/${community._id}` ? 'active' : ''}`}
                        >
                            <span className="icon">
                                {community.icon?.url ? (
                                    <img
                                        src={community.icon.url}
                                        alt={community.name}
                                        style={{ width: '20px', height: '20px', borderRadius: '50%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    'r/'
                                )}
                            </span>
                            {community.name}
                        </Link>
                    ))
                )}
            </div>

            <CreateCommunityModal
                isOpen={isCreateCommunityModalOpen}
                onClose={() => setIsCreateCommunityModalOpen(false)}
            />
        </aside>
    );
};

export default Sidebar;
