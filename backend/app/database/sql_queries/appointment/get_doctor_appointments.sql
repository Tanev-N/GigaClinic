SELECT time as appointment_time
FROM timetable
WHERE doctor_id_doc = %s 
AND admission = %s; 