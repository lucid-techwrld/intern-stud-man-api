import { Response } from 'express';
import { IPaginationMeta } from '../types/student';

export const ResponseUtil = {
  success<T>(res: Response, data: T, status = 200, meta?: IPaginationMeta) {
    return res.status(status).json({ success: true, data, ...(meta ? { meta } : {}) });
  },
  noContent(res: Response) {
    return res.status(204).send();
  },
};
