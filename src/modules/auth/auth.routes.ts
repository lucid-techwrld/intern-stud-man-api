import { Router } from 'express';
import { AuthMiddleware } from '../../middleware/auth';
import { ValidateMiddleware } from '../../middleware/validate';
import { AsyncUtil } from '../../utils/asyncHandler';
import { loginSchema } from './auth.dto';
import { authController as c } from './auth.controller';

const router = Router();
router.post('/login', ValidateMiddleware.handle(loginSchema, 'body'), AsyncUtil.wrap(c.login));
router.post('/logout', c.logout);
router.get('/me', AuthMiddleware.requireAuth, c.me);
export { router as authRoutes };
