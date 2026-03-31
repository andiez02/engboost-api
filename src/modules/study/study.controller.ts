import { Response, NextFunction } from 'express';
import { studyService } from './study.service';
import { AuthenticatedRequest } from '../../types';

export const getDueCards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folderId = req.query.folderId as string | undefined;
    const session = await studyService.getSessionCards(req.user!.id, folderId);
    res.status(200).json({ success: true, data: session });
  } catch (error) {
    next(error);
  }
};

export const reviewCard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { cardId, rating } = req.body;
    const result = await studyService.reviewCard(cardId, req.user!.id, rating);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const stats = await studyService.getStats(req.user!.id);
    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
