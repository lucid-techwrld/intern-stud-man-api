import { NextFunction, Request, Response } from 'express';
import { AUTH } from '../constants';
import { authService } from '../modules/auth/auth.service';
import { AppError } from '../utils/AppError';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];

export const AuthMiddleware = {
  requireAuth(req: Request, _res: Response, next: NextFunction) {
    const token = req.cookies?.[AUTH.COOKIE_NAME];
    const admin = typeof token === 'string' ? authService.verify(token) : null;
    if (!admin) return next(new AppError(401, 'Please sign in to continue.'));
    req.admin = admin;
    next();
  },

  csrfGuard(req: Request, _res: Response, next: NextFunction) {
    if (SAFE_METHODS.includes(req.method)) return next();
    if (req.get('x-requested-with') !== 'fetch') return next(new AppError(403, 'This request was blocked.'));
    next();
  },
};
