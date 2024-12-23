SELECT 
    COUNT(DISTINCT v.patient_id_patient) as patient_count,
    GROUP_CONCAT(DISTINCT d.full_name ORDER BY d.full_name SEPARATOR ', ') as doctors,
    GROUP_CONCAT(DISTINCT 
        CONCAT(
            p.passport_data, ' (', 
            DATE_FORMAT(v.date, '%d.%m.%Y'), ' ', 
            TIME_FORMAT(v.time, '%H:%i'), ')'
        ) 
        ORDER BY v.date DESC, v.time DESC 
        SEPARATOR '; '
    ) as patients_list
FROM visiting v
JOIN timetable t ON v.timetable_id = t.id_tit
JOIN patient p ON t.patient_id_patient = v.patient_id_patient
JOIN doctor d ON v.doctor_id_doc = d.id_doc
WHERE v.diagnosis LIKE CONCAT('%%', %(diagnosis)s, '%%')
GROUP BY v.diagnosis; 