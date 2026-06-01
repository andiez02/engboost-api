import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import {
  getWeeklyLeaderboard as getWeeklyLeaderboardService,
  getLevelLeaderboard as getLevelLeaderboardService,
  getStreakLeaderboard as getStreakLeaderboardService,
} from './leaderboard.service';

export const getWeeklyLeaderboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getWeeklyLeaderboardService(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getLevelLeaderboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getLevelLeaderboardService(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getStreakLeaderboard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await getStreakLeaderboardService(req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
