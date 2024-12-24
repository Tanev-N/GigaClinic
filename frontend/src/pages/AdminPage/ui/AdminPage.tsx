import React, { useState, useEffect } from 'react';
import styles from './AdminPage.module.scss';
import { API_ENDPOINTS, API_BASE_URL } from '@/shared/config/api';

interface Column {
    COLUMN_NAME: string;
    DATA_TYPE: string;
    IS_NULLABLE: string;
    COLUMN_KEY: string;
}

interface ForeignKey {
    COLUMN_NAME: string;
    REFERENCED_TABLE_NAME: string;
    REFERENCED_COLUMN_NAME: string;
}

interface TableSchema {
    columns: Column[];
    foreign_keys: ForeignKey[];
}

const AdminPage = () => {
    const [tables, setTables] = useState<string[]>([]);
    const [selectedTable, setSelectedTable] = useState<string>('');
    const [tableData, setTableData] = useState<any[]>([]);
    const [tableSchema, setTableSchema] = useState<TableSchema | null>(null);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        fetchTables();
    }, []);

    useEffect(() => {
        if (selectedTable) {
            fetchTableData();
            fetchTableSchema();
        }
    }, [selectedTable]);

    const fetchTables = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.TABLES, {
                credentials: 'include'
            });
            const data = await response.json();
            setTables(data);
        } catch (err) {
            setError('Ошибка при загрузке списка таблиц');
        }
    };

    const fetchTableData = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.TABLE_DATA(selectedTable), {
                credentials: 'include'
            });
            const data = await response.json();
            setTableData(data.data || []);
        } catch (err) {
            setError('Ошибка при загрузке данных таблицы');
        }
    };

    const fetchTableSchema = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.ADMIN.TABLE_SCHEMA(selectedTable), {
                credentials: 'include'
            });
            const data = await response.json();
            setTableSchema(data);
        } catch (err) {
            setError('Ошибка при загрузке схемы таблицы');
        }
    };

    const formatValue = (value: any, dataType: string) => {
        if (value === null) return 'null';
        
        switch (dataType.toLowerCase()) {
            case 'datetime':
            case 'date':
                return new Date(value).toLocaleString('ru-RU');
            case 'time':
                return value;
            case 'json':
                try {
                    return JSON.stringify(value, null, 2);
                } catch {
                    return value;
                }
            default:
                return value.toString();
        }
    };

    const renderTableHeader = () => {
        if (!tableSchema?.columns) return null;

        return (
            <tr>
                {tableSchema.columns.map((column) => (
                    <th key={column.COLUMN_NAME}>
                        {column.COLUMN_NAME}
                        {column.COLUMN_KEY === 'PRI' && ' (PK)'}
                        {column.COLUMN_KEY === 'MUL' && ' (FK)'}
                    </th>
                ))}
            </tr>
        );
    };

    const renderTableRows = () => {
        if (!tableData.length || !tableSchema?.columns) return null;

        return tableData.map((row, index) => (
            <tr key={index}>
                {tableSchema.columns.map((column) => (
                    <td key={column.COLUMN_NAME}>
                        {row[column.COLUMN_NAME] !== null && row[column.COLUMN_NAME] !== undefined ? 
                            formatValue(row[column.COLUMN_NAME], column.DATA_TYPE) : 
                            'null'}
                    </td>
                ))}
            </tr>
        ));
    };

    const renderSchemaInfo = () => {
        if (!tableSchema) return null;

        return (
            <div className={styles.schemaInfo}>
                <h3>Структура таблицы</h3>
                <table className={styles.schemaTable}>
                    <thead>
                        <tr>
                            <th>Колонка</th>
                            <th>Тип</th>
                            <th>Обязательное</th>
                            <th>Ключ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tableSchema.columns.map((column) => (
                            <tr key={column.COLUMN_NAME}>
                                <td>{column.COLUMN_NAME}</td>
                                <td>{column.DATA_TYPE}</td>
                                <td>{column.IS_NULLABLE === 'NO' ? 'Да' : 'Нет'}</td>
                                <td>
                                    {column.COLUMN_KEY === 'PRI' ? 'Первичный ключ' : 
                                     column.COLUMN_KEY === 'MUL' ? 'Внешний ключ' : '-'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {tableSchema.foreign_keys.length > 0 && (
                    <>
                        <h3>Внешние ключи</h3>
                        <table className={styles.schemaTable}>
                            <thead>
                                <tr>
                                    <th>Колонка</th>
                                    <th>Ссылается на таблицу</th>
                                    <th>Ссылается на колонку</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tableSchema.foreign_keys.map((fk, index) => (
                                    <tr key={index}>
                                        <td>{fk.COLUMN_NAME}</td>
                                        <td>{fk.REFERENCED_TABLE_NAME}</td>
                                        <td>{fk.REFERENCED_COLUMN_NAME}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className={styles.adminPage}>
            <h1>Администрирование базы данных</h1>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.tableSelector}>
                <select 
                    value={selectedTable} 
                    onChange={(e) => setSelectedTable(e.target.value)}
                    className={styles.select}
                >
                    <option value="">Выберите таблицу</option>
                    {tables.map(table => (
                        <option key={table} value={table}>
                            {table}
                        </option>
                    ))}
                </select>
            </div>

            {selectedTable && (
                <div className={styles.tableContainer}>
                    <h2>Таблица: {selectedTable}</h2>
                    
                    {renderSchemaInfo()}

                    <h3>Данные</h3>
                    <div className={styles.tableWrapper}>
                        <table className={styles.dataTable}>
                            <thead>
                                {renderTableHeader()}
                            </thead>
                            <tbody>
                                {renderTableRows()}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPage; 