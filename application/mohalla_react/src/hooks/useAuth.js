import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios';

export const useSignup = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (userData) => {
            const response = await api.post('/auth/signup', userData);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
            queryClient.invalidateQueries({ queryKey: ['myCommunitiesMin'] });
        }
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (credentials) => {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auth', 'user'] });
            queryClient.invalidateQueries({ queryKey: ['myCommunitiesMin'] });
        }
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async () => {
            await api.post('/auth/logout');
        },
        onSuccess: () => {
            queryClient.setQueryData(['auth', 'user'], null);
            queryClient.setQueryData(['myCommunitiesMin'], null);
        }
    });
};

export const useUser = () => {
    return useQuery({
        queryKey: ['auth', 'user'],
        queryFn: async () => {
            try {
                const response = await api.get('/auth/me');
                return response.data.data;
            } catch (error) {
                return null;
            }
        },
        retry: false,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};
