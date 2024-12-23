SELECT 
    t.id_tit as id,
    t.admission as date,
    t.time,
    t.appearance,
    d.full_name as doctor_name,
    c.type as cabinet_type,
    c.id_cab as cabinet_number
FROM timetable t
JOIN doctor d ON t.doctor_id_doc = d.id_doc
JOIN cabinet c ON t.cabinet_id_cab = c.id_cab
JOIN patient p ON t.patient_id_patient = p.id_patient
WHERE p.user_id = %s
ORDER BY t.admission DESC, t.time DESC; 