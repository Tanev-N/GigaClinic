import React, { useState } from 'react';
import styles from './Calendar.module.scss';
import { classNames } from '@/shared/lib/classNames/classNames';

interface CalendarProps {
    selectedDate: Date | null;
    onSelectDate: (date: Date) => void;
    availableDays?: number[];
}

export const Calendar = ({ selectedDate, onSelectDate, availableDays }: CalendarProps) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const months = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const isDateAvailable = (date: Date) => {
        if (date < new Date(new Date().setHours(0, 0, 0, 0))) {
            return false;
        }

        const dayOfWeek = date.getDay() || 7;
        return availableDays?.includes(dayOfWeek) ?? true;
    };

    const renderDays = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1).getDay() || 7;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const days = [];

        // Добавляем пустые ячейки в начале
        for (let i = 1; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className={styles.emptyDay} />);
        }

        // Добавляем дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const isAvailable = isDateAvailable(date);
            const isToday = new Date().toDateString() === date.toDateString();
            const isSelected = selectedDate?.toDateString() === date.toDateString();

            days.push(
                <div
                    key={day}
                    className={classNames(styles.day, {
                        [styles.available]: isAvailable,
                        [styles.unavailable]: !isAvailable,
                        [styles.today]: isToday,
                        [styles.selected]: isSelected,
                    })}
                    onClick={() => isAvailable && onSelectDate(new Date(year, month, day+1))}
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
                <span>
                    {months[currentDate.getMonth()]} {currentDate.getFullYear()}
                </span>
                <button onClick={nextMonth}>&gt;</button>
            </div>

            <div className={styles.weekDays}>
                {weekDays.map(day => (
                    <div key={day} className={styles.weekDay}>
                        {day}
                    </div>
                ))}
            </div>

            <div className={styles.days}>
                {renderDays()}
            </div>
        </div>
    );
}; 