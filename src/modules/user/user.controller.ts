import { Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { userService } from './user.service';
import { AuthenticatedRequest } from '../../types';
import { isProduction } from '../../config/environment';
import { JwtProvider } from '../../utils/jwtProvider';
import { env } from '../../config/environment';
import { User } from '../../models';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.register(req.body);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const verify = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await userService.verify(req.body);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { accessToken, refreshToken, user } = await userService.login(req.body);

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      maxAge: 15 * 24 * 60 * 60 * 1000, // 15 days
    };

    res.cookie('accessToken', accessToken, { ...cookieOptions, maxAge: 60 * 60 * 1000 }); // 1h
    res.cookie('refreshToken', refreshToken, cookieOptions);

    res.status(200).json({ success: true, data: { accessToken, refreshToken, user } });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clearOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
    };
    res.clearCookie('accessToken', clearOptions);
    res.clearCookie('refreshToken', clearOptions);
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token not found.' });
      return;
    }

    const decoded = JwtProvider.verifyToken(token, env.REFRESH_TOKEN_SECRET);
    const user = await User.findByPk(decoded.id);
    if (!user) {
      res.status(401).json({ success: false, message: 'User not found.' });
      return;
    }

    const tokenPayload = { id: user.id, email: user.email, role: user.role };
    const newAccessToken = JwtProvider.generateAccessToken(tokenPayload);

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ('none' as const) : ('lax' as const),
      maxAge: 60 * 60 * 1000,
    });

    res.status(200).json({ success: true, data: { accessToken: newAccessToken } });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await userService.getById(req.user!.id);
    res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const getAchievements = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const achievements = await userService.getAchievements(req.user!.id);
    res.status(200).json({ success: true, data: achievements });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const avatarFile = (req as any).file as Express.Multer.File | undefined;
    const result = await userService.update(req.user!.id, req.body, avatarFile);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

// ─── Admin controllers ────────────────────────────────────────────────────────

export const listUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = (req.query.search as string) || '';
    const role = (req.query.role as string) || '';
    const isActiveParam = req.query.isActive as string | undefined;
    const minLevelParam = req.query.minLevel as string | undefined;
    const inactiveDaysParam = req.query.inactiveDays as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const isActive =
      isActiveParam === undefined || isActiveParam === ''
        ? undefined
        : isActiveParam === 'true';
    const minLevel = minLevelParam ? parseInt(minLevelParam, 10) : undefined;
    const inactiveDays = inactiveDaysParam ? parseInt(inactiveDaysParam, 10) : undefined;

    const result = await userService.listUsers(page, limit, {
      search,
      role,
      isActive,
      minLevel,
      inactiveDays,
      sortBy,
      sortOrder,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const exportUsers = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const search = (req.query.search as string) || '';
    const role = (req.query.role as string) || '';
    const isActiveParam = req.query.isActive as string | undefined;
    const minLevelParam = req.query.minLevel as string | undefined;
    const inactiveDaysParam = req.query.inactiveDays as string | undefined;
    const sortBy = (req.query.sortBy as string) || 'createdAt';
    const sortOrder = (req.query.sortOrder as string) || 'desc';

    const isActive =
      isActiveParam === undefined || isActiveParam === ''
        ? undefined
        : isActiveParam === 'true';
    const minLevel = minLevelParam ? parseInt(minLevelParam, 10) : undefined;
    const inactiveDays = inactiveDaysParam ? parseInt(inactiveDaysParam, 10) : undefined;

    const { buffer, filename } = await userService.exportUsers({
      search,
      role,
      isActive,
      minLevel,
      inactiveDays,
      sortBy,
      sortOrder,
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(buffer);
  } catch (error) {
    next(error);
  }
};

export const getUserAnalytics = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const rangeParam = parseInt((req.query.range as string) || '30', 10);
    const range = [7, 30, 90].includes(rangeParam) ? rangeParam : 30;
    const result = await userService.getUserAnalytics(range);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await userService.updateRole(req.params.id as string, req.body.role);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await userService.deleteUser(req.params.id as string);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
