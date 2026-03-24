import { Router } from 'express';
import * as flashcardController from './flashcard.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { saveToFolderSchema } from './flashcard.validation';

const router = Router();

// All flashcard routes require authentication
router.use(authMiddleware);

router.post('/save-to-folder', validate(saveToFolderSchema), flashcardController.saveToFolder);
router.get('/folder/:folderId', flashcardController.getByFolder);
router.get('/:id', flashcardController.getById);
router.delete('/:id', flashcardController.deleteFlashcard);

export default router;
