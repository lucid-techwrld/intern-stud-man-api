import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StudentService } from './student.service';
import { StudentRepository } from './student.repository';
import { CacheService } from '../../utils/cache';
import { IStudent } from '../../types/student';

const sample: IStudent = { id: 1, student_code: 'STU-20260001', first_name: 'Amara', last_name: 'Okafor', email: 'amara@uni.edu', phone: null, dob: '2003-02-11', course: 'Computer Science', year: 2, status: 'Active', created_at: '', updated_at: '' };
const dto = { first_name: 'Amara', last_name: 'Okafor', email: 'amara@uni.edu', phone: null, dob: '2003-02-11', course: 'Computer Science', year: 2, status: 'Active' as const };

let repo: Record<string, ReturnType<typeof vi.fn>>;
let cache: Record<string, ReturnType<typeof vi.fn>>;
let service: StudentService;

beforeEach(() => {
  repo = { list: vi.fn(), stats: vi.fn(), findById: vi.fn(), findByEmail: vi.fn(), create: vi.fn(), update: vi.fn(), remove: vi.fn() };
  cache = { get: vi.fn().mockResolvedValue(null), set: vi.fn(), del: vi.fn() };
  service = new StudentService(repo as unknown as StudentRepository, cache as unknown as CacheService);
});

describe('StudentService', () => {
  it('creates a student and invalidates the stats cache', async () => {
    repo.findByEmail.mockResolvedValue(null); repo.create.mockResolvedValue(sample);
    expect(await service.create(dto)).toEqual(sample);
    expect(cache.del).toHaveBeenCalled();
  });
  it('rejects a duplicate email with a 422 and field error', async () => {
    repo.findByEmail.mockResolvedValue(sample);
    await expect(service.create(dto)).rejects.toMatchObject({ statusCode: 422, errors: { email: expect.any(String) } });
  });
  it('allows updating a student without tripping on their own email', async () => {
    repo.findById.mockResolvedValue(sample); repo.findByEmail.mockResolvedValue(sample); repo.update.mockResolvedValue(sample);
    await expect(service.update(1, { email: 'amara@uni.edu' })).resolves.toEqual(sample);
  });
  it('blocks changing email to one owned by someone else', async () => {
    repo.findById.mockResolvedValue(sample); repo.findByEmail.mockResolvedValue({ ...sample, id: 2 });
    await expect(service.update(1, { email: 'amara@uni.edu' })).rejects.toMatchObject({ statusCode: 422 });
  });
  it('returns 404 for a missing student', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(service.getById(99)).rejects.toMatchObject({ statusCode: 404 });
  });
  it('returns 404 when deleting a missing student', async () => {
    repo.remove.mockResolvedValue(false);
    await expect(service.remove(99)).rejects.toMatchObject({ statusCode: 404 });
  });
  it('serves stats from cache when present', async () => {
    const stats = { total: 3, active: 2, graduated: 1, courses: 2 };
    cache.get.mockResolvedValue(stats);
    expect(await service.stats()).toEqual(stats);
    expect(repo.stats).not.toHaveBeenCalled();
  });
  it('escapes LIKE wildcards in search', async () => {
    repo.list.mockResolvedValue({ rows: [], total: 0 });
    await service.list({ q: '50%_off', page: 2, limit: 6 });
    expect(repo.list).toHaveBeenCalledWith(expect.objectContaining({ q: '50\\%\\_off', offset: 6 }));
  });
});
