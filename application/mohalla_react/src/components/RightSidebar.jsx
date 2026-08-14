import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useCreatePost } from '../context/CreatePostContext';
import CreateCommunityModal from './CreateCommunityModal';
import api from '../api/axios';
import './RightSidebar.css';

const RightSidebar = () => {
    const { openCreatePostModal } = useCreatePost();
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [joinError, setJoinError] = useState(null);
    const [isCreateCommunityModalOpen, setIsCreateCommunityModalOpen] = useState(false);

    const { data: communities = [], isLoading, error, isError } = useQuery({
        queryKey: ['communities'],
        queryFn: async () => {
            const response = await api.get('/communities/available');
            const data = response.data;
            if (Array.isArray(data)) return data;
            if (data && Array.isArray(data.data)) return data.data;
            if (data && Array.isArray(data.communities)) return data.communities;
            return [];
        },
        retry: (failureCount, error) => {
            if (error.response && error.response.status === 401) {
                return false;
            }
            return failureCount < 3;
        }
    });



    const joinMutation = useMutation({
        mutationFn: async (communityId) => {
            const response = await api.post(`/communities/${communityId}/join`);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['communities'] });
            queryClient.invalidateQueries({ queryKey: ['feed'] });
            queryClient.invalidateQueries({ queryKey: ['myCommunities'] });
            setJoinError(null);
        },
        onError: (error) => {
            if (error.response && error.response.status === 401) {
                navigate('/login');
            } else {
                setJoinError(error.response?.data?.message || 'Failed to join community');
            }
        }
    });

    const handleJoin = (communityId) => {
        joinMutation.mutate(communityId);
    };

    const isUnauthorized = isError && error.response && error.response.status === 401;

    return (
        <aside className="right-sidebar">
            {/* Home Card */}
            <div className="sidebar-card">
                <div className="home-banner"></div>
                <div className="home-content">
                    <div className="home-header">
                        <div className="home-snoo"></div>
                        <h3>Home</h3>
                    </div>
                    <p>Your personal mohalla frontpage. Come here to check in with your favorite communities and posts.</p>

                    <button className="create-post-btn-large" onClick={openCreatePostModal}>
                        Create Post
                    </button>
                    <button className="create-community-btn" onClick={() => setIsCreateCommunityModalOpen(true)}>
                        Create Community
                    </button>
                </div>
            </div>

            {/* Premium Card */}


            {/* Popular Communities */}
            {!isUnauthorized && (
                <div className="sidebar-card">
                    <div className="card-header">
                        <h3>POPULAR COMMUNITIES</h3>
                    </div>
                    <div className="community-list">
                        {isLoading ? (
                            <div style={{ padding: '12px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Loading...</div>
                        ) : communities.length === 0 ? (
                            <div style={{ padding: '12px', textAlign: 'center' }}>
                                <p style={{ marginBottom: '12px', fontSize: '14px', color: 'var(--color-text-primary)' }}>Create first community</p>
                                <button className="create-community-btn" onClick={() => setIsCreateCommunityModalOpen(true)}>
                                    Create Community
                                </button>
                            </div>
                        ) : (
                            <>
                                {communities.map((community) => (
                                    <div key={community._id} className="community-item">
                                        <div className="community-info">
                                            {community.icon && community.icon.url ? (
                                                <img src={community.icon.url} alt={community.name} className="community-icon" style={{ objectFit: 'cover' }} />
                                            ) : (
                                                <div className="community-icon"></div>
                                            )}
                                            <div className="community-details">
                                                <span className="community-name">{community.name}</span>
                                                <span className="community-members">{community.description}</span>
                                            </div>
                                        </div>
                                        <button
                                            className="join-btn"
                                            onClick={() => handleJoin(community._id)}
                                            disabled={joinMutation.isPending}
                                        >
                                            {joinMutation.isPending ? '...' : 'Join'}
                                        </button>
                                    </div>
                                ))}
                                {joinError && (
                                    <div style={{ padding: '8px 12px', color: 'red', fontSize: '12px', textAlign: 'center' }}>
                                        {joinError}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Footer Links */}
            <div className="sidebar-footer" style={{ padding: '12px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                    <span>User Agreement</span>
                    <span>Privacy Policy</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    <span>Content Policy</span>
                    <span>Moderator Code of Conduct</span>
                </div>
                <div style={{ marginTop: '12px' }}>
                    mohallahub © 2025. All rights reserved
                </div>
            </div>

            <CreateCommunityModal
                isOpen={isCreateCommunityModalOpen}
                onClose={() => setIsCreateCommunityModalOpen(false)}
            />
        </aside>
    );
};

export default RightSidebar;
