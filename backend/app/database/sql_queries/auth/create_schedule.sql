INSERT INTO doctor_schedule 
(doctor_id, day_of_week, start_time, end_time, cabinet) 
VALUES (
    %(doctor_id)s,
    %(day_of_week)s,
    %(start_time)s,
    %(end_time)s,
    %(cabinet)s
); 