import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import CommentsModal from './CommentsModal';
import './Post.css';

const Post = ({ id, subreddit, communityId, author, time, title, description, content, image, votes, comments, type, postType }) => {
    const [voteCount, setVoteCount] = useState(votes);
    const [voteStatus, setVoteStatus] = useState(null); // 'up', 'down', or null

    const [isCommentsModalOpen, setIsCommentsModalOpen] = useState(false);

    const getPostTypeStyle = (type) => {
        switch (type) {
            case 'announcement':
                return { backgroundColor: '#0079D3', color: 'white' };
            case 'discussion':
                return { backgroundColor: '#FF4500', color: 'white' };
            case 'repost':
                return { backgroundColor: '#FFB000', color: 'black' };
            case 'system':
                return { backgroundColor: '#46D160', color: 'white' };
            default:
                return { backgroundColor: '#3A3A3C', color: '#D7DADC' }; // Default for 'post'
        }
    };

    const handleUpvote = () => {
        if (voteStatus === 'up') {
            setVoteStatus(null);
            setVoteCount(voteCount - 1);
        } else {
            if (voteStatus === 'down') setVoteCount(voteCount + 2);
            else setVoteCount(voteCount + 1);
            setVoteStatus('up');
        }
    };

    const handleDownvote = () => {
        if (voteStatus === 'down') {
            setVoteStatus(null);
            setVoteCount(voteCount + 1);
        } else {
            if (voteStatus === 'up') setVoteCount(voteCount - 2);
            else setVoteCount(voteCount - 1);
            setVoteStatus('down');
        }
    };

    return (
        <>
            <article className="post">
                <div className="post-sidebar">
                    <button
                        className={`vote-btn up ${voteStatus === 'up' ? 'active' : ''}`}
                        onClick={handleUpvote}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 19V5M5 12l7-7 7 7" />
                        </svg>
                    </button>
                    <span className={`vote-count ${voteStatus}`}>{(voteCount / 1000).toFixed(1)}k</span>
                    <button
                        className={`vote-btn down ${voteStatus === 'down' ? 'active' : ''}`}
                        onClick={handleDownvote}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12l7 7 7-7" />
                        </svg>
                    </button>
                </div>

                <div className="post-content">
                    <div className="post-header">
                        <div className="subreddit-icon"></div>
                        <Link to={`/r/${communityId || subreddit}`} className="subreddit-name" onClick={(e) => e.stopPropagation()}>r/{subreddit}</Link>
                        <span className="post-meta">• Posted by u/{author} • {time}</span>
                    </div>

                    <div className="post-title-container" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <h2 className="post-title" style={{ margin: 0 }}>{title}</h2>
                        {postType && postType !== 'post' && (
                            <span style={{
                                fontSize: '12px',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                fontWeight: 'bold',
                                ...getPostTypeStyle(postType)
                            }}>
                                {postType.charAt(0).toUpperCase() + postType.slice(1)}
                            </span>
                        )}
                    </div>

                    {description && (
                        <div className="post-description" style={{
                            fontSize: '14px',
                            color: '#D7DADC',
                            marginTop: '8px',
                            marginBottom: '12px',
                            padding: '10px',
                            backgroundColor: '#272729',
                            borderRadius: '4px',
                            borderLeft: '4px solid #D7DADC'
                        }}>
                            {description}
                        </div>
                    )}

                    {content && content !== title && <p className="post-text">{content}</p>}

                    {image && (
                        <div className="post-image-container">
                            <img src={image} alt={title} className="post-image" />
                        </div>
                    )}

                    <div className="post-footer">
                        <div className="mobile-votes">
                            <button
                                className={`vote-btn up ${voteStatus === 'up' ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleUpvote(); }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 19V5M5 12l7-7 7 7" />
                                </svg>
                            </button>
                            <span className={`vote-count ${voteStatus}`}>{(voteCount / 1000).toFixed(1)}k</span>
                            <button
                                className={`vote-btn down ${voteStatus === 'down' ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); handleDownvote(); }}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M12 5v14M5 12l7 7 7-7" />
                                </svg>
                            </button>
                        </div>

                        <button className="footer-btn" onClick={() => setIsCommentsModalOpen(true)}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            <span className="btn-label">{comments} Comments</span>
                        </button>
                        <button className="footer-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                            <span className="btn-label">Share</span>
                        </button>
                        <button className="footer-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className="btn-label">Save</span>
                        </button>
                        <button className="footer-btn icon-only">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="1" />
                                <circle cx="19" cy="12" r="1" />
                                <circle cx="5" cy="12" r="1" />
                            </svg>
                        </button>
                    </div>
                </div>
            </article>

            <CommentsModal
                isOpen={isCommentsModalOpen}
                onClose={() => setIsCommentsModalOpen(false)}
                postId={id}
                postTitle={title}
            />
        </>
    );
};

export default Post;
