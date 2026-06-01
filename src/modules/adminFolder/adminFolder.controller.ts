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

export const addFlashcard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const fc = await adminFolderService.addFlashcard(req.params.id as string, req.user!.id, req.body);
    res.status(201).json({ success: true, data: fc });
  } catch (error) { next(error); }
};

export const deleteFlashcard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminFolderService.deleteFlashcard(req.params.id as string, req.params.fcId as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const listAllFlashcards = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || '';
    const hasImage = req.query.hasImage === 'true';
    const source = (req.query.source as string) || '';
    const folderType = (req.query.folderType as string) || '';
    const owner = (req.query.owner as string) || '';
    const folderName = (req.query.folderName as string) || '';
    const result = await adminFolderService.listAllFlashcards(page, limit, search, hasImage, {
      source,
      folderType,
      owner,
      folderName,
    });
    res.status(200).json({ success: true, ...result });
  } catch (error) { next(error); }
};

export const deleteAnyFlashcard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await adminFolderService.deleteAnyFlashcard(req.params.id as string);
    res.status(200).json({ success: true, data: result });
  } catch (error) { next(error); }
};

export const listCommunityFolders = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folders = await adminFolderService.listCommunityFolders();
    res.status(200).json({ success: true, data: folders });
  } catch (error) { next(error); }
};

export const createCommunityFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const folder = await adminFolderService.createCommunityFolder(req.body, req.user!.id);
    res.status(201).json({ success: true, data: folder });
  } catch (error) { next(error); }
};
