SELECT id_cab 
FROM cabinet 
WHERE department_id_dep = (
    SELECT department_id_dep 
    FROM doctor 
    WHERE id_doc = %s
) 
LIMIT 1; 