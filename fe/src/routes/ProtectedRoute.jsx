import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';

export default function ProtectedRoute() {
    const { user } = useAuth();
    const location = useLocation();
    if (!user) {
        return <Navigate to="/auth/login" replace state={{ from: location }} />;
    }
    return <Outlet />;
}
