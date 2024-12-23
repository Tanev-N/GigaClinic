import React from 'react';
import { useSelector } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { getUserAuthData, UserRole } from '@/entities/User';
import { RoutePath } from '@/app/providers/router/config/routeConfig';
import styles from './Navbar.module.scss';

const Navbar = () => {
  const auth = useSelector(getUserAuthData);

  const getNavItems = () => {
    switch (auth?.role) {
      case UserRole.PATIENT:
        return [
          { path: RoutePath.home, text: 'Главная' },
          { path: RoutePath.schedule, text: 'Расписание' },
          { path: RoutePath.appointment, text: 'Записаться на прием' },
          { path: RoutePath.profile, text: 'Личный кабинет' },
        ];
      case UserRole.DOCTOR:
        return [
          { path: RoutePath.home, text: 'Главная' },
          { path: RoutePath.schedule, text: 'Мое расписание' },
          { path: RoutePath.profile, text: 'Личный кабинет' },
        ];
      case UserRole.MANAGER:
        return [
          { path: RoutePath.home, text: 'Главная' },
          { path: RoutePath.reports, text: 'Отчеты' },
          { path: RoutePath.profile, text: 'Личный кабинет' },
        ];
      case UserRole.ADMIN:
        return [
          { path: RoutePath.home, text: 'Главная' },
          { path: RoutePath.admin, text: 'Админ панель' },
          { path: RoutePath.reports, text: 'Отчеты' },
          { path: RoutePath.profile, text: 'Личный кабинет' },
        ];
      default:
        return [
          { path: RoutePath.main, text: 'Главная' },
          { path: RoutePath.login, text: 'Войти' },
          { path: RoutePath.register, text: 'Регистрация' },
        ];
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.links}>
        {getNavItems().map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => 
              `${styles.link} ${isActive ? styles.active : ''}`
            }
          >
            {item.text}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default Navbar; 