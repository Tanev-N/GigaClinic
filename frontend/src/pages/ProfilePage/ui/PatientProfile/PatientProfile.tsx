import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getUserAuthData } from '@/entities/User';
import styles from '../ProfilePage.module.scss';

interface PatientData {
  passport_data: string;
  address: string;
  birth: string;
  login: string;
}

interface Appointment {
  id: number;
  date: string;
  time: string;
  doctor_name: string;
  cabinet: string;
  appearance: string;
  visit_id: number | null;
  diagnosis: string | null;
  complaints: string | null;
}

const formatDateForInput = (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

const PatientProfile = () => {
  const auth = useSelector(getUserAuthData);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [patientData, setPatientData] = useState<PatientData>({
    passport_data: '',
    address: '',
    birth: '',
    login: ''
  });
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Вычис��яем максимальную дату (18 лет назад от текущей даты)
  const maxBirthDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 18);
    return date.toISOString().split('T')[0];
  })();

  // Вычисляем минимальную дату (120 лет назад от текущей даты)
  const minBirthDate = (() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 120);
    return date.toISOString().split('T')[0];
  })();

  useEffect(() => {
    fetchPatientData();
    fetchAppointments();
  }, []);

  const fetchPatientData = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/patient', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setPatientData({
          ...data,
          birth: formatDateForInput(data.birth)
        });
      } else {
        setError(data.error || 'Ошибка при загрузке данных');
      }
    } catch (err) {
      setError('Ошибка при загрузке данных');
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/profile/appointments', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok) {
        setAppointments(data.map((appointment: any) => ({
          id: appointment.id,
          date: appointment.date,
          time: appointment.time,
          doctor_name: appointment.doctor_name,
          cabinet: appointment.cabinet,
          appearance: appointment.appearance,
          visit_id: appointment.visit_id,
          diagnosis: appointment.diagnosis,
          complaints: appointment.complaints
        })));
      } else {
        setError(data.error || 'Ошибка при загрузке записей');
      }
    } catch (err) {
      setError('Ошибка при загрузке записей');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch('http://localhost:5000/api/profile/patient', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          passport_data: patientData.passport_data,
          address: patientData.address,
          birth: patientData.birth,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('Данные успешно обновлены');
        setIsEditing(false);
      } else {
        setError(data.error || 'Ошибка при обновлении данных');
      }
    } catch (err) {
      setError('Ошибка при обновлении данных');
    }
  };

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/profile/appointments/${appointmentId}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setAppointments(appointments.filter(app => app.id !== appointmentId));
        setSuccess('Запись успешно удалена');
      } else {
        setError(data.error || 'Ошибка при удалении записи');
      }
    } catch (err) {
      setError('Ошибка при удалении записи');
    }
  };

  return (
    <div className={styles.profileContainer}>
      <h1 className={styles.title}>Профиль</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h2>Личные данные</h2>
          {!isEditing && (
            <button 
              className={styles.editButton}
              onClick={() => setIsEditing(true)}
            >
              Изменить персональные данные
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>Паспортные данные</label>
            <input
              type="text"
              value={patientData.passport_data}
              onChange={(e) => setPatientData({...patientData, passport_data: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Адрес</label>
            <input
              type="text"
              value={patientData.address}
              onChange={(e) => setPatientData({...patientData, address: e.target.value})}
              disabled={!isEditing}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Дата рождения</label>
            <input
              type="date"
              value={patientData.birth}
              onChange={(e) => setPatientData({...patientData, birth: e.target.value})}
              disabled={!isEditing}
              max={maxBirthDate}
              min={minBirthDate}
            />
          </div>

          {isEditing && (
            <div className={styles.buttonGroup}>
              <button type="submit" className={styles.saveButton}>
                Сохранить
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => {
                  setIsEditing(false);
                  fetchPatientData();
                }}
              >
                Отмена
              </button>
            </div>
          )}
        </form>
      </div>

      <div className={styles.section}>
        <h2>Данные для входа в систему</h2>
        <div className={styles.formGroup}>
          <label>Логин</label>
          <input
            type="text"
            value={patientData.login}
            disabled
          />
        </div>

        <div className={styles.formGroup}>
          <label>Пароль</label>
          <input
            type="password"
            value="******"
            disabled
          />
        </div>
      </div>

      <div className={styles.section}>
        <h2>Мои записи</h2>
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
                <div className={styles.doctorName}>{appointment.doctor_name}</div>
                <div className={styles.cabinet}>{appointment.cabinet}</div>
                
                {appointment.visit_id ? (
                  <div className={styles.diagnosis}>
                    <h4>Диагноз:</h4>
                    <p>{appointment.diagnosis}</p>
                    <h4>Жалобы:</h4>
                    <p>{appointment.complaints}</p>
                  </div>
                ) : (
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeleteAppointment(appointment.id)}
                  >
                    Отменить запись
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noAppointments}>
            У вас пока нет записей к врачу
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientProfile; 