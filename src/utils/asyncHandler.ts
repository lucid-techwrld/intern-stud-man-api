import { NextFunction, Request, RequestHandler, Response } from 'express';

export const AsyncUtil = {
  wrap(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler {
    return (req, res, next) => { fn(req, res, next).catch(next); };
  },
};
