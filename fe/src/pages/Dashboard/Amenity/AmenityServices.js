import { authInstance } from '@services/axios';

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get('amenities', {
        params: { sort: sortParam, ...params },
    });
    return response;
};

export const storage = async (data) => {
    const response = await authInstance.post('amenities', data);
    return response;
};

export const update = async (id, data) => {
    const response = await authInstance.put(`amenities/${id}`, data);
    return response;
};

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('amenities', { data: { ids } });
    return response;
};
