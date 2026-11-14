-- MySQL 8, учебный локальный сервер. Не запускать на рабочем банковском сервере.
-- Шаг 1: администратор. Уникальные имена, тестовые пароли меняйте при необходимости.
CREATE DATABASE IF NOT EXISTS test;
CREATE USER 'bf_admin'@'localhost' IDENTIFIED BY 'DemoOnly_A31!';
GRANT CREATE USER ON *.* TO 'bf_admin'@'localhost';
GRANT ALL PRIVILEGES ON test.* TO 'bf_admin'@'localhost' WITH GRANT OPTION;
-- Шаг 2: войти как bf_admin, выполнить следующие команды отдельно.
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
-- Шаг 3: снова администратор, удалить созданную учебную учётную запись.
DROP USER 'bf_admin'@'localhost';
