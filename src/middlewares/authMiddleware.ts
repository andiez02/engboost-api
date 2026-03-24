import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { ApiError } from '../utils/ApiError';
import { AuthenticatedRequest } from '../types';

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction
) => {
  try {
    // 1. Get token from cookie
    let accessToken = req.cookies?.accessToken;

    // 2. Fallback: get token from Authorization header
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith('Bearer ')) {
        accessToken = authHeader.split(' ')[1];
      }
    }

    // 3. No token found
    if (!accessToken) {
      throw new ApiError(401, 'Unauthorized! (Token not found)');
    }

    // 4. Verify token
    try {
      const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as {
        id: string;
        email: string;
        role: string;
      };

      // 5. Attach user info to request
      req.user = decoded;
      next();
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        throw new ApiError(410, 'Access token expired. Please refresh token.');
      }
      throw new ApiError(401, 'Unauthorized! (Invalid token)');
    }
  } catch (error) {
    next(error);
  }
};
