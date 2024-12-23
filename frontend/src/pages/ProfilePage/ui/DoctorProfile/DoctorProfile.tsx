import React, { useState, useEffect } from 'react';
import styles from '../ProfilePage.module.scss';

interface DoctorSchedule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  cabinet: string;
}

interface DoctorData {
  id_doc: number;
  full_name: string;
  passport_data: string;
  address: string;
  birth: string;
  specialization: string;
  employment: string;
  dismissal: string | null;
  department_name: string;
  login: string;
  schedule: DoctorSchedule[];
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  patient_id: number;
  passport_data: string;
  age: string;
  cabinet: string;
  appearance: string;
  is_past: boolean;
  visit_id: number | null;
  diagnosis: string | null;
  complaints: string | null;
}

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState<DoctorData | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [diagnosisData, setDiagnosisData] = useState({
    diagnosis: '',
    complaints: ''
  });

  useEffect(() => {
    fetchDoctorData();
    fetchAppointments();
  }, []);

  const fetchDoctorData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/doctor', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setDoctorData(data);
      } else {
        setError(data.error || 'Ошибка при загрузке данных врача');
      }
    } catch (err) {
      setError('Ошибка при загрузке данных врача');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/doctor/appointments', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data);
      } else {
        setError(data.error || 'Ошибка при загрузке записей');
      }
    } catch (err) {
      setError('Ошибка при загрузке записей');
    }
  };

  const handleAddDiagnosis = async (appointment: Appointment) => {
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/doctor/add-diagnosis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          appointment_id: appointment.id,
          diagnosis: diagnosisData.diagnosis,
          complaints: diagnosisData.complaints
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Диагноз успешно добавлен');
        setSelectedAppointment(null);
        setDiagnosisData({ diagnosis: '', complaints: '' });
        fetchAppointments();
      } else {
        setError(data.error || 'Ошибка при добавлении диагноза');
      }
    } catch (err) {
      setError('Ошибка при добавлении диагноза');
    }
  };

  const getDayName = (day: number) => {
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return days[day - 1];
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Профиль врача</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      {doctorData && (
        <div className={styles.section}>
          <h2>Личная информация</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoRow}>
              <span className={styles.label}>ФИО:</span>
              <span className={styles.value}>{doctorData.full_name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Логин:</span>
              <span className={styles.value}>{doctorData.login}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Паспортные данные:</span>
              <span className={styles.value}>{doctorData.passport_data}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Адрес:</span>
              <span className={styles.value}>{doctorData.address}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Дата рождения:</span>
              <span className={styles.value}>
                {new Date(doctorData.birth).toLocaleDateString('ru-RU')}
              </span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Специализация:</span>
              <span className={styles.value}>{doctorData.specialization}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Отделение:</span>
              <span className={styles.value}>{doctorData.department_name}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.label}>Дата приема на работу:</span>
              <span className={styles.value}>
                {new Date(doctorData.employment).toLocaleDateString('ru-RU')}
              </span>
            </div>
            {doctorData.dismissal && (
              <div className={styles.infoRow}>
                <span className={styles.label}>Дата увольнения:</span>
                <span className={styles.value}>
                  {new Date(doctorData.dismissal).toLocaleDateString('ru-RU')}
                </span>
              </div>
            )}
          </div>

          <h3>Расписание приема</h3>
          <div className={styles.scheduleGrid}>
            {doctorData.schedule.map((item) => (
              <div key={item.day_of_week} className={styles.scheduleRow}>
                <span className={styles.day}>{getDayName(item.day_of_week)}</span>
                <span className={styles.time}>
                  {item.start_time} - {item.end_time}
                </span>
                <span className={styles.cabinet}>Кабинет {item.cabinet}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2>Записи пациентов</h2>
        {appointments.length > 0 ? (
          <div className={styles.appointmentsList}>
            {appointments.map((appointment) => (
              <div key={appointment.id} className={styles.appointmentCard}>
                <div className={styles.appointmentHeader}>
                  <div className={styles.dateTime}>
                    <div className={styles.date}>
                      {new Date(appointment.date).toLocaleDateString('ru-RU')}
                    </div>
                    <div className={styles.time}>{appointment.time}</div>
                  </div>
                  <div className={styles.appearance}>{appointment.appearance}</div>
                </div>
                <div className={styles.patientInfo}>
                  <div>ФИО: {appointment.passport_data}</div>
                  <div>Возраст: {appointment.age}</div>
                </div>
                <div className={styles.cabinet}>{appointment.cabinet}</div>
                
                {appointment.visit_id ? (
                  <div className={styles.diagnosis}>
                    <h4>Диагноз:</h4>
                    <p>{appointment.diagnosis}</p>
                    <h4>Жалобы:</h4>
                    <p>{appointment.complaints}</p>
                  </div>
                ) : appointment.is_past && selectedAppointment?.id !== appointment.id ? (
                  <button 
                    className={styles.addDiagnosisButton}
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    Добавить диагноз
                  </button>
                ) : null}

                {selectedAppointment?.id === appointment.id && (
                  <div className={styles.diagnosisForm}>
                    <div className={styles.formGroup}>
                      <label>Диагноз:</label>
                      <input
                        type="text"
                        value={diagnosisData.diagnosis}
                        onChange={(e) => setDiagnosisData({
                          ...diagnosisData,
                          diagnosis: e.target.value
                        })}
                      />
                    </div>
                    <div className={styles.formGroup}>
                      <label>Жалобы:</label>
                      <input
                        type="text"
                        value={diagnosisData.complaints}
                        onChange={(e) => setDiagnosisData({
                          ...diagnosisData,
                          complaints: e.target.value
                        })}
                      />
                    </div>
                    <div className={styles.formButtons}>
                      <button
                        className={styles.saveButton}
                        onClick={() => handleAddDiagnosis(selectedAppointment)}
                      >
                        Сохранить
                      </button>
                      <button
                        className={styles.cancelButton}
                        onClick={() => {
                          setSelectedAppointment(null);
                          setDiagnosisData({ diagnosis: '', complaints: '' });
                        }}
                      >
                        Отмена
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noAppointments}>
            У вас пока нет записей пациентов
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;