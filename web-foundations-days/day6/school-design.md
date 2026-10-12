# School Database Design

## Table Explanations
* **`students`**: Stores individual student records including their unique identifier, full name, and a unique email address.
* **`courses`**: Stores available academic courses, detailing each course's title and unique course code.
* **`enrolments`**: A junction table that connects students to courses, tracking which student is registered in which course and storing their grade.

## Relationships & Join Table Rationale
* **One-to-Many Relationships**: A single student can have multiple enrolment records, and a single course can have multiple enrolment records.
* **Many-to-Many Relationship & Join Table**: Because students can take many courses, and courses can have many students, a direct relationship is not possible in a relational database. The `enrolments` join table resolves this many-to-many relationship by breaking it down into two manageable one-to-many relationships (`students` to `enrolments`, and `courses` to `enrolments`). It also securely holds relationship-specific attributes like the student's grade.

## Database Index
* **Index on Student Email**: `CREATE INDEX idx_students_email ON students(email);`
* **Reason**: Student emails are frequently used for lookups, logins, and ensuring uniqueness. An index speeds up search queries targeting specific user accounts without needing to scan the entire table row-by-row.

## SQL vs. NoSQL Choice
For a school database system managing students, courses, and structured grades, **SQL (Relational Database)** is the ideal choice. Academic data is strictly relational, highly structured, and depends heavily on referential integrity (ensuring that grades and enrolments always point to valid, existing students and courses). SQL databases enforce schemas, unique constraints, and foreign key relationships natively, preventing orphaned records and maintaining consistent data integrity far better than a NoSQL document store would for this use case.