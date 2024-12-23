USE clinic;

DROP TABLE IF EXISTS `role`;
CREATE TABLE `role` (
  `id_role` int NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  PRIMARY KEY (`id_role`),
  UNIQUE KEY `name_UNIQUE` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `user`;
CREATE TABLE `user` (
  `id_user` int NOT NULL AUTO_INCREMENT,
  `login` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int NOT NULL DEFAULT 2,
  PRIMARY KEY (`id_user`),
  UNIQUE KEY `login_UNIQUE` (`login`),
  KEY `fk_user_role_idx` (`role_id`),
  CONSTRAINT `fk_user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`id_role`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP TABLE IF EXISTS `department`;
CREATE TABLE `department` (
  `id_dep` int NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `floor` int NOT NULL,
  `head` varchar(100) NOT NULL,
  PRIMARY KEY (`id_dep`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `department` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `cabinet`;
CREATE TABLE `cabinet` (
  `id_cab` int NOT NULL AUTO_INCREMENT,
  `department_id_dep` int NOT NULL,
  `type` varchar(100) NOT NULL,
  `square` int NOT NULL,
  PRIMARY KEY (`id_cab`),
  KEY `fk_cabinet_department1_idx` (`department_id_dep`),
  CONSTRAINT `fk_cabinet_department1` FOREIGN KEY (`department_id_dep`) REFERENCES `department` (`id_dep`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `cabinet` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `doctor`;
CREATE TABLE `doctor` (
  `id_doc` int NOT NULL AUTO_INCREMENT,
  `department_id_dep` int NOT NULL,
  `full_name` varchar(100) NOT NULL,
  `passport_data` varchar(20) NOT NULL,
  `address` varchar(255) NOT NULL,
  `birth` date NOT NULL,
  `specialization` varchar(50) NOT NULL,
  `employment` date NOT NULL,
  `dismissal` date DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id_doc`),
  KEY `fk_doctor_department_idx` (`department_id_dep`),
  CONSTRAINT `fk_doctor_department` FOREIGN KEY (`department_id_dep`) REFERENCES `department` (`id_dep`),
  CONSTRAINT `fk_doctor_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `doctor` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `patient`;
CREATE TABLE `patient` (
  `id_patient` int NOT NULL AUTO_INCREMENT,
  `passport_data` varchar(100) DEFAULT NULL,
  `address` varchar(100) DEFAULT NULL,
  `birth` date DEFAULT NULL,
  `reg_data` datetime DEFAULT CURRENT_TIMESTAMP,
  `user_id` int DEFAULT NULL,
  PRIMARY KEY (`id_patient`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `user` (`id_user`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `patient` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `timetable`;
CREATE TABLE `timetable` (
  `id_tit` int NOT NULL AUTO_INCREMENT,
  `cabinet_id_cab` int NOT NULL,
  `doctor_id_doc` int NOT NULL,
  `patient_id_patient` int NOT NULL,
  `admission` date NOT NULL,
  `time` time NOT NULL,
  `appearance` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_tit`),
  KEY `fk_timetable_cabinet1_idx` (`cabinet_id_cab`),
  KEY `fk_timetable_doctor1_idx` (`doctor_id_doc`),
  KEY `fk_timetable_patient1_idx` (`patient_id_patient`),
  CONSTRAINT `fk_timetable_cabinet1` FOREIGN KEY (`cabinet_id_cab`) REFERENCES `cabinet` (`id_cab`),
  CONSTRAINT `fk_timetable_doctor1` FOREIGN KEY (`doctor_id_doc`) REFERENCES `doctor` (`id_doc`),
  CONSTRAINT `fk_timetable_patient1` FOREIGN KEY (`patient_id_patient`) REFERENCES `patient` (`id_patient`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `timetable` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `visiting`;
CREATE TABLE `visiting` (
  `id_vis` int NOT NULL AUTO_INCREMENT,
  `patient_id_patient` int NOT NULL,
  `date` date NOT NULL,
  `time` time NOT NULL,
  `diagnosis` varchar(100) NOT NULL,
  `complaints` varchar(100) NOT NULL,
  `doctor_id_doc` int NOT NULL,
  `timetable_id` int NOT NULL,
  PRIMARY KEY (`id_vis`),
  UNIQUE KEY `id_vis_UNIQUE` (`id_vis`),
  KEY `fk_visiting_patient1_idx` (`patient_id_patient`),
  KEY `fk_visiting_doctor1_idx` (`doctor_id_doc`),
  KEY `fk_visiting_timetable1_idx` (`timetable_id`),
  CONSTRAINT `fk_visiting_doctor1` FOREIGN KEY (`doctor_id_doc`) REFERENCES `doctor` (`id_doc`),
  CONSTRAINT `fk_visiting_patient1` FOREIGN KEY (`patient_id_patient`) REFERENCES `patient` (`id_patient`),
  CONSTRAINT `fk_visiting_timetable1` FOREIGN KEY (`timetable_id`) REFERENCES `timetable` (`id_tit`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

LOCK TABLES `visiting` WRITE;
UNLOCK TABLES;

DROP TABLE IF EXISTS `doctor_schedule`;
CREATE TABLE `doctor_schedule` (
  `id` int NOT NULL AUTO_INCREMENT,
  `doctor_id` int NOT NULL,
  `day_of_week` int NOT NULL, -- 1-5 (пн-пт)
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `cabinet` varchar(10) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_schedule_doctor_idx` (`doctor_id`),
  CONSTRAINT `fk_schedule_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id_doc`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Таблица типов отчетов
CREATE TABLE report_type (
    id_report_type INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSON -- Хранение параметров отчета в JSON формате
);

-- Таблица отчетов
CREATE TABLE report (
    id_report INT PRIMARY KEY AUTO_INCREMENT,
    report_type_id INT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL, -- ID менеджера, создавшего отчет
    parameters JSON, -- Сохраненные параметры отчета
    result JSON, -- Результаты отчета
    FOREIGN KEY (report_type_id) REFERENCES report_type(id_report_type),
    FOREIGN KEY (created_by) REFERENCES user(id_user)
);

-- Добавляем типы отчетов
INSERT INTO report_type (name, description, parameters) VALUES
(
    'Количество пациентов у врача за месяц',
    'Отчет показывает количество принятых пациентов у выбранного врача за указанный месяц',
    '{"required": ["doctor_id", "month", "year"]}'
),
(
    'Общее количество пациентов за месяц',
    'Отчет показывает общее количество принятых пациентов всеми врачами за указанный месяц',
    '{"required": ["month", "year"]}'
),
(
    'Количество пациентов по диагнозу',
    'Отчет показывает количество пациентов с указанным диагнозом',
    '{"required": ["diagnosis"]}'
);

-- Таблица деталей отчетов
CREATE TABLE report_details (
    id_report_detail INT PRIMARY KEY AUTO_INCREMENT,
    report_id INT NOT NULL,
    patient_id INT NOT NULL,
    doctor_id INT,
    visit_date DATE,
    diagnosis VARCHAR(255),
    FOREIGN KEY (report_id) REFERENCES report(id_report),
    FOREIGN KEY (patient_id) REFERENCES patient(id_patient),
    FOREIGN KEY (doctor_id) REFERENCES doctor(id_doc)
);
