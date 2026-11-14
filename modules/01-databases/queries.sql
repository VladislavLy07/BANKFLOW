-- Выполняется в SQLite; запросы также совместимы с MySQL после USE bankflow.
SELECT * FROM clients WHERE name LIKE '%Орлова%' ORDER BY name;
SELECT r.id,c.name,r.category,r.status FROM requests r JOIN clients c ON r.client_id=c.id ORDER BY r.id LIMIT 20;
SELECT category,COUNT(*) AS total,ROUND(AVG(hours),2) AS avg_hours FROM requests GROUP BY category HAVING COUNT(*)>0 ORDER BY total DESC;
SELECT e.name,COUNT(r.id) AS workload FROM employees e LEFT JOIN requests r ON r.employee_id=e.id GROUP BY e.id,e.name ORDER BY workload DESC;
