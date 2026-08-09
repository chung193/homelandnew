import { authInstance } from "@services/axios";
import apiService from "@services/common";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`media`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const storage = async (data) => {
    const response = await apiService.postWithMedia('media', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`media/${id}`, data)
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`media/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('medias', { data: { ids } })
    return response
}

export const mediaExport = async () => {
    const response = await authInstance.post(`/media-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}
