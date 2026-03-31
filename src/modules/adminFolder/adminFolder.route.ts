import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { isAdmin } from '../../middlewares/isAdmin';
import * as adminFolderController from './adminFolder.controller';

const router = Router();

router.use(authMiddleware, isAdmin);

router.get('/', adminFolderController.listPublicFolders);
router.get('/:id/flashcards', adminFolderController.getFolderFlashcards);
router.post('/', adminFolderController.createPublicFolder);
router.put('/:id', adminFolderController.updatePublicFolder);
router.delete('/:id', adminFolderController.deletePublicFolder);

export default router;
