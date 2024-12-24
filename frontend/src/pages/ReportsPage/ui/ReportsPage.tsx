import React, { useState, useEffect } from 'react';
import styles from './ReportsPage.module.scss';
import { API_ENDPOINTS, API_BASE_URL } from '@/shared/config/api';

interface ReportType {
    id_report_type: number;
    name: string;
    description: string;
    parameters: string;
}

interface Report {
    id_report: number;
    report_type_name: string;
    created_at: string;
    parameters: string;
    result: string;
}

interface Doctor {
    id_doc: number;
    full_name: string;
}

interface AvailableMonth {
    year: number;
    month: number;
    month_name: string;
    display_name: string;
}

interface ReportDetails {
    report: Report;
    details: Array<{
        patient_name: string;
        patient_birth: string;
        patient_address: string;
        doctor_name: string;
        doctor_specialization: string;
        visit_date: string;
        visit_date_formatted: string;
        visit_time: string;
        diagnosis: string;
        complaints: string;
    }>;
}

const ReportsPage = () => {
    const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
    const [selectedType, setSelectedType] = useState<number | null>(null);
    const [parameters, setParameters] = useState<Record<string, string>>({});
    const [reports, setReports] = useState<Report[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    // Данные для динамических параметров
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [availableMonths, setAvailableMonths] = useState<AvailableMonth[]>([]);
    const [availableDiagnoses, setAvailableDiagnoses] = useState<string[]>([]);

    const [selectedReport, setSelectedReport] = useState<number | null>(null);
    const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchReportTypes();
        fetchReportsHistory();
    }, []);

    useEffect(() => {
        if (selectedType) {
            const reportType = reportTypes.find(t => t.id_report_type === selectedType);
            if (reportType) {
                const requiredParams = JSON.parse(reportType.parameters).required;
                if (requiredParams.includes('doctor_id')) {
                    fetchDoctors();
                }
                if (requiredParams.includes('diagnosis')) {
                    fetchDiagnoses();
                }
                if (requiredParams.includes('month') || requiredParams.includes('year')) {
                    fetchAvailableMonthsForAll();
                }
            }
        }
    }, [selectedType]);

    useEffect(() => {
        if (parameters.doctor_id) {
            fetchAvailableMonths(parameters.doctor_id);
        }
    }, [parameters.doctor_id]);

    const fetchReportTypes = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.TYPES, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setReportTypes(data);
            } else {
                setError(data.error || 'Ошибка при загрузке типов отчетов');
            }
        } catch (err) {
            setError('Ошибка при загрузке типов отчетов');
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.AVAILABLE_DOCTORS, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setDoctors(data);
            }
        } catch (err) {
            setError('Ошибка при загрузке списка врачей');
        }
    };

    const fetchAvailableMonths = async (doctorId: string) => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.AVAILABLE_MONTHS_BY_DOCTOR(doctorId), {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAvailableMonths(data);
            }
        } catch (err) {
            setError('Ошибка при загрузке доступных месяцев');
        }
    };

    const fetchDiagnoses = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.AVAILABLE_DIAGNOSES, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAvailableDiagnoses(data);
            }
        } catch (err) {
            setError('Ошибка при загрузке списка диагнозов');
        }
    };

    const fetchReportsHistory = async () => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.HISTORY, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setReports(data);
            } else {
                setError(data.error || 'Ошибка при загрузке истории отчетов');
            }
        } catch (err) {
            setError('Ошибка при загрузке истории отчетов');
        }
    };

    const fetchAvailableMonthsForAll = async () => {
        try {
            const response = await fetch(`${API_ENDPOINTS.REPORTS.AVAILABLE_MONTHS}/all`, {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setAvailableMonths(data);
            }
        } catch (err) {
            setError('Ошибка при загрузке доступных месяцев');
        }
    };

    const handleGenerateReport = async () => {
        if (!selectedType) return;

        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.GENERATE, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    report_type_id: selectedType,
                    parameters: parameters
                }),
                credentials: 'include',
            });

            const data = await response.json();
            
            if (response.ok) {
                setSuccess('Отчет успешно сгенерирован');
                fetchReportsHistory();
            } else {
                setError(data.error || 'Ошибка при генерации отчета');
            }
        } catch (err) {
            setError('Ошибка при генерации отчета');
        }
    };

    const fetchReportDetails = async (reportId: number) => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.DETAILS(reportId), {
                credentials: 'include'
            });
            const data = await response.json();
            if (response.ok) {
                setReportDetails(data);
                setIsModalOpen(true);
            } else {
                setError(data.error || 'Ошибка при загрузке деталей отчета');
            }
        } catch (err) {
            setError('Ошибка при загрузке деталей отчета');
        }
    };

    const handleReportClick = (reportId: number) => {
        setSelectedReport(reportId);
        fetchReportDetails(reportId);
    };

    const renderParameterInput = (param: string) => {
        const reportType = reportTypes.find(t => t.id_report_type === selectedType);
        const requiredParams = reportType ? JSON.parse(reportType.parameters).required : [];

        if (param === 'doctor_id') {
            return (
                <select
                    value={parameters[param] || ''}
                    onChange={(e) => {
                        setParameters({
                            ...parameters,
                            [param]: e.target.value,
                            month: '',
                            year: ''
                        });
                    }}
                    className={styles.select}
                >
                    <option value="">Выберите врача</option>
                    {doctors.map(doctor => (
                        <option key={doctor.id_doc} value={doctor.id_doc}>
                            {doctor.full_name}
                        </option>
                    ))}
                </select>
            );
        }

        if (param === 'month' || param === 'year') {
            // Проверяем, нужен ли выбор врача для текущего типа отчета
            const needsDoctor = requiredParams.includes('doctor_id');
            if (needsDoctor && !parameters.doctor_id) {
                return <p className={styles.hint}>Сначала выберите врача</p>;
            }

            // Получаем уникальные годы
            const uniqueYears = [...new Set(availableMonths.map(m => m.year))].sort((a, b) => b - a);

            if (param === 'month') {
                if (!parameters.year) {
                    return <p className={styles.hint}>Сначала выберите год</p>;
                }

                // Получаем доступные месяцы для выбранного года
                const availableMonthsForYear = availableMonths
                    .filter(m => m.year === Number(parameters.year))
                    .map(m => m.month);

                const monthNames = [
                    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
                    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
                ];

                return (
                    <select
                        value={parameters.month || ''}
                        onChange={(e) => {
                            setParameters({
                                ...parameters,
                                month: e.target.value
                            });
                        }}
                        className={styles.select}
                    >
                        <option value="">Выберите месяц</option>
                        {monthNames.map((name, index) => {
                            const monthNumber = index + 1;
                            if (availableMonthsForYear.includes(monthNumber)) {
                                return (
                                    <option key={monthNumber} value={monthNumber}>
                                        {name}
                                    </option>
                                );
                            }
                            return null;
                        }).filter(Boolean)}
                    </select>
                );
            }

            return (
                <select
                    value={parameters.year || ''}
                    onChange={(e) => {
                        setParameters({
                            ...parameters,
                            year: e.target.value,
                            month: '' // Сбрасываем месяц при смене года
                        });
                    }}
                    className={styles.select}
                >
                    <option value="">Выберите год</option>
                    {uniqueYears.map(year => (
                        <option key={year} value={year}>
                            {year}
                        </option>
                    ))}
                </select>
            );
        }

        if (param === 'diagnosis') {
            return (
                <select
                    value={parameters[param] || ''}
                    onChange={(e) => setParameters({...parameters, [param]: e.target.value})}
                    className={styles.select}
                >
                    <option value="">Выберите диагноз</option>
                    {availableDiagnoses.map(diagnosis => (
                        <option key={diagnosis} value={diagnosis}>
                            {diagnosis}
                        </option>
                    ))}
                </select>
            );
        }
    };

    const isFormValid = () => {
        if (!selectedType) return false;
        
        const reportType = reportTypes.find(t => t.id_report_type === selectedType);
        if (!reportType) return false;

        const requiredParams = JSON.parse(reportType.parameters).required;
        return requiredParams.every((param: string) => {
            const value = parameters[param];
            return value && value !== '';
        });
    };

    const renderReportDetails = () => {
        if (!reportDetails) return null;

        return (
            <div className={styles.modal} onClick={() => setIsModalOpen(false)}>
                <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
                    <div className={styles.modalHeader}>
                        <h3>{reportDetails.report.report_type_name}</h3>
                        <button 
                            className={styles.closeButton}
                            onClick={() => setIsModalOpen(false)}
                        >
                            ×
                        </button>
                    </div>
                    <div className={styles.modalBody}>
                        <div className={styles.detailsList}>
                            {reportDetails.details.map((detail, index) => (
                                <div key={index} className={styles.detailCard}>
                                    <div className={styles.detailHeader}>
                                        <h4>{detail.patient_name}</h4>
                                        <span className={styles.date}>
                                            {detail.visit_date_formatted} {detail.visit_time}
                                        </span>
                                    </div>
                                    <div className={styles.detailInfo}>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Дата рождения:</span>
                                            <span className={styles.value}>
                                                {new Date(detail.patient_birth).toLocaleDateString('ru-RU')}
                                            </span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Адрес:</span>
                                            <span className={styles.value}>{detail.patient_address}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Врач:</span>
                                            <span className={styles.value}>{detail.doctor_name}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Специализация:</span>
                                            <span className={styles.value}>{detail.doctor_specialization}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Диагноз:</span>
                                            <span className={styles.value}>{detail.diagnosis || 'Не указан'}</span>
                                        </div>
                                        <div className={styles.infoRow}>
                                            <span className={styles.label}>Жалобы:</span>
                                            <span className={styles.value}>{detail.complaints || 'Не указаны'}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const handleDeleteReport = async (reportId: number) => {
        try {
            const response = await fetch(API_ENDPOINTS.REPORTS.DELETE(reportId), {
                method: 'DELETE',
                credentials: 'include'
            });
            const data = await response.json();
            
            if (response.ok) {
                setReports(reports.filter(report => report.id_report !== reportId));
                setSuccess('Отчет успешно удален');
            } else {
                setError(data.error || 'Ошибка при удалении отчета');
            }
        } catch (err) {
            setError('Ошибка при удалении отчета');
        }
    };

    const renderReportHeader = (report: Report) => (
        <div className={styles.reportHeader}>
            <h3>{report.report_type_name}</h3>
            <div className={styles.reportActions}>
                <span className={styles.date}>
                    {new Date(report.created_at).toLocaleString('ru-RU')}
                </span>
                <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteReport(report.id_report)}
                    title="Удалить отчет"
                >
                    ×
                </button>
            </div>
        </div>
    );

    const renderReportResult = (report: Report) => {
        try {
            const result = JSON.parse(report.result);
            const { summary } = result || {};

            return (
                <div 
                    className={styles.reportCard}
                    onClick={() => handleReportClick(report.id_report)}
                >
                    {renderReportHeader(report)}
                    
                    <div className={styles.reportSummary}>
                        {!summary ? (
                            <div className={styles.summaryItem}>
                                <span className={styles.label}>Статус:</span>
                                <span className={styles.value}>Нет данных</span>
                            </div>
                        ) : (
                            <>
                                {summary.doctor_name && (
                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Врач:</span>
                                        <span className={styles.value}>{summary.doctor_name}</span>
                                    </div>
                                )}
                                
                                {summary.period && (
                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Период:</span>
                                        <span className={styles.value}>{summary.period}</span>
                                    </div>
                                )}
                                
                                {summary.diagnosis && (
                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Диагноз:</span>
                                        <span className={styles.value}>{summary.diagnosis}</span>
                                    </div>
                                )}
                                
                                {summary.total_patients !== undefined && (
                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Всего пациентов:</span>
                                        <span className={styles.value}>{summary.total_patients}</span>
                                    </div>
                                )}
                                
                                {summary.doctors && summary.doctors.length > 0 && (
                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Врачи:</span>
                                        <span className={styles.value}>{summary.doctors.join(', ')}</span>
                                    </div>
                                )}

                                {(!summary.total_patients || summary.total_patients === 0) && (
                                    <div className={styles.summaryItem}>
                                        <span className={styles.label}>Результат:</span>
                                        <span className={styles.value}>Нет данных за выбранный период</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className={styles.viewDetails}>
                        Нажмите для просмотра деталей
                    </div>
                </div>
            );
        } catch (err) {
            return (
                <div className={styles.reportCard}>
                    {renderReportHeader(report)}
                    <div className={styles.reportSummary}>
                        <div className={styles.summaryItem}>
                            <span className={styles.label}>Ошибка:</span>
                            <span className={styles.value}>Ошибка при загрузке результатов отчета</span>
                        </div>
                    </div>
                </div>
            );
        }
    };

    return (
        <div className={styles.reportsPage}>
            <h1>Отчеты</h1>

            {error && <div className={styles.error}>{error}</div>}
            {success && <div className={styles.success}>{success}</div>}

            <div className={styles.section}>
                <h2>Создание отчета</h2>
                <div className={styles.formGroup}>
                    <label>Тип отчета:</label>
                    <select
                        value={selectedType || ''}
                        onChange={(e) => {
                            setSelectedType(Number(e.target.value));
                            setParameters({});
                        }}
                        className={styles.select}
                    >
                        <option value="">Выберите тип отчета</option>
                        {reportTypes.map(type => (
                            <option key={type.id_report_type} value={type.id_report_type}>
                                {type.name}
                            </option>
                        ))}
                    </select>
                </div>

                {selectedType && (
                    <>
                        <div className={styles.formGroup}>
                            <p className={styles.description}>
                                {reportTypes.find(t => t.id_report_type === selectedType)?.description}
                            </p>
                        </div>

                        {JSON.parse(reportTypes.find(t => t.id_report_type === selectedType)?.parameters || '{}').required
                            .sort((a: string, b: string) => {
                                // Сортируем параметры в нужном порядке
                                const order = ['doctor_id', 'year', 'month', 'diagnosis'];
                                return order.indexOf(a) - order.indexOf(b);
                            })
                            .map((param: string) => (
                                <div key={param} className={styles.formGroup}>
                                    <label>{param}:</label>
                                    {renderParameterInput(param)}
                                </div>
                            ))}

                        <button
                            className={styles.generateButton}
                            onClick={handleGenerateReport}
                            disabled={!isFormValid()}
                        >
                            Сгенерировать отчет
                        </button>
                    </>
                )}
            </div>

            <div className={styles.section}>
                <h2>История отчетов</h2>
                <div className={styles.reportsList}>
                    {reports.map(report => renderReportResult(report))}
                </div>
            </div>

            {isModalOpen && renderReportDetails()}
        </div>
    );
};

export default ReportsPage; 