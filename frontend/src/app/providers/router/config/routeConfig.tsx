import { RouteProps } from 'react-router-dom';
import { MainPage } from '@/pages/MainPage';
import { HomePage } from '@/pages/HomePage';
import { AppointmentPage } from '@/pages/AppointmentPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SchedulePage } from '@/pages/SchedulePage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { RequireAuth } from '../ui/RequireAuth';

export enum AppRoutes {
  MAIN = 'main',
  HOME = 'home',
  SCHEDULE = 'schedule',
  APPOINTMENT = 'appointment',
  PROFILE = 'profile',
  LOGIN = 'login',
  REGISTER = 'register',
}

export const RoutePath: Record<AppRoutes, string> = {
  [AppRoutes.MAIN]: '/',
  [AppRoutes.HOME]: '/home',
  [AppRoutes.SCHEDULE]: '/schedule',
  [AppRoutes.APPOINTMENT]: '/appointment',
  [AppRoutes.PROFILE]: '/profile',
  [AppRoutes.LOGIN]: '/login',
  [AppRoutes.REGISTER]: '/register',
};

export const routeConfig: Record<AppRoutes, RouteProps> = {
  [AppRoutes.MAIN]: {
    path: RoutePath.main,
    element: <MainPage />
  },
  [AppRoutes.HOME]: {
    path: RoutePath.home,
    element: <HomePage />
  },
  [AppRoutes.SCHEDULE]: {
    path: RoutePath.schedule,
    element: (
      <SchedulePage />
    ),
  },
  [AppRoutes.APPOINTMENT]: {
    path: RoutePath.appointment,
    element: (
      <RequireAuth>
        <AppointmentPage />
      </RequireAuth>
    ),
  },
  [AppRoutes.PROFILE]: {
    path: RoutePath.profile,
    element: (
      <RequireAuth>
        <ProfilePage />
      </RequireAuth>
    ),
  },
  [AppRoutes.LOGIN]: {
    path: RoutePath.login,
    element: <LoginPage />
  },
  [AppRoutes.REGISTER]: {
    path: RoutePath.register,
    element: <RegisterPage />
  },
}; 