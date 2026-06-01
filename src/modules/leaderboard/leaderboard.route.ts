import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import * as leaderboardController from './leaderboard.controller';

const router = Router();

router.get('/weekly', authMiddleware, leaderboardController.getWeeklyLeaderboard);
router.get('/level', authMiddleware, leaderboardController.getLevelLeaderboard);
router.get('/streak', authMiddleware, leaderboardController.getStreakLeaderboard);

export default router;
