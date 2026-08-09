import { authInstance } from "@services/axios";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`role`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const storage = async (data) => {
    const response = await authInstance.post('role', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`role/${id}`, data)
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`role/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('roles', { data: { ids } })
    return response
}

export const roleExport = async () => {
    const response = await authInstance.post(`/role-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}
