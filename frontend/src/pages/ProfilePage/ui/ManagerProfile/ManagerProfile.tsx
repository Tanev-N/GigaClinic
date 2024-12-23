import React from 'react';
import styles from '../ProfilePage.module.scss';
import { useNavigate } from 'react-router-dom';

const ManagerProfile = () => {
    const navigate = useNavigate();

    const handleReportsClick = () => {
        navigate('/reports');
    };

    return (
        <div className={styles.profileContainer}>
            <h1 className={styles.title}>Профиль менеджера</h1>

            <div className={styles.section}>
                <h2>Управление отчетами</h2>
                <p>Для работы с отчетами перейдите на страницу отчетов</p>
                <button
                    className={styles.generateButton}
                    onClick={handleReportsClick}
                >
                    Перейти к отчетам
                </button>
            </div>
        </div>
    );
};

export default ManagerProfile;