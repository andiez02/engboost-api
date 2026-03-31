import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const isAdmin = (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return next(new ApiError(403, 'Admin access required.'));
  }
  next();
};
