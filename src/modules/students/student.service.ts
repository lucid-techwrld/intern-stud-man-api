import { CACHE } from '../../constants';
import { IPaginationMeta, IStudent, IStudentStats } from '../../types/student';
import { AppError } from '../../utils/AppError';
import { CacheService, cacheService } from '../../utils/cache';
import { CreateStudentDto, ListStudentsQuery, UpdateStudentDto } from './student.dto';
import { StudentRepository, studentRepository } from './student.repository';

export class StudentService {
  constructor(private readonly repo: StudentRepository, private readonly cache: CacheService) {}

  private escapeLike(s: string) { return s.replace(/[\\%_]/g, '\\$&'); }

  private async assertEmailFree(email: string, ownId?: number) {
    const existing = await this.repo.findByEmail(email);
    if (existing && existing.id !== ownId) throw AppError.validation({ email: 'This email is already registered' });
  }

  async list(q: ListStudentsQuery): Promise<{ data: IStudent[]; meta: IPaginationMeta }> {
    const { rows, total } = await this.repo.list({
      q: q.q ? this.escapeLike(q.q) : undefined,
      course: q.course || undefined,
      status: q.status,
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
    });
    return { data: rows, meta: { page: q.page, limit: q.limit, total } };
  }

  async stats(): Promise<IStudentStats> {
    const cached = await this.cache.get<IStudentStats>(CACHE.STATS_KEY);
    if (cached) return cached;
    const fresh = await this.repo.stats();
    await this.cache.set(CACHE.STATS_KEY, fresh, CACHE.STATS_TTL_SECONDS);
    return fresh;
  }

  async getById(id: number): Promise<IStudent> {
    const student = await this.repo.findById(id);
    if (!student) throw AppError.notFound('Student not found');
    return student;
  }

  async create(dto: CreateStudentDto): Promise<IStudent> {
    await this.assertEmailFree(dto.email);
    const student = await this.repo.create(dto);
    await this.cache.del(CACHE.STATS_KEY);
    return student;
  }

  async update(id: number, dto: UpdateStudentDto): Promise<IStudent> {
    await this.getById(id);
    if (dto.email) await this.assertEmailFree(dto.email, id);
    const student = await this.repo.update(id, dto);
    if (!student) throw AppError.notFound('Student not found');
    await this.cache.del(CACHE.STATS_KEY);
    return student;
  }

  async remove(id: number): Promise<void> {
    if (!(await this.repo.remove(id))) throw AppError.notFound('Student not found');
    await this.cache.del(CACHE.STATS_KEY);
  }
}
export const studentService = new StudentService(studentRepository, cacheService);
