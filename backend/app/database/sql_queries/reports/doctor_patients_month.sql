SELECT 
    d.full_name as doctor_name,
    COUNT(DISTINCT v.patient_id_patient) as patient_count,
    DATE_FORMAT(v.date, '%Y-%m') as month,
    GROUP_CONCAT(
        DISTINCT CONCAT(
            p.passport_data, ' (',
            DATE_FORMAT(v.date, '%d.%m.%Y'), ' ',
            TIME_FORMAT(v.time, '%H:%i'),
            ')'
        ) ORDER BY v.date, v.time
        SEPARATOR ', '
    ) as patient_details
FROM visiting v
JOIN doctor d ON d.id_doc = v.doctor_id_doc
JOIN patient p ON p.id_patient = v.patient_id_patient
WHERE 
    d.id_doc = %(doctor_id)s
    AND YEAR(v.date) = %(year)s
    AND MONTH(v.date) = %(month)s
GROUP BY d.id_doc, DATE_FORMAT(v.date, '%Y-%m'); 