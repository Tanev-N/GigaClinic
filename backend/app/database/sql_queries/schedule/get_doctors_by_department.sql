SELECT d.id_doc, d.full_name, ds.day_of_week, 
       ds.start_time, ds.end_time, ds.cabinet
FROM doctor d
LEFT JOIN doctor_schedule ds ON d.id_doc = ds.doctor_id
WHERE d.department_id_dep = %s
ORDER BY d.id_doc, ds.day_of_week; 