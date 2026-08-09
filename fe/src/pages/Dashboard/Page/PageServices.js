import { authInstance } from "@services/axios";
import apiService from '@services/common';

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`page`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const getById = async (id) => {
    const response = await authInstance.get(`page/${id}`);
    return response;
};

export const getMediaLibrary = async (params = {}) => {
    const response = await authInstance.get('media', {
        params: {
            collection: 'library',
            per_page: 100,
            ...params,
        },
    });
    return response;
};

export const storage = async (data) => {
    const response = await authInstance.post('page', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`page/${id}`, data)
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`page/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('pages', { data: { ids } })
    return response
}

export const pageExport = async () => {
    const response = await authInstance.post(`/page-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}

// 'file' => 'required|file|max:10240', // file size
// 'model' => 'required|string', // User, Product, etc.
// 'id' => 'required', // id of model
// 'collection' => 'nullable|string', // attachments, avatar, gallery
export const uploadImage = async (data = {}) => {
    const response = await apiService.postWithMedia('/media/upload', data);
    return response;
}

