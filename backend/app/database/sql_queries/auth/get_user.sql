SELECT u.id_user, u.password_hash, u.role_id, r.name as role_name
FROM user u
JOIN role r ON u.role_id = r.id_role
WHERE u.login = %s; 