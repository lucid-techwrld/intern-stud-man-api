import { Router } from 'express';
import { ValidateMiddleware } from '../../middleware/validate';
import { AsyncUtil } from '../../utils/asyncHandler';
import { createStudentSchema, listStudentsSchema, updateStudentSchema } from './student.dto';
import { studentController as c } from './student.controller';

const router = Router();
router.get('/', ValidateMiddleware.handle(listStudentsSchema, 'query'), AsyncUtil.wrap(c.list));
router.get('/stats', AsyncUtil.wrap(c.stats));
router.get('/:id', AsyncUtil.wrap(c.getOne));
router.post('/', ValidateMiddleware.handle(createStudentSchema, 'body'), AsyncUtil.wrap(c.create));
router.put('/:id', ValidateMiddleware.handle(updateStudentSchema, 'body'), AsyncUtil.wrap(c.update));
router.delete('/:id', AsyncUtil.wrap(c.remove));
export { router as studentRoutes };
