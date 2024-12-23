import { type RouteProps as BaseRouteProps } from 'react-router-dom';
import { UserRole } from '@/entities/User';
import { MainPage } from '@/pages/MainPage';
import { HomePage } from '@/pages/HomePage';
import { AppointmentPage } from '@/pages/AppointmentPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SchedulePage } from '@/pages/SchedulePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AdminPage } from '@/pages/AdminPage';
import { ReportsPage } from '@/pages/ReportsPage';
import { RequireAuth } from '../ui/RequireAuth';
import { AccessDeniedPage } from '@/pages/AccessDeniedPage';

export enum AppRoutes {
    MAIN = 'main',
    HOME = 'home',
    SCHEDULE = 'schedule',
    APPOINTMENT = 'appointment',
    PROFILE = 'profile',
    LOGIN = 'login',
    REGISTER = 'register',
    REPORTS = 'reports',
    ADMIN = 'admin',
    ACCESS_DENIED = 'access_denied',
}

export const RoutePath: Record<AppRoutes, string> = {
    [AppRoutes.MAIN]: '/',
    [AppRoutes.HOME]: '/home',
    [AppRoutes.SCHEDULE]: '/schedule',
    [AppRoutes.APPOINTMENT]: '/appointment',
    [AppRoutes.PROFILE]: '/profile',
    [AppRoutes.LOGIN]: '/login',
    [AppRoutes.REGISTER]: '/register',
    [AppRoutes.REPORTS]: '/reports',
    [AppRoutes.ADMIN]: '/admin',
    [AppRoutes.ACCESS_DENIED]: '/access-denied',
};

interface AppRouteProps {
    path: string;
    element: JSX.Element;
    authOnly?: boolean;
    roles?: UserRole[];
}

export const routeConfig: Record<AppRoutes, AppRouteProps> = {
    [AppRoutes.MAIN]: {
        path: RoutePath.main,
        element: <MainPage />
    },
    [AppRoutes.HOME]: {
        path: RoutePath.home,
        element: <HomePage />,
        roles: [UserRole.PATIENT, UserRole.ADMIN]
    },
    [AppRoutes.SCHEDULE]: {
        path: RoutePath.schedule,
        element: <SchedulePage />,
        roles: [UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]
    },
    [AppRoutes.APPOINTMENT]: {
        path: RoutePath.appointment,
        element: (
            <RequireAuth roles={[UserRole.PATIENT]}>
                <AppointmentPage />
            </RequireAuth>
        ),
        roles: [UserRole.PATIENT]
    },
    [AppRoutes.PROFILE]: {
        path: RoutePath.profile,
        element: (
            <RequireAuth>
                <ProfilePage />
            </RequireAuth>
        ),
        authOnly: true
    },
    [AppRoutes.LOGIN]: {
        path: RoutePath.login,
        element: <LoginPage />
    },
    [AppRoutes.REGISTER]: {
        path: RoutePath.register,
        element: <RegisterPage />
    },
    [AppRoutes.REPORTS]: {
        path: RoutePath.reports,
        element: (
            <RequireAuth roles={[UserRole.MANAGER, UserRole.ADMIN]}>
                <ReportsPage />
            </RequireAuth>
        ),
        roles: [UserRole.MANAGER, UserRole.ADMIN]
    },
    [AppRoutes.ADMIN]: {
        path: RoutePath.admin,
        element: (
            <RequireAuth roles={[UserRole.ADMIN]}>
                <AdminPage />
            </RequireAuth>
        ),
        roles: [UserRole.ADMIN]
    },
    [AppRoutes.ACCESS_DENIED]: {
        path: RoutePath.access_denied,
        element: <AccessDeniedPage />
    },
}; 