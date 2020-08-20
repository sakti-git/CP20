CREATE table test(
id INTEGER PRIMARY KEY AUTOINCREMENT, 
string TEXT,
integer INTEGER,
float FLOAT,    
date DATE,
boolean BOOLEAN);

INSERT INTO test(string, integer, float, date, boolean) VALUES
("Logika Pemrograman", 100, "2.5", "08-08-2020", "true"), 
("Node JS", 80, "77.96", "07-06-2020", "false"), 
("Pemrograman Web", 114, "84.846382", "05-11-2020", "true");  