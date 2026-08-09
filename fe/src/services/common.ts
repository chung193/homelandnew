import { authInstance } from "./axios";

const apiService = {
    get: (url, params = {}) => authInstance.get(url, { params }),
    post: (url, data = {}) => authInstance.post(url, data),
    postWithMedia: (url, formData = {}) => authInstance.post(url, formData),
    putWithMedia: (url, formData = {}) => {
        formData.append('_method', 'PUT');
        return authInstance.post(url, formData)
    },
    profile: () => authInstance.get('profile'),
    put: (url, data = {}) => authInstance.put(url, data),
    patch: (url, data = {}) => authInstance.patch(url, data),
    delete: (url) => authInstance.delete(url),
    exportExcel: async (url, data = null) => {
        authInstance.post(url, data,
            {
                responseType: 'blob',
            }
        )
    }
}

export default apiService
