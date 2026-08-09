import { instance } from './axios';

export const globalSearch = async (query, limit = 10) => {
    try {
        const response = await instance.get('/search', {
            params: {
                q: query,
                limit: limit
            }
        });
        return response.data.data || response.data;
    } catch (error) {
        console.error('Error in global search:', error);
        return { users: [], posts: [], pages: [], categories: [] };
    }
};

export const searchPosts = async (query, limit = 20) => {
    try {
        const response = await instance.get('/search/posts', {
            params: { q: query, limit }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Error searching posts:', error);
        return [];
    }
};

export const searchPages = async (query, limit = 20) => {
    try {
        const response = await instance.get('/search/pages', {
            params: { q: query, limit }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Error searching pages:', error);
        return [];
    }
};

export const searchUsers = async (query, limit = 20) => {
    try {
        const response = await instance.get('/search/users', {
            params: { q: query, limit }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Error searching users:', error);
        return [];
    }
};

export const searchCategories = async (query, limit = 20) => {
    try {
        const response = await instance.get('/search/categories', {
            params: { q: query, limit }
        });
        return response.data.data || [];
    } catch (error) {
        console.error('Error searching categories:', error);
        return [];
    }
};
