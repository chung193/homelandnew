import { authInstance } from "@services/axios";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`category`, {
        params: {
            sort: sortParam,
            ...params
        }
    })
    return response
};

export const storage = async (data) => {
    const response = await authInstance.post('category', data)
    return response
}

export const update = async (id, data) => {
    const response = await authInstance.put(`category/${id}`, data)
    return response
}

export const destroy = async (id) => {
    const response = await authInstance.delete(`category/${id}`)
    return response
}

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete('categories', { data: { ids } })
    return response
}

export const categoryExport = async () => {
    const response = await authInstance.post(`/category-export`, {}, {
        headers: {
            'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        responseType: 'blob'
    })
    return response
}
