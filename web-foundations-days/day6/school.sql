-- Drop tables if they already exist to allow clean re-runs in playgrounds
DROP TABLE IF EXISTS enrolments;
DROP TABLE IF EXISTS courses;
DROP TABLE IF EXISTS students;

-- Create students table
CREATE TABLE students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
);

-- Create courses table
CREATE TABLE courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    code TEXT NOT NULL UNIQUE
);

-- Create enrolments join table with a unique constraint to prevent duplicate enrolments
CREATE TABLE enrolments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    course_id INTEGER NOT NULL,
    grade TEXT,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    UNIQUE(student_id, course_id)
);

-- Insert students (Alice and Bob have enrolments, Charlie has none)
INSERT INTO students (name, email) VALUES 
('Alice Smith', 'alice@school.edu'),
('Bob Jones', 'bob@school.edu'),
('Charlie Brown', 'charlie@school.edu');

-- Insert courses
INSERT INTO courses (title, code) VALUES 
('Database Systems', 'CS101'),
('Web Foundations', 'CS102'),
('Python Programming', 'CS103');

-- Insert 5 enrolments
INSERT INTO enrolments (student_id, course_id, grade) VALUES 
(1, 1, 'A'),
(1, 2, 'B+'),
(2, 1, 'B'),
(2, 3, 'A-'),
(1, 3, 'A');

-- 1. All courses for one student (by name, e.g., 'Alice Smith')
SELECT c.title, c.code, e.grade 
FROM courses c
JOIN enrolments e ON c.id = e.course_id
JOIN students s ON e.student_id = s.id
WHERE s.name = 'Alice Smith';

-- 2. All students on one course (e.g., 'Database Systems')
SELECT s.name, s.email, e.grade 
FROM students s
JOIN enrolments e ON s.id = e.student_id
JOIN courses c ON e.course_id = c.id
WHERE c.title = 'Database Systems';

-- 3. The number of students per course
SELECT c.title, c.code, COUNT(e.student_id) AS student_count
FROM courses c
LEFT JOIN enrolments e ON c.id = e.course_id
GROUP BY c.id;

-- 4. Students who have no enrolments (using LEFT JOIN)
SELECT s.name, s.email
FROM students s
LEFT JOIN enrolments e ON s.id = e.student_id
WHERE e.id IS NULL;

-- 5. Update one enrolment's grade
UPDATE enrolments 
SET grade = 'A+' 
WHERE student_id = 1 AND course_id = 1;