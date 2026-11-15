import { Request, Response } from 'express';
import { AppError } from '../../utils/AppError';
import { ResponseUtil } from '../../utils/response';
import { CreateStudentDto, ListStudentsQuery, UpdateStudentDto } from './student.dto';
import { StudentService, studentService } from './student.service';

export class StudentController {
  constructor(private readonly service: StudentService) {}

  private parseId(req: Request): number {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) throw AppError.badRequest('Invalid student id');
    return id;
  }

  list = async (req: Request, res: Response) => {
    const { data, meta } = await this.service.list(req.validated as ListStudentsQuery);
    ResponseUtil.success(res, data, 200, meta);
  };
  stats = async (_req: Request, res: Response) => ResponseUtil.success(res, await this.service.stats());
  getOne = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.getById(this.parseId(req)));
  create = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.create(req.validated as CreateStudentDto), 201);
  update = async (req: Request, res: Response) => ResponseUtil.success(res, await this.service.update(this.parseId(req), req.validated as UpdateStudentDto));
  remove = async (req: Request, res: Response) => { await this.service.remove(this.parseId(req)); ResponseUtil.noContent(res); };
}
export const studentController = new StudentController(studentService);
