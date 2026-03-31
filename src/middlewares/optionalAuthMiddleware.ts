import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/environment';
import { AuthenticatedRequest } from '../types';

export const optionalAuthMiddleware = (
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

    // 3. No token — pass through silently
    if (!accessToken) {
      return next();
    }

    // 4. Verify token — any failure passes through silently
    try {
      const decoded = jwt.verify(accessToken, env.ACCESS_TOKEN_SECRET) as {
        id: string;
        email: string;
        role: string;
      };
      req.user = decoded;
    } catch {
      // Invalid or expired token — ignore and continue
    }

    next();
  } catch {
    // Unexpected error — never throw, just continue
    next();
  }
};
