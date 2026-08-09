import { instance, authInstance } from "./axios";

export const login = async (data) => {
    const response = await instance.post(`auth/login`, data)
    return response
};

export const register = async (data) => {
    const response = await instance.post('auth/register', data)
    return response
}

export const forgot = async (data) => {
    const response = await instance.post('auth/forgot-password', data)
    return response
}

export const resetPassword = async (data) => {
    const response = await instance.post('auth/update-password', data)
    return response
}

export const changePassword = async (data) => {
    const response = await authInstance.post('auth/change-password', data)
    return response
}

export const verifyEmail = async (id, hash) => {
    const response = await instance.get(`auth/email/verify/${id}/${hash}`);
    return response
}