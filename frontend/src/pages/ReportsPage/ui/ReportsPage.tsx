import React from 'react';
import styles from './ReportsPage.module.scss';

const ReportsPage = () => {
    return (
        <div className={styles.reportsPage}>
            <h1>Отчеты</h1>
            <div className={styles.section}>
                <h2>Статистика посещений</h2>
                <p>Здесь будет статистика посещений врачей</p>
            </div>
            <div className={styles.section}>
                <h2>Загруженность врачей</h2>
                <p>Здесь будет информация о загруженности врачей</p>
            </div>
            <div className={styles.filters}>
                <h3>Фильтры</h3>
                <div className={styles.filterGroup}>
                    <label>Период:</label>
                    <select disabled>
                        <option>За последний месяц</option>
                        <option>За последний квартал</option>
                        <option>За последний год</option>
                    </select>
                </div>
                <div className={styles.filterGroup}>
                    <label>Отделение:</label>
                    <select disabled>
                        <option>Все отделения</option>
                        <option>Терапия</option>
                        <option>Хирургия</option>
                    </select>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage; 