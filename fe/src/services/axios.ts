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
        try {
            const rawUser = localStorage.getItem('user')
            if (!rawUser) {
                return config
            }

            const user = JSON.parse(rawUser)
            const token = user?.token
            const tokenType = typeof user?.token_type === 'string' ? user.token_type.trim() : ''

            if (token && tokenType) {
                config.headers.Authorization = `${tokenType} ${token}`
            } else if (token) {
                config.headers.Authorization = `Bearer ${token}`
            }
        } catch (error) {
            console.warn('Unable to attach auth token', error)
        }

        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)
