import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Post from './Post';
import { useCreatePost } from '../context/CreatePostContext';
import './Feed.css';

const Feed = () => {
    const [type, settype] = useState('best');
    const { openCreatePostModal } = useCreatePost();

    const fetchPosts = async () => {
        const response = await api.get('/feed?page=1&limit=10');

        const feedData = response.data.data || [];

        return feedData.map(post => {
            const mediaItem = post.media && post.media.length > 0 ? post.media[0] : null;

            return {
                id: post._id,
                subreddit: post.community?.name || 'announcements',
                communityId: post.community?._id,
                author: post.author?.username || 'deleted',
                time: post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'recently',
                title: post.content, // Using content as title since there is no title in the response
                description: post.description,
                postType: post.postType || 'post',
                content: post.content,
                image: mediaItem ? mediaItem.url : null,
                width: mediaItem ? mediaItem.width : null,
                votes: post.stats?.likesCount || 0,
                comments: post.stats?.commentsCount || 0
            };
        });
    };

    const { data: posts = [], isLoading: loading, isError } = useQuery({
        queryKey: ['feed', 'best'], // Including type in queryKey for future filtering support
        queryFn: fetchPosts,
    });


    console.log(posts);


    return (
        <div className="feed">
            <div className="create-post-container">
                <div className="user-avatar-small">U</div>
                <input
                    type="text"
                    placeholder="Create Post"
                    className="create-post-input"
                    onClick={openCreatePostModal}
                />
                <button className="create-post-icon-btn" onClick={openCreatePostModal}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </button>
                <button className="create-post-icon-btn" onClick={openCreatePostModal}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                </button>
            </div>

            <div className="filter-bar">
                <button onClick={() => settype('best')} className={`filter-btn ${type === 'best' ? 'active' : ''}`}>Best</button>
                <button onClick={() => settype('hot')} className={`filter-btn ${type === 'hot' ? 'active' : ''}`}>Hot</button>
                <button onClick={() => settype('new')} className={`filter-btn ${type === 'new' ? 'active' : ''}`}>New</button>
                <button onClick={() => settype('top')} className={`filter-btn ${type === 'top' ? 'active' : ''}`}>Top</button>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--color-text-secondary)' }}>Loading posts...</div>
            ) : posts.length > 0 ? (
                posts.map(post => (

                    <Post key={post.id} {...post} type={type} />
                ))
            ) : (
                <div className="empty-feed-notice">
                    <h3>Your feed is empty</h3>
                    <p>It looks like you haven't joined any communities yet. Join some communities to start seeing posts!</p>
                </div>
            )}
        </div>
    );
};

export default Feed;
