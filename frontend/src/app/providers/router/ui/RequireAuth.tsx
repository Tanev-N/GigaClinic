import { ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';
import { getUserAuthData, getUserInited } from '@/entities/User';
import { UserRole } from '@/entities/User';

interface RequireAuthProps {
    children: ReactNode;
    roles?: UserRole[];
}

export function RequireAuth({ children, roles }: RequireAuthProps) {
    const auth = useSelector(getUserAuthData);
    const inited = useSelector(getUserInited);
    const location = useLocation();

    if (!inited) {
        return null; // или спиннер загрузки
    }

    if (!auth) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (roles && !roles.includes(auth.role)) {
        return <Navigate to="/access-denied" replace />;
    }

    return children;
} 