import { authInstance } from '@services/axios';

export const getProvinceList = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    return authInstance.get('provinces', { params: { sort: sortParam, ...params } });
};

export const createProvince = async (data) => authInstance.post('provinces', data);
export const updateProvince = async (id, data) => authInstance.put(`provinces/${id}`, data);
export const bulkDestroyProvinces = async (ids) => authInstance.delete('provinces', { data: { ids } });

export const getDistrictList = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    return authInstance.get('districts', { params: { sort: sortParam, ...params } });
};

export const createDistrict = async (data) => authInstance.post('districts', data);
export const updateDistrict = async (id, data) => authInstance.put(`districts/${id}`, data);
export const bulkDestroyDistricts = async (ids) => authInstance.delete('districts', { data: { ids } });

export const getWardList = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    return authInstance.get('wards', { params: { sort: sortParam, ...params } });
};

export const createWard = async (data) => authInstance.post('wards', data);
export const updateWard = async (id, data) => authInstance.put(`wards/${id}`, data);
export const bulkDestroyWards = async (ids) => authInstance.delete('wards', { data: { ids } });

export const getPublicProvinces = async () => authInstance.get('locations/provinces');
export const getPublicDistricts = async (provinceCode) => authInstance.get('locations/districts', { params: { province_code: provinceCode } });
