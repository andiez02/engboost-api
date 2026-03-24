import { Response, NextFunction } from 'express';
import { flashcardService } from './flashcard.service';
import { AuthenticatedRequest } from '../../types';

export const saveToFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { create_new_folder, folder_id, folder_title, flashcards } = req.body;
    const result = await flashcardService.saveToFolder(
      create_new_folder || false,
      folder_id,
      folder_title,
      req.user!.id,
      flashcards
    );
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getByFolder = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const limit = parseInt(req.query.limit as string) || 100;
    const flashcards = await flashcardService.getByFolder(req.params.folderId as string, skip, limit);
    res.status(200).json({ success: true, data: flashcards });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const flashcard = await flashcardService.getById(req.params.id as string);
    res.status(200).json({ success: true, data: flashcard });
  } catch (error) {
    next(error);
  }
};

export const deleteFlashcard = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await flashcardService.delete(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, message: 'Flashcard deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
