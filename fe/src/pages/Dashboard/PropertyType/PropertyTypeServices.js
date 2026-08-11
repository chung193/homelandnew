import { authInstance } from '@services/axios';

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get('property-types', {
        params: { sort: sortParam, ...params },
    });
    return response;
};

export const getAmenities = async () => {
    const response = await authInstance.get('amenities', {
        params: { per_page: 100, sort: 'sort_order' },
    });
    return response;
};

export const storage = async (data) => {
    const response = await authInstance.post('property-types', toFormData(data));
    return response;
};

const toFormData = (data) => {
    const form = new FormData();
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'amenity_ids') (value || []).forEach((id) => form.append('amenity_ids[]', id));
        else if (value !== undefined && value !== null) form.append(key, typeof value === 'boolean' ? (value ? '1' : '0') : value);
    });
    return form;
};

export const update = async (id, data) => {
    const response = await authInstance.put(`property-types/${id}`, data);
    return response;
};

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('property-types', { data: { ids } });
    return response;
};
