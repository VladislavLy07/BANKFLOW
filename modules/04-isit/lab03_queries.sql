-- ИСиТ, ЛР3. Все 19 основных пунктов из 3_MySQL.pdf (9+5+4+1).
-- MySQL 8; выполнять только на учебном сервере. Не использовать реальную БД банка.
-- Блок 1, п.1
CREATE DATABASE IF NOT EXISTS addressbook CHARACTER SET utf8mb4;
USE addressbook;
-- Подготовка учебной таблицы по схеме ЛР2. Удаление только в выделенной тестовой БД.
DROP TABLE IF EXISTS employee_data;
CREATE TABLE employee_data (
 emp_id INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
 f_name VARCHAR(20), l_name VARCHAR(20), title VARCHAR(30), age INT,
 yos INT, salary INT, perks INT, email VARCHAR(60)
);
-- Синтетические записи для проверки всех условий.
INSERT INTO employee_data(f_name,l_name,title,age,yos,salary,perks,email) VALUES
 ('Иван','Иванов','стажер',25,1,35000,5000,'ivan@example.test'),
 ('Карина','Куценко','клинер',40,2,25000,4000,'karina@example.test'),
 ('Серафим','Майборода','программист',32,5,95000,17000,'serafim@example.test'),
 ('Василий','Тёркин','Web-разработчик',51,3,100000,11000,'web@example.test'),
 ('Елизавета','Бурундук','бухгалтер',63,38,82000,11000,'account@example.test'),
 ('Оксана','Климова','продавец',35,7,110000,18000,'sales@example.test');
-- 1.2: сведения о структуре таблицы
DESCRIBE employee_data;
-- 1.3: перечень доступных БД
SHOW DATABASES;
-- 1.4: запись по заданию (учебные данные из методички)
INSERT INTO employee_data(f_name,l_name,title,age,yos,salary,perks,email)
VALUES ('Рудольф','Курочкин','программист',34,2,95000,17000,'rudolf@yandex.ru');
-- 1.5: два способа вывести все поля
SELECT emp_id,f_name,l_name,title,age,yos,salary,perks,email FROM employee_data;
SELECT * FROM employee_data;
-- 1.6
SELECT f_name,email FROM employee_data;
-- 1.7
SELECT salary,perks,yos FROM employee_data;
-- 1.8
SELECT COUNT(*) AS row_count FROM employee_data;
-- 1.9
SELECT salary,l_name FROM employee_data;
-- Блок 2: WHERE
SELECT emp_id FROM employee_data WHERE age>30; -- 2.1
SELECT f_name,l_name FROM employee_data WHERE title='Web-разработчик'; -- 2.2
SELECT * FROM employee_data WHERE salary<=100000; -- 2.3: зарплата <=100000
SELECT salary,perks FROM employee_data WHERE perks>16000; -- 2.4
SELECT l_name,f_name FROM employee_data WHERE title='бухгалтер'; -- 2.5
-- Блок 3: LIKE (К — кириллическая буква, исправлена опечатка в примере пособия)
SELECT f_name,l_name FROM employee_data WHERE l_name LIKE 'К%'; -- 3.1
SELECT f_name,l_name FROM employee_data WHERE title LIKE '%продавец%'; -- 3.2
SELECT f_name,l_name,salary FROM employee_data WHERE f_name LIKE '%к%'; -- 3.3
SELECT l_name,title FROM employee_data WHERE title LIKE '%программист%'; -- 3.4
-- Блок 4: средний возраст в группах по должности выше 30
SELECT title,AVG(age) AS avg_age FROM employee_data GROUP BY title HAVING AVG(age)>30;
-- Дополнительный пример удаления из методички: безопасный тест на отдельной записи.
START TRANSACTION;
INSERT INTO employee_data(f_name,l_name,title,age,yos,salary,perks,email) VALUES ('Василий','Пупкин','мультимедиа',25,2,50000,5000,'demo@example.test');
SET @delete_id=LAST_INSERT_ID();
DELETE FROM employee_data WHERE emp_id=@delete_id;
ROLLBACK;
