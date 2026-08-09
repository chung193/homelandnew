import { authInstance } from "@services/axios";
import apiService from '@services/common';
import { generateSlug } from "@utils/stringHelper";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`post`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const getById = async (id) => {
    const response = await authInstance.get(`post/${id}`);
    return response;
};

export const getPostCount = async (params = {}) => {
    const response = await authInstance.get(`post-count`, { params })
    return response
};

export const getAllCategory = async (params = {}) => {
    const response = await authInstance.get(`category`, { params })
    return response
};

export const getAllTag = async (params = {}) => {
    const response = await authInstance.get(`tag`, { params })
    return response
};

export const createTag = async (data) => {
    try {
        // Ensure slug is generated from name and made unique with timestamp
        const baseSlug = generateSlug(data.name || data);
        const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
        const uniqueSlug = baseSlug ? `${baseSlug}-${timestamp}` : timestamp;

        const tagData = {
            name: data.name || data,
            slug: uniqueSlug,
        };
        const response = await authInstance.post(`tag`, tagData)
        return response
    } catch (error) {
        console.error("createTag error - status:", error.response?.status, "data:", error.response?.data);
        throw error;
    }
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
    const response = await authInstance.post('post', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`post/${id}`, data)
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`post/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('posts', { data: { ids } })
    return response
}

export const postExport = async () => {
    const response = await authInstance.post(`/post-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}

export const importWordpressXml = async (formData) => {
    const response = await authInstance.post(`/post-import-wordpress-xml`, formData);
    return response;
}

// 'file' => 'required|file|max:10240', // file size
// 'model' => 'required|string', // User, Product, etc.
// 'id' => 'required', // id of model
// 'collection' => 'nullable|string', // attachments, avatar, gallery
export const uploadImage = async (data = {}) => {
    const response = await apiService.postWithMedia('/media/upload', data);
    return response;
}
