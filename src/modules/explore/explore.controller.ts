import { Response, NextFunction } from 'express';
import { exploreService } from './explore.service';
import { AuthenticatedRequest } from '../../types';
import { User } from '../../models';

export const getExploreFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id, { attributes: ['level'] });
    const userLevel = user?.level ?? 1;
    const folders = await exploreService.getExploreFolders(req.user!.id, userLevel);
    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};

export const cloneFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByPk(req.user!.id, { attributes: ['level'] });
    const userLevel = user?.level ?? 1;
    const folder = await exploreService.cloneFolder(req.params.id as string, req.user!.id, userLevel);
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

export const getCommunityFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folders = await exploreService.getCommunityFolders(req.user!.id);
    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};

export const cloneCommunityFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await exploreService.cloneCommunityFolder(req.params.id as string, req.user!.id);
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};
