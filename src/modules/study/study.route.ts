import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { reviewSchema } from './study.validation';
import * as studyController from './study.controller';

const router = Router();

router.use(authMiddleware);

router.get('/stats', studyController.getStats);       // GET /study/stats
router.get('/', studyController.getDueCards);          // GET /study?folderId=...
router.post('/review', validate(reviewSchema), studyController.reviewCard); // POST /study/review

export default router;
