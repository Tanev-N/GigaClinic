INSERT INTO doctor (
    department_id_dep, 
    full_name, 
    passport_data, 
    address, 
    birth, 
    specialization, 
    employment,
    user_id
) VALUES (
    %(department_id)s,
    %(full_name)s,
    %(passport_data)s,
    %(address)s,
    %(birth)s,
    %(specialization)s,
    %(employment)s,
    %(user_id)s
); 