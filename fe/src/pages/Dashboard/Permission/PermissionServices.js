import { authInstance } from "@services/axios";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`permission`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const storage = async (data) => {
    const response = await authInstance.post('permission', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`permission/${id}`, data)
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`permission/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('permissions', { data: { ids } })
    return response
}

export const permissionExport = async () => {
    const response = await authInstance.post(`/permission-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}
