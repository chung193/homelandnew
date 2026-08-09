import axios from 'axios'
import { getItem } from "@utils/localStorage"

export const apiUrl = import.meta.env.VITE_APP_API_URL;
export const backendUrl = import.meta.env.VITE_APP_BACKEND_URL;
export const uploadUrl = import.meta.env.VITE_APP_BACKEND_UPLOAD_URL;

export const authInstance = axios.create({
    baseURL: apiUrl,
})

export const instance = axios.create({
    baseURL: apiUrl,
})

authInstance.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'))

        const token = user.token
        const token_type = user.token_type.trim()
        if (token) {
            config.headers.Authorization = `${token_type} ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
