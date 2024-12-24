import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { getUserAuthData, userActions } from '@/entities/User';
import styles from './Header.module.scss';
import { Logo } from '@/shared/ui/Logo';
import { API_ENDPOINTS } from '@/shared/config/api';

export const Header = () => {
  const auth = useSelector(getUserAuthData);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.AUTH.LOGOUT, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        dispatch(userActions.logout());
        navigate('/');
      } else {
        console.error('Ошибка при выходе из системы');
      }
    } catch (error) {
      console.error('Ошибка при выполнении запроса:', error);
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Logo />
        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Главная</Link>
          <Link to="/schedule" className={styles.navLink}>Расписание врачей</Link>
          <Link to="/appointment" className={styles.navLink}>Запись на прием к врачу</Link>
        </nav>
        <div className={styles.authButtons}>
          {auth && (
            <button 
              onClick={handleLogout} 
              className={styles.logoutButton}
            >
              Выйти
            </button>
          )}
          <Link 
            to={auth ? "/profile" : "/login"} 
            className={styles.profileButton}
          >
            <span>Личный кабинет</span>
          </Link>
        </div>
      </div>
    </header>
  );
}; 