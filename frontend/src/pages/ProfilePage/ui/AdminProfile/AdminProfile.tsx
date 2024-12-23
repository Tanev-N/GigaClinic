import React from 'react';
import styles from '../ProfilePage.module.scss';

const AdminProfile = () => {
  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Профиль администратора</h1>
      <div className={styles.section}>
        <h2>Панель управления</h2>
        <p>Здесь будет административный функционал</p>
      </div>
    </div>
  );
};

export default AdminProfile; 