import React, { useState } from 'react';
import styles from './Calendar.module.scss';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  availableDays?: number[]; // дни недели, когда врач принимает (1-7)
}

export const Calendar = ({ selectedDate, onSelectDate, availableDays = [] }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  // Корректируем firstDayOfMonth, чтобы понедельник был 1, а воскресенье 7
  const adjustedFirstDayOfMonth = firstDayOfMonth === 0 ? 7 : firstDayOfMonth;

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isDateAvailable = (date: Date) => {
    // Проверяем, что дата не в прошлом
    if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
      return false;
    }
    
    // Преобразуем день недели из формата JS (0-6) в наш формат (1-7)
    const dayOfWeek = date.getDay();
    const adjustedDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;
    return availableDays.includes(adjustedDayOfWeek);
  };

  const isSelectedDate = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  const monthNames = [
    'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
    'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
  ];

  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

  const renderDays = () => {
    const days = [];
    const today = new Date();

    // Используем adjustedFirstDayOfMonth вместо firstDayOfMonth
    for (let i = 0; i < adjustedFirstDayOfMonth - 1; i++) {
      days.push(<div key={`empty-${i}`} className={styles.emptyDay} />);
    }

    // Добавляем дни месяца
    for (let day = 1; day <= daysInMonth; day++) {
      // Создаем новую дату, устанавливая часы в начале дня
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, 0, 0, 0);
      const available = isDateAvailable(date);
      const selected = isSelectedDate(date);
      const isToday = date.toDateString() === today.toDateString();

      days.push(
        <div
          key={day}
          className={`
            ${styles.day}
            ${available ? styles.available : styles.unavailable}
            ${selected ? styles.selected : ''}
            ${isToday ? styles.today : ''}
          `}
          onClick={(e) => {
            e.preventDefault(); 
            if (available) {
              const selectedDate = new Date(Date.UTC(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                day,
                0, 0, 0, 0
              ));
              onSelectDate(selectedDate);
            }
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={prevMonth}>&lt;</button>
        <span>{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</span>
        <button onClick={nextMonth}>&gt;</button>
      </div>
      <div className={styles.weekDays}>
        {dayNames.map(day => (
          <div key={day} className={styles.weekDay}>{day}</div>
        ))}
      </div>
      <div className={styles.days}>
        {renderDays()}
      </div>
    </div>
  );
}; 