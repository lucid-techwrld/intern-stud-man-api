import { z } from 'zod';
import { MIN_STUDENT_AGE, PAGINATION, STUDENT_STATUSES } from '../../constants';

const dob = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Pick a date of birth')
  .refine((v) => {
    const d = new Date(v);
    return !isNaN(d.getTime()) && d <= new Date() && (Date.now() - d.getTime()) / (365.25 * 864e5) >= MIN_STUDENT_AGE;
  }, `Student must be at least ${MIN_STUDENT_AGE} years old`);

export const createStudentSchema = z.object({
  first_name: z.string().trim().min(1, 'Enter a first name').max(80),
  last_name: z.string().trim().min(1, 'Enter a last name').max(80),
  email: z.string().trim().toLowerCase().email('Enter a valid email address').max(160),
  phone: z.string().trim().max(20, 'Phone is too long').optional().transform((v) => v || null),
  dob,
  course: z.string().trim().min(1, 'Pick a course').max(80),
  year: z.coerce.number().int().min(1).max(4).default(1),
  status: z.enum(STUDENT_STATUSES).default('Active'),
});
export const updateStudentSchema = createStudentSchema.partial();

export const listStudentsSchema = z.object({
  q: z.string().trim().optional(),
  course: z.string().trim().optional(),
  status: z.enum(STUDENT_STATUSES).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(PAGINATION.MAX_LIMIT).default(PAGINATION.DEFAULT_LIMIT),
});

export type CreateStudentDto = z.infer<typeof createStudentSchema>;
export type UpdateStudentDto = z.infer<typeof updateStudentSchema>;
export type ListStudentsQuery = z.infer<typeof listStudentsSchema>;
