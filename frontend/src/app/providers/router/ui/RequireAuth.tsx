import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserAuthData } from '@/entities/User';

interface RequireAuthProps {
    children: JSX.Element;
}

export function RequireAuth({ children }: RequireAuthProps) {
    const auth = useSelector(getUserAuthData);
    const location = useLocation();

    if (!auth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
} 