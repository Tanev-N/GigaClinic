import React, { useEffect, useState } from 'react';
import styles from './SchedulePage.module.scss';
import { API_ENDPOINTS } from '@/shared/config/api';

interface DoctorSchedule {
  id_doc: number;
  full_name: string;
  schedule: {
    [key: number]: { // день недели (1-5)
      start_time: string;
      end_time: string;
      cabinet: string;
    };
  };
}

const SchedulePage = () => {
  const [doctors, setDoctors] = useState<DoctorSchedule[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDoctorsSchedule();
  }, []);

  const fetchDoctorsSchedule = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SCHEDULE.DOCTORS, {
        credentials: 'include'
      });
      const data = await response.json();

      if (response.ok) {
        setDoctors(data);
      } else {
        setError(data.error || 'Ошибка при загрузке расписания');
      }
    } catch (err) {
      setError('Ошибка при загрузке расписания');
    }
  };

  return (
    <div className={styles.schedulePage}>
      <h1>Расписание приемов врачей педиатров участковых в поликлинике</h1>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <div className={styles.tableWrapper}>
        <table className={styles.scheduleTable}>
          <thead>
            <tr>
              <th>№ уч.</th>
              <th>ФИО врача</th>
              <th>Понедельник</th>
              <th>Вторник</th>
              <th>Среда</th>
              <th>Четверг</th>
              <th>Пятница</th>
              <th>№ каб.</th>
            </tr>
          </thead>
          <tbody>
            {doctors.map((doctor) => (
              <tr key={doctor.id_doc}>
                <td>{doctor.id_doc}</td>
                <td>{doctor.full_name}</td>
                {[1, 2, 3, 4, 5].map((day) => (
                  <td key={day}>
                    {doctor.schedule[day] 
                      ? `${doctor.schedule[day].start_time} - ${doctor.schedule[day].end_time}`
                      : '—'
                    }
                  </td>
                ))}
                <td>{doctor.schedule[1]?.cabinet || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SchedulePage;