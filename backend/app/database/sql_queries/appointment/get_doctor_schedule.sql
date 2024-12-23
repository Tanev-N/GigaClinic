SELECT ds.start_time, ds.end_time
FROM doctor_schedule ds
WHERE ds.doctor_id = %s 
AND ds.day_of_week = %s; 