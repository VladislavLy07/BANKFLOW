-- ЛР1, шаг 2: подключиться под bf_admin@localhost.
SELECT CURRENT_USER();
CREATE USER 'bf_reader'@'localhost' IDENTIFIED BY 'DemoOnly_R31!';
CREATE USER 'bf_operator'@'localhost' IDENTIFIED BY 'DemoOnly_O31!';
GRANT ALL PRIVILEGES ON test.* TO 'bf_reader'@'localhost';
GRANT ALL PRIVILEGES ON test.* TO 'bf_operator'@'localhost';
REVOKE INSERT ON test.* FROM 'bf_operator'@'localhost';
RENAME USER 'bf_operator'@'localhost' TO 'RenamedUser'@'localhost';
SHOW GRANTS FOR 'bf_reader'@'localhost';
SHOW GRANTS FOR 'RenamedUser'@'localhost';
-- Сделать скриншоты фактического исполнения; далее очистка.
REVOKE ALL PRIVILEGES, GRANT OPTION FROM 'bf_reader'@'localhost', 'RenamedUser'@'localhost';
DROP USER 'bf_reader'@'localhost', 'RenamedUser'@'localhost';
