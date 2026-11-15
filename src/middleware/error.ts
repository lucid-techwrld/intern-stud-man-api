import { NextFunction, Request, Response } from 'express';
import { PG_ERROR } from '../constants';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

export const ErrorMiddleware = {
  notFound(_req: Request, _res: Response, next: NextFunction) {
    next(new AppError(404, 'Not found'));
  },

  normalize(err: unknown): AppError {
    if (err instanceof AppError) return err;
    const e = err as { code?: string; constraint?: string; type?: string };
    if (e?.code === PG_ERROR.UNIQUE_VIOLATION) {
      return e.constraint?.includes('email')
        ? AppError.validation({ email: 'This email is already registered' })
        : new AppError(409, 'Record already exists');
    }
    if (e?.code === PG_ERROR.CHECK_VIOLATION) return new AppError(422, 'A value is outside the allowed range');
    if (e?.code === PG_ERROR.INVALID_TEXT) return AppError.badRequest('Invalid input');
    if (e?.type === 'entity.parse.failed') return AppError.badRequest('Invalid request');
    return new AppError(500, 'Something went wrong. Please try again.');
  },

  handle(err: unknown, req: Request, res: Response, _next: NextFunction) {
    const appError = ErrorMiddleware.normalize(err);
    if (appError.statusCode >= 500) logger.error('Unhandled error', { path: req.originalUrl, error: (err as Error)?.stack ?? String(err) });
    res.status(appError.statusCode).json({
      success: false,
      message: appError.message,
      ...(appError.errors ? { errors: appError.errors } : {}),
    });
  },
};
