PRAGMA foreign_keys=ON;
CREATE TABLE clients(id INTEGER PRIMARY KEY, name TEXT NOT NULL, segment TEXT NOT NULL, city TEXT NOT NULL);
CREATE TABLE employees(id INTEGER PRIMARY KEY, name TEXT NOT NULL, role TEXT NOT NULL, age INTEGER, experience INTEGER, salary INTEGER);
CREATE TABLE products(id INTEGER PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL);
CREATE TABLE requests(id INTEGER PRIMARY KEY, client_id INTEGER NOT NULL REFERENCES clients(id), employee_id INTEGER NOT NULL REFERENCES employees(id), product_id INTEGER NOT NULL REFERENCES products(id), category TEXT, date TEXT, hours REAL CHECK(hours>=0), status TEXT, priority TEXT);
CREATE INDEX idx_clients_name ON clients(name);
CREATE INDEX idx_requests_client ON requests(client_id);
