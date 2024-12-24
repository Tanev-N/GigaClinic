import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AdminProfile.module.scss';
import { API_ENDPOINTS } from '@/shared/config/api';

interface AdminInfo {
    id_user: number;
    login: string;
}

const AdminProfile = () => {
    const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetch(API_ENDPOINTS.ADMIN.PROFILE, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                setAdminInfo(data);
            })
            .catch(error => {
                console.error('Error fetching admin info:', error);
            });
    }, []);

    if (!adminInfo) {
        return <div>Загрузка...</div>;
    }

    return (
        <div className={styles.profileContainer}>
            <h1 className={styles.title}>Профиль администратора</h1>

            <div className={styles.section}>
                <div className={styles.sectionHeader}>
                    <h2>Основная информация</h2>
                    <button 
                        className={styles.adminButton}
                        onClick={() => navigate('/admin')}
                    >
                        Перейти в админ-панель
                    </button>
                </div>

                <div className={styles.profileInfo}>
                    <p><strong>Логин:</strong> {adminInfo.login}</p>
                </div>
            </div>

            <div className={styles.section}>
                <h2>Быстрые действия</h2>
                <div className={styles.buttonGroup}>
                    <button 
                        onClick={() => navigate('/reports')}
                    >
                        Просмотр отчетов
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProfile; 