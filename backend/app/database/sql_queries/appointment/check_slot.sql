SELECT id_tit
FROM timetable
WHERE doctor_id_doc = %s 
AND admission = %s
AND time = %s; 