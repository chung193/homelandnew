import { createContext, useContext, useMemo, useState } from 'react';
import { login as loginApi, register as registerApi } from '@services/auth'
import { useGlobalContext } from './GlobalProvider';
import { instance } from "@services/axios";
import { useLocation, useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const { showLoading, hideLoading, showNotification } = useGlobalContext();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';
    const [user, setUser] = useState(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    });

    const forgot = async (email = {}) => {
        const response = await instance.post(`auth/forgot`, { email })
        return response
    };

    const verifyEmail = async (url = '') => {
        const response = await instance.get(`${url}`)
        return response
    };

    const resetPassword = async (data = {}) => {
        const response = await instance.post(`auth/reset-password`, data)
        return response
    };

    const login = async (username, password) => {
        showLoading();
        loginApi({ email: username, password })
            .then(res => {
                const u = {
                    id: res.data.data.user.id,
                    name: res.data.data.user.name,
                    token: res.data.data.token,
                    token_type: res.data.data.token_type
                };
                setUser(u);
                localStorage.setItem('user', JSON.stringify(u));
                navigate(from, { replace: true });
                hideLoading();
            })
            .catch(err => {
                hideLoading();
                console.log("error", err)
            })
    };

    const register = async ({ name, password, password_confirmation, email }) => {
        showLoading();
        registerApi({ name, password, password_confirmation, email })
            .then(res => {
                console.log(res)
                showNotification("Đăng ký thành công", "success");
                hideLoading();
            })
            .catch(err => {
                hideLoading();
                console.log("error", err)
            });
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
        navigate('/auth/login', { replace: true });
    };

    const value = useMemo(() => ({ user, login, register, logout, forgot, verifyEmail, resetPassword }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

