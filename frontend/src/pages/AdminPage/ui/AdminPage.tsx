import React from 'react';
import styles from './AdminPage.module.scss';

const AdminPage = () => {
    return (
        <div className={styles.adminPage}>
            <h1>Панель администратора</h1>
            <div className={styles.section}>
                <h2>Управление пользователями</h2>
                <p>Здесь будет функционал управления пользователями</p>
            </div>
            <div className={styles.section}>
                <h2>Управление расписанием</h2>
                <p>Здесь будет функционал управления расписанием врачей</p>
            </div>
            <div className={styles.section}>
                <h2>Системные настройки</h2>
                <p>Здесь будут системные настройки приложения</p>
            </div>
        </div>
    );
};

export default AdminPage; 