CREATE SEQUENCE student_code_seq START 1;

CREATE TABLE students (
  id           BIGSERIAL PRIMARY KEY,
  student_code VARCHAR(20) UNIQUE NOT NULL,
  first_name   VARCHAR(80) NOT NULL,
  last_name    VARCHAR(80) NOT NULL,
  email        VARCHAR(160) UNIQUE NOT NULL,
  phone        VARCHAR(20),
  dob          DATE NOT NULL,
  course       VARCHAR(80) NOT NULL,
  year         SMALLINT NOT NULL DEFAULT 1 CHECK (year BETWEEN 1 AND 4),
  status       VARCHAR(12) NOT NULL DEFAULT 'Active'
               CHECK (status IN ('Active','Graduated','Suspended','Deferred')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_students_course_status ON students (course, status);
CREATE INDEX idx_students_created_at ON students (created_at DESC);
