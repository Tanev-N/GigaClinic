DELETE FROM timetable 
WHERE id_tit = %s 
AND patient_id_patient = (
    SELECT id_patient 
    FROM patient 
    WHERE user_id = %s
); 