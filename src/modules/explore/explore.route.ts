import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import * as exploreController from './explore.controller';

const router = Router();

router.use(authMiddleware);

router.get('/folders', exploreController.getExploreFolders);
router.post('/folders/:id/clone', exploreController.cloneFolder);

export default router;
