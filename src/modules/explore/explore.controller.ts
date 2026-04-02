import { Response, NextFunction } from 'express';
import { exploreService } from './explore.service';
import { AuthenticatedRequest } from '../../types';

export const getExploreFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userLevel = req.user?.level ?? 1;
    const folders = await exploreService.getExploreFolders(userLevel);
    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};

export const cloneFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const userLevel = req.user?.level ?? 1;
    const folder = await exploreService.cloneFolder(req.params.id as string, req.user!.id, userLevel);
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};
