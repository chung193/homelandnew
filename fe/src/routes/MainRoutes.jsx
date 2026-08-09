import { BrowserRouter, useRoutes, Navigate } from 'react-router-dom';
import { AuthRoutes } from './AuthRoutes';
import { DashboardRoutes } from './DashboardRoutes';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '@providers/AuthProvider';

function RoutesElement() {
    return useRoutes([
        ...AuthRoutes,
        { element: <ProtectedRoute />, children: DashboardRoutes },
        { path: '/', element: <Navigate to="/dashboard" replace /> },
        { path: '*', element: <Navigate to="/dashboard" replace /> }
    ]);
}

export default function MainRoutes() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <RoutesElement />
            </AuthProvider>
        </BrowserRouter>
    );
}
