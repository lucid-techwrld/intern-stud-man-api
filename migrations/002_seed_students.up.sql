INSERT INTO students (student_code, first_name, last_name, email, phone, dob, course, year, status)
SELECT 'STU-' || to_char(now(),'YYYY') || lpad(nextval('student_code_seq')::text, 4, '0'), v.*
FROM (VALUES
  ('Amara','Okafor','amara.okafor@seed.edu','08031000001','2003-02-11'::date,'Computer Science',2,'Active'),
  ('Tunde','Bello','tunde.bello@seed.edu','08031000002','2002-07-19'::date,'Software Engineering',3,'Active'),
  ('Zainab','Musa','zainab.musa@seed.edu','08031000003','2003-11-02'::date,'Data Science',1,'Active'),
  ('Chidi','Eze','chidi.eze@seed.edu','08031000004','2001-05-27'::date,'Computer Science',4,'Graduated'),
  ('Fatima','Yusuf','fatima.yusuf@seed.edu','08031000005','2003-09-14'::date,'Business Admin',2,'Deferred'),
  ('Ife','Adeyemi','ife.adeyemi@seed.edu','08031000006','2002-01-30'::date,'Electrical Eng.',3,'Suspended')
) AS v(first_name,last_name,email,phone,dob,course,year,status);
