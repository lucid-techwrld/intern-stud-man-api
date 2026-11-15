import { Database } from '../../db/database';
import { IStudent, IStudentStats } from '../../types/student';
import { CreateStudentDto, UpdateStudentDto } from './student.dto';

const COLS = 'id, student_code, first_name, last_name, email, phone, dob, course, year, status, created_at, updated_at';
const EDITABLE = ['first_name', 'last_name', 'email', 'phone', 'dob', 'course', 'year', 'status'] as const;

export interface IStudentFilters { q?: string; course?: string; status?: string; limit: number; offset: number }

export class StudentRepository {
  async list(f: IStudentFilters): Promise<{ rows: IStudent[]; total: number }> {
    const { rows } = await Database.query<IStudent & { total: number }>(
      `SELECT ${COLS}, COUNT(*) OVER() AS total FROM students
       WHERE ($1::text IS NULL OR (first_name || ' ' || last_name || ' ' || email || ' ' || student_code) ILIKE '%' || $1 || '%')
         AND ($2::text IS NULL OR course = $2)
         AND ($3::text IS NULL OR status = $3)
       ORDER BY created_at DESC, id DESC
       LIMIT $4 OFFSET $5`,
      [f.q ?? null, f.course ?? null, f.status ?? null, f.limit, f.offset],
    );
    return { rows: rows.map(({ total: _t, ...s }) => s as IStudent), total: rows[0]?.total ?? 0 };
  }

  async stats(): Promise<IStudentStats> {
    const [totals, byCourse] = await Promise.all([
      Database.query<Omit<IStudentStats, 'by_course'>>(
        `SELECT COUNT(*) AS total,
                COUNT(*) FILTER (WHERE status = 'Active') AS active,
                COUNT(*) FILTER (WHERE status = 'Graduated') AS graduated,
                COUNT(DISTINCT course) AS courses
         FROM students`,
      ),
      Database.query<IStudentStats['by_course'][number]>('SELECT course, COUNT(*)::int AS count FROM students GROUP BY course ORDER BY count DESC, course'),
    ]);
    return { ...totals.rows[0], by_course: byCourse.rows };
  }

  async findById(id: number): Promise<IStudent | null> {
    const { rows } = await Database.query<IStudent>(`SELECT ${COLS} FROM students WHERE id = $1`, [id]);
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<IStudent | null> {
    const { rows } = await Database.query<IStudent>(`SELECT ${COLS} FROM students WHERE email = $1`, [email]);
    return rows[0] ?? null;
  }

  async create(d: CreateStudentDto): Promise<IStudent> {
    const { rows } = await Database.query<IStudent>(
      `INSERT INTO students (student_code, first_name, last_name, email, phone, dob, course, year, status)
       VALUES ('STU-' || to_char(now(), 'YYYY') || lpad(nextval('student_code_seq')::text, 4, '0'), $1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING ${COLS}`,
      [d.first_name, d.last_name, d.email, d.phone, d.dob, d.course, d.year, d.status],
    );
    return rows[0];
  }

  async update(id: number, d: UpdateStudentDto): Promise<IStudent | null> {
    const entries = EDITABLE.filter((k) => d[k] !== undefined);
    if (!entries.length) return this.findById(id);
    const sets = entries.map((k, i) => `${k} = $${i + 1}`).join(', ');
    const { rows } = await Database.query<IStudent>(
      `UPDATE students SET ${sets}, updated_at = now() WHERE id = $${entries.length + 1} RETURNING ${COLS}`,
      [...entries.map((k) => d[k]), id],
    );
    return rows[0] ?? null;
  }

  async remove(id: number): Promise<boolean> {
    const res = await Database.query('DELETE FROM students WHERE id = $1', [id]);
    return (res.rowCount ?? 0) > 0;
  }
}
export const studentRepository = new StudentRepository();
