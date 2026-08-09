import { authInstance } from "@services/axios";

export const getAll = async (params = {}) => {
    const sortParam = params.sort || '-created_at';
    const response = await authInstance.get(`tag`, {
        params: {
            sort: sortParam,
            ...params
        }
    });
    return response;
};

export const storage = async (data) => {
    const response = await authInstance.post("tag", data);
    return response;
};

export const update = async (id, data) => {
    const response = await authInstance.put(`tag/${id}`, data);
    return response;
};

export const destroy = async (id) => {
    const response = await authInstance.delete(`tag/${id}`);
    return response;
};

export const bulkDestroy = async (ids) => {
    const response = await authInstance.delete("tags", { data: { ids } });
    return response;
};

export const tagExport = async () => {
    const response = await authInstance.post(`/tag-export`, {}, {
        headers: {
            Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        responseType: "blob",
    });
    return response;
};
