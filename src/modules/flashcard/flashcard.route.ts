import { Router } from 'express';
import * as flashcardController from './flashcard.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { saveToFolderSchema, reviewSchema } from './flashcard.validation';

const router = Router();

// All flashcard routes require authentication
router.use(authMiddleware);

router.post('/save-to-folder', validate(saveToFolderSchema), flashcardController.saveToFolder);
router.get('/due', flashcardController.getDueCards);  // must be before /:id
router.get('/folder/:folderId', flashcardController.getByFolder);
router.get('/:id', flashcardController.getById);
router.patch('/:id/review', validate(reviewSchema), flashcardController.reviewFlashcard);
router.delete('/:id', flashcardController.deleteFlashcard);

export default router;
