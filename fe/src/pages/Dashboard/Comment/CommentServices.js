import { authInstance } from '@services/axios';

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get('comment', {
        params: {
            sort: sortParam,
            ...params
        }
    });
    return response;
};

export const getCommentCount = async () => {
    const response = await authInstance.get('comment-count');
    return response;
};

export const approveComment = async (id) => {
    const response = await authInstance.patch(`comment/${id}/approve`);
    return response;
};

export const destroy = async (id) => {
    const response = await authInstance.delete(`comment/${id}`);
    return response;
};

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('comments', { data: { ids } });
    return response;
};

