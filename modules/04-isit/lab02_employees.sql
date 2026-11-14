CREATE DATABASE IF NOT EXISTS bankflow_lab2;
USE bankflow_lab2;
DROP TABLE IF EXISTS employee_lab;
CREATE TABLE employee_lab(id INT PRIMARY KEY AUTO_INCREMENT, first_name VARCHAR(50), last_name VARCHAR(50));
INSERT INTO employee_lab(first_name,last_name) VALUES ('Anna','Orlova'),('Ivan','Belov'),('Maria','Kuznetsova'),('Pavel','Krylov');
ALTER TABLE employee_lab ADD age INT, ADD position VARCHAR(50), ADD experience INT, ADD salary DECIMAL(10,2);
UPDATE employee_lab SET age=25+id, position='Manager', experience=id, salary=50000+id*2500 WHERE id BETWEEN 1 AND 4;
UPDATE employee_lab SET position='Senior Manager',salary=72000 WHERE id IN (1,3);
SELECT * FROM employee_lab ORDER BY id;
