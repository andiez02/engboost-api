import { Response, NextFunction } from 'express';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';
import { Role } from '../utils/constants';

/**
 * Middleware to restrict access to specific roles.
 * Must be used AFTER authMiddleware.
 */
export const roleMiddleware = (...allowedRoles: Role[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Unauthorized!');
      }

      if (!allowedRoles.includes(req.user.role as Role)) {
        throw new ApiError(403, 'Forbidden! You do not have permission to access this resource.');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
