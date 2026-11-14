-- MySQL 8, учебный локальный сервер. Не запускать на рабочем банковском сервере.
-- Шаг 1: администратор. Уникальные имена, тестовые пароли меняйте при необходимости.
CREATE DATABASE IF NOT EXISTS test;
CREATE USER 'bf_admin'@'localhost' IDENTIFIED BY 'DemoOnly_A31!';
GRANT CREATE USER ON *.* TO 'bf_admin'@'localhost';
GRANT ALL PRIVILEGES ON test.* TO 'bf_admin'@'localhost' WITH GRANT OPTION;

SELECT CURRENT_USER();
SHOW GRANTS FOR 'bf_admin'@'localhost';
