import React, { useState } from 'react';
import './CommentsModal.css';

const CommentsModal = ({ isOpen, onClose, postId, postTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="comments-modal-overlay" onClick={onClose}>
            <div className="comments-modal" onClick={e => e.stopPropagation()}>
                <div className="comments-header">
                    <h2>Comments {postTitle ? `on "${postTitle.substring(0, 30)}${postTitle.length > 30 ? '...' : ''}"` : ''}</h2>
                    <button className="close-btn" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <div className="comments-body">
                    {/* Placeholder content for design view */}
                    <div style={{ textAlign: 'center', color: '#878a8c', padding: '20px' }}>
                        No comments yet. Be the first to share your thoughts!
                    </div>
                </div>

                <div className="comment-input-section">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <textarea
                            className="comment-textarea"
                            placeholder="What are your thoughts?"
                        />
                        <button
                            type="submit"
                            className="comment-submit-btn"
                        >
                            Comment
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CommentsModal;
