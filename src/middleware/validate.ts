import { NextFunction, Request, RequestHandler, Response } from 'express';
import { ZodError, ZodSchema } from 'zod';
import { AppError } from '../utils/AppError';

export const ValidateMiddleware = {
  fromZod(error: ZodError): Record<string, string> {
    const out: Record<string, string> = {};
    error.issues.forEach((i) => { const key = String(i.path[0] ?? 'form'); if (!out[key]) out[key] = i.message; });
    return out;
  },

  handle(schema: ZodSchema, source: 'body' | 'query'): RequestHandler {
    return (req: Request, _res: Response, next: NextFunction) => {
      const result = schema.safeParse(req[source]);
      if (!result.success) return next(AppError.validation(ValidateMiddleware.fromZod(result.error)));
      req.validated = result.data;
      next();
    };
  },
};
