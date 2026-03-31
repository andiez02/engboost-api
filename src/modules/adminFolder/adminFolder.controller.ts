import { Response, NextFunction } from 'express';
import { adminFolderService } from './adminFolder.service';
import { AuthenticatedRequest } from '../../types';

export const listPublicFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folders = await adminFolderService.listPublicFolders();
    res.status(200).json({ success: true, data: folders });
  } catch (error) { next(error); }
};

export const createPublicFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await adminFolderService.createPublicFolder(req.body, req.user!.id);
    res.status(201).json({ success: true, data: folder });
  } catch (error) { next(error); }
};

export const updatePublicFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await adminFolderService.updatePublicFolder(req.params.id as string, req.body);
    res.status(200).json({ success: true, data: folder });
  } catch (error) { next(error); }
};

export const deletePublicFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminFolderService.deletePublicFolder(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const getFolderFlashcards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const flashcards = await adminFolderService.getFolderFlashcards(req.params.id as string);
    res.status(200).json({ success: true, data: flashcards });
  } catch (error) { next(error); }
};
