import React from 'react';
import styles from '../ProfilePage.module.scss';

const ManagerProfile = () => {
  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Профиль менеджера</h1>
      <div className={styles.section}>
        <h2>Управление отчетами</h2>
        <p>Здесь будет функционал для работы с отчетами</p>
      </div>
    </div>
  );
};

export default ManagerProfile; 