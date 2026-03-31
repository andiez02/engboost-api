import { Response, NextFunction } from 'express';
import { deckService } from './deck.service';
import { AuthenticatedRequest } from '../../types';

export const generateDeck = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { topic, level, count } = req.body;
    const result = await deckService.generateDeck(req.user!.id, topic, level, count);
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
