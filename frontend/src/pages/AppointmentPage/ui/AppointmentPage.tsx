import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StepIndicator } from '@/features/appointment/ui/StepIndicator/StepIndicator';
import styles from './AppointmentPage.module.scss';
import { Calendar } from '@/features/appointment/ui/Calendar/Calendar';
import { API_ENDPOINTS, API_BASE_URL } from '@/shared/config/api';

interface Doctor {
  id_doc: number;
  full_name: string;
  department_id_dep: number;
  specialization: string;
}

interface AvailableSlots {
  date: string;
  doctor_id: number;
  available_slots: string[];
}

interface AppointmentData {
  selectedDoctor: number | null;
  selectedDate: string;
  selectedTime: string;
}

interface Department {
  id_dep: number;
  name: string;
  floor: number;
  head: string;
}

const AppointmentPage = () => {
  const [step, setStep] = useState(1);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [appointmentData, setAppointmentData] = useState<AppointmentData>({
    selectedDoctor: null,
    selectedDate: '',
    selectedTime: '',
  });
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [dateError, setDateError] = useState('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<number | null>(null);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.SCHEDULE.DEPARTMENTS, {
        credentials: 'include'
      });
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError('Ошибка при загрузке списка отделений');
    }
  };

  const fetchDoctors = async (departmentId: number) => {
    try {
      const response = await fetch(API_ENDPOINTS.SCHEDULE.DOCTORS_BY_DEPARTMENT(departmentId), {
        credentials: 'include'
      });
      const data = await response.json();
      setDoctors(data);
    } catch (err) {
      setError('Ошибка при загрузке списка врачей');
    }
  };

  const fetchAvailableSlots = async () => {
    if (!appointmentData.selectedDoctor || !appointmentData.selectedDate) return;

    try {
      setDateError('');
      const response = await fetch(
        API_ENDPOINTS.APPOINTMENT.AVAILABLE_SLOTS(appointmentData.selectedDoctor, appointmentData.selectedDate),
        { credentials: 'include' }
      );
      const data = await response.json();
      
      if (!response.ok) {
        setDateError(data.error);
        setAvailableSlots([]);
        return;
      }
      
      setAvailableSlots(data.available_slots);
    } catch (err) {
      setError('Ошибка при загрузке доступного времени');
    }
  };

  useEffect(() => {
    if (appointmentData.selectedDoctor && appointmentData.selectedDate) {
      fetchAvailableSlots();
    }
  }, [appointmentData.selectedDoctor, appointmentData.selectedDate]);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setStep(prev => prev - 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_ENDPOINTS.APPOINTMENT.CREATE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          doctor_id: appointmentData.selectedDoctor,
          date: appointmentData.selectedDate,
          time: appointmentData.selectedTime,
        }),
        credentials: 'include',
      });

      const data = await response.json();

      if (response.ok) {
        navigate('/profile', { state: { message: 'Запись создана успешно' } });
      } else {
        setError(data.error || 'Ошибка при создании записи');
      }
    } catch (err) {
      setError('Ошибка при отправке данных');
    }
  };

  return (
    <div className={styles.appointmentPage}>
      <StepIndicator currentStep={step} totalSteps={3} />

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.content}>
        {step === 1 && (
          <div className={styles.section}>
            <h2>Выберите отделение</h2>
            <div className={styles.departmentsList}>
              {departments.map((department) => (
                <div
                  key={department.id_dep}
                  className={`${styles.departmentCard} ${selectedDepartment === department.id_dep ? styles.selected : ''}`}
                  onClick={() => {
                    setSelectedDepartment(department.id_dep);
                    fetchDoctors(department.id_dep);
                    handleNext();
                  }}
                >
                  <h3>{department.name}</h3>
                  <p>Этаж: {department.floor}</p>
                  <p>Заведующий: {department.head}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.section}>
            <h2>Выберите врача</h2>
            <div className={styles.doctorsList}>
              {doctors.map((doctor) => (
                <div
                  key={doctor.id_doc}
                  className={`${styles.doctorCard} ${appointmentData.selectedDoctor === doctor.id_doc ? styles.selected : ''}`}
                  onClick={() => {
                    setAppointmentData({
                      ...appointmentData,
                      selectedDoctor: doctor.id_doc
                    });
                    handleNext();
                  }}
                >
                  <h3>{doctor.full_name}</h3>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className={styles.section}>
            <h2>Выберите дату приёма</h2>
            <div className={styles.dateTimeSelector}>
              <Calendar
                selectedDate={appointmentData.selectedDate ? new Date(appointmentData.selectedDate) : null}
                onSelectDate={(date) => {
                  setAppointmentData({
                    ...appointmentData,
                    selectedDate: date.toISOString().split('T')[0],
                    selectedTime: ''
                  });
                }}
                availableDays={[1, 2, 3, 4, 5]}
              />
              {appointmentData.selectedDate && !dateError && (
                <div className={styles.timeSlots}>
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      className={`${styles.timeSlot} ${appointmentData.selectedTime === time ? styles.selected : ''}`}
                      onClick={() => setAppointmentData({
                        ...appointmentData,
                        selectedTime: time
                      })}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div className={styles.navigation}>
          {step > 1 && (
            <button 
              className={styles.backButton}
              onClick={handleBack}
            >
              Назад
            </button>
          )}
          {step < 3 && (
            <button 
              className={styles.nextButton}
              onClick={handleNext}
              disabled={
                (step === 2 && !appointmentData.selectedDoctor)
              }
            >
              Далее
            </button>
          )}
          {step === 3 && appointmentData.selectedTime && (
            <button 
              className={styles.submitButton}
              onClick={handleSubmit}
            >
              Записаться на прием
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentPage; 