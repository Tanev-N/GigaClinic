INSERT INTO `user` (login, password_hash, role_id)
VALUES (%s, %s, 2);

INSERT INTO `patient` (user_id)
VALUES (LAST_INSERT_ID()); 