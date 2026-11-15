import { STUDENT_STATUSES } from '../constants';

export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export interface IStudent {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  dob: string;
  course: string;
  year: number;
  status: StudentStatus;
  created_at: string;
  updated_at: string;
}

export interface IStudentStats { total: number; active: number; graduated: number; courses: number; by_course: { course: string; count: number }[] }
export interface IPaginationMeta { page: number; limit: number; total: number }
