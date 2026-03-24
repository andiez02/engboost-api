import { Router } from 'express';
import * as folderController from './folder.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { createFolderSchema, updateFolderSchema } from './folder.validation';

const router = Router();

// All folder routes require authentication
router.use(authMiddleware);

router.post('/', validate(createFolderSchema), folderController.create);
router.get('/', folderController.getMyFolders);
router.get('/public', folderController.getPublicFolders);
router.get('/:id', folderController.getById);
router.put('/:id', validate(updateFolderSchema), folderController.update);
router.delete('/:id', folderController.deleteFolder);

export default router;
