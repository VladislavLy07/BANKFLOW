-- ЛР1, шаг 3: вернуться под администратором.
SELECT CURRENT_USER();
DROP USER 'bf_admin'@'localhost';
