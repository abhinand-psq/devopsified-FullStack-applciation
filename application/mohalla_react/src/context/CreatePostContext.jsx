import React, { createContext, useContext, useState } from 'react';

const CreatePostContext = createContext();

export const useCreatePost = () => {
    const context = useContext(CreatePostContext);
    if (!context) {
        throw new Error('useCreatePost must be used within a CreatePostProvider');
    }
    return context;
};

export const CreatePostProvider = ({ children }) => {
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);

    const openCreatePostModal = () => setIsCreatePostModalOpen(true);
    const closeCreatePostModal = () => setIsCreatePostModalOpen(false);

    return (
        <CreatePostContext.Provider value={{ isCreatePostModalOpen, openCreatePostModal, closeCreatePostModal }}>
            {children}
        </CreatePostContext.Provider>
    );
};
