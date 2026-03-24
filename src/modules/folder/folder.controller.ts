import { Response, NextFunction } from 'express';
import { folderService } from './folder.service';
import { AuthenticatedRequest } from '../../types';

export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await folderService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

export const getMyFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folders = await folderService.getByUser(req.user!.id);
    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await folderService.getById(req.params.id as string);
    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await folderService.update(req.params.id as string, req.user!.id, req.body);
    res.status(200).json({ success: true, data: folder });
  } catch (error) {
    next(error);
  }
};

export const deleteFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await folderService.delete(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, message: 'Folder deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const getPublicFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    const folders = await folderService.getPublicFolders(skip, limit);
    res.status(200).json({ success: true, data: folders });
  } catch (error) {
    next(error);
  }
};
