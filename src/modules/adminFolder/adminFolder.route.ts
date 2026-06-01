import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { isAdmin } from '../../middlewares/isAdmin';
import * as adminFolderController from './adminFolder.controller';

const router = Router();

router.use(authMiddleware, isAdmin);

router.get('/', adminFolderController.listPublicFolders);
router.get('/flashcards', adminFolderController.listAllFlashcards);
router.delete('/flashcards/:id', adminFolderController.deleteAnyFlashcard);
router.get('/:id/flashcards', adminFolderController.getFolderFlashcards);
router.post('/', adminFolderController.createPublicFolder);
router.put('/:id', adminFolderController.updatePublicFolder);
router.delete('/:id', adminFolderController.deletePublicFolder);
router.post('/:id/flashcards', adminFolderController.addFlashcard);
router.delete('/:id/flashcards/:fcId', adminFolderController.deleteFlashcard);

// Community folders (required_level = 0)
router.get('/community', adminFolderController.listCommunityFolders);
router.post('/community', adminFolderController.createCommunityFolder);
// Reuse same flashcard endpoints for community folders
router.get('/community/:id/flashcards', adminFolderController.getFolderFlashcards);
router.post('/community/:id/flashcards', adminFolderController.addFlashcard);
router.delete('/community/:id/flashcards/:fcId', adminFolderController.deleteFlashcard);
router.put('/community/:id', adminFolderController.updatePublicFolder);
router.delete('/community/:id', adminFolderController.deletePublicFolder);

export default router;
