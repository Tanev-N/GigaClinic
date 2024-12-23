import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AccessDeniedPage.module.scss';

const AccessDeniedPage = () => {
    const navigate = useNavigate();

    return (
        <div className={styles.accessDenied}>
            <div className={styles.content}>
                <h1>403</h1>
                <h2>Доступ запрещен</h2>
                <p>У вас нет прав для просмотра этой страницы</p>
                <button 
                    className={styles.button}
                    onClick={() => navigate('/')}
                >
                    Вернуться на главную
                </button>
            </div>
        </div>
    );
};

export default AccessDeniedPage; 