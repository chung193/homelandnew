import { authInstance } from "@services/axios";
import apiService from "@services/common";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`user`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const getAllRole = async (params = {}) => {
    const response = await authInstance.get(`role`, { params })
    return response
};

export const show = async (id) => {
    const response = await authInstance.get(`user/${id}`)
    return response
};

export const storage = async (data) => {
    const response = await authInstance.post('user', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`user/${id}`, data)
    return response
}

export const assignRoles = async (id, roleIds = []) => {
    const response = await authInstance.post(`user/${id}/role`, { role_ids: roleIds })
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`user/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('users', { data: { ids } })
    return response
}

// 'file' => 'required|file|max:10240', // file size
// 'model' => 'required|string', // User, Product, etc.
// 'id' => 'required', // id of model
// 'collection' => 'nullable|string', // attachments, avatar, gallery
export const uploadAvatar = async (data = {}) => {
    const response = await apiService.postWithMedia('/media/upload', data);
    return response;
}

export const userExport = async () => {
    const response = await authInstance.post(`/user-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}
