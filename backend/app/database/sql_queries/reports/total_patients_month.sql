SELECT 
    COUNT(DISTINCT v.patient_id_patient) as total_patients,
    DATE_FORMAT(v.date, '%Y-%m') as month,
    GROUP_CONCAT(
        DISTINCT CONCAT(
            (SELECT passport_data FROM patient WHERE id_patient = v.patient_id_patient), ' (',
            (SELECT full_name FROM doctor WHERE id_doc = v.doctor_id_doc), ', ',
            DATE_FORMAT(v.date, '%d.%m.%Y'), ' ',
            TIME_FORMAT(v.time, '%H:%i'),
            ')'
        ) ORDER BY v.date, v.time
        SEPARATOR ', '
    ) as patient_details
FROM visiting v
WHERE 
    YEAR(v.date) = %(year)s
    AND MONTH(v.date) = %(month)s
GROUP BY DATE_FORMAT(v.date, '%Y-%m');