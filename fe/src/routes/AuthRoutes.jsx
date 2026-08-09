import { Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import Login from '../pages/Auth/Login';
import Register from '../pages/Auth/Register';
import Forgot from '../pages/Auth/Forgot';
import ResetPassword from '../pages/Auth/ResetPassword';
import VerifyEmail from '../pages/Auth/VerifyEmail';

export const AuthRoutes = [
    {
        path: '/auth',
        element: <AuthLayout />,
        children: [
            { index: true, element: <Navigate to="login" replace /> },
            { path: 'login', element: <Login /> },
            { path: 'register', element: <Register /> },
            { path: 'forgot', element: <Forgot /> },
            { path: 'reset-password', element: <ResetPassword /> },
            { path: 'verify-email', element: <VerifyEmail /> }
        ]
    }
];
