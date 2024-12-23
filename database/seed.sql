USE clinic;

-- Сначала заполняем роли
INSERT INTO role (id_role, name) VALUES
(1, 'admin'),
(2, 'patient'),
(3, 'doctor');

-- Затем создаем пользователей
INSERT INTO user (login, password_hash, role_id) VALUES
('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdCsG/8oCBPwKGm', 1),
('ivanov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdCsG/8oCBPwKGm', 3),
('petrov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdCsG/8oCBPwKGm', 3),
('sidorov', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdCsG/8oCBPwKGm', 2);

-- Заполняем отделения
INSERT INTO department (name, floor, head) VALUES
('Терапия', 1, 'Иванов Иван Иванович'),
('Хирургия', 2, 'Петров Пётр Петрович'),
('Диагностический центр', 3, 'Сидорова Светлана Сергеевна');

-- Заполняем кабинеты
INSERT INTO cabinet (department_id_dep, type, square) VALUES
(1, 'Приемный кабинет', 30),
(2, 'Хирургический зал', 45),
(3, 'Диагностический кабинет', 35);

-- Добавляем докторов с полным именем
INSERT INTO doctor (department_id_dep, full_name, passport_data, address, birth, specialization, employment) VALUES
(1, 'Зимина Ольга Владимировна', 123456, 'ул. Ленина, д.1', '1980-01-15', 'Педиатр', '2010-01-01'),
(1, 'Воробьева Галина Николаевна', 234567, 'ул. Пушкина, д.2', '1975-05-20', 'Педиатр', '2008-03-15'),
(1, 'Пузырева Анна Александровна', 345678, 'ул. Гоголя, д.3', '1982-07-10', 'Педиатр', '2012-06-20');

-- Добавляем расписание врачей
INSERT INTO doctor_schedule (doctor_id, day_of_week, start_time, end_time, cabinet) VALUES
-- Зимина О.В.
(1, 1, '08:00', '11:30', '227'), -- Понедельник
(1, 2, '08:00', '11:00', '227'), -- Вторник
(1, 3, '16:00', '19:00', '227'), -- Среда
(1, 4, '08:00', '10:30', '227'), -- Четверг
-- Воробьева Г.Н.
(2, 1, '15:30', '19:00', '228'),
(2, 2, '11:00', '14:00', '228'),
(2, 3, '08:00', '11:30', '228'),
(2, 4, '14:00', '16:30', '228'),
-- Пузырева А.А.
(3, 1, '15:30', '19:00', '202'),
(3, 2, '14:00', '17:00', '202'),
(3, 3, '08:00', '11:30', '202'),
(3, 4, '08:00', '10:30', '202');

-- Заполняем пациентов (с привязкой к пользователям)
INSERT INTO patient (passport_data, address, birth, user_id) VALUES
('AB123456', 'ул. Гагарина, д.10', '1990-07-25', 4);

-- Заполняем расписание
INSERT INTO timetable (cabinet_id_cab, doctor_id_doc, patient_id_patient, admission, time, appearance) VALUES
(1, 1, 1, '2024-01-10', '10:00:00', 'Личное'),
(2, 2, 1, '2024-01-11', '15:30:00', 'Онлайн');

-- Заполняем посещения
INSERT INTO visiting (patient_id_patient, date, diagnosis, complaints, doctor_id_doc) VALUES
(1, '2024-01-10', 'ОРВИ', 'Температура, кашель', 1),
(1, '2024-01-11', 'Здоров', 'Плановый осмотр', 2);
