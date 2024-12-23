CREATE DATABASE IF NOT EXISTS clinic
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'clinic'@'%' IDENTIFIED BY 'clinic';
GRANT ALL PRIVILEGES ON clinic.* TO 'clinic'@'%';

FLUSH PRIVILEGES;

USE clinic;
