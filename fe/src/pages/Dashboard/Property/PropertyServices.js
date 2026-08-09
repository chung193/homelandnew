import { authInstance } from '@services/axios';

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get('properties', {
        params: {
            sort: sortParam,
            ...params,
        },
    });
    return response;
};

export const getById = async (id) => {
    const response = await authInstance.get(`properties/${id}`);
    return response;
};

export const storage = async (data) => {
    const response = await authInstance.post('properties', data);
    return response;
};

export const update = async (id, data) => {
    const response = await authInstance.put(`properties/${id}`, data);
    return response;
};

export const destroy = async (id) => {
    const response = await authInstance.delete(`properties/${id}`);
    return response;
};

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('properties', { data: { ids } });
    return response;
};

export const getPropertyTypes = async () => {
    const response = await authInstance.get('property-types/all');
    return response;
};

export const getAmenities = async () => {
    const response = await authInstance.get('amenities/all');
    return response;
};

export const getProvinces = async () => {
    const response = await authInstance.get('locations/provinces');
    return response;
};

export const getDistricts = async (provinceCode) => {
    const response = await authInstance.get('locations/districts', {
        params: { province_code: provinceCode },
    });
    return response;
};

export const getWards = async (districtCode) => {
    const response = await authInstance.get('locations/wards', {
        params: { district_code: districtCode },
    });
    return response;
};
