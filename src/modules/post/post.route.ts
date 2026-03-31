import { Router } from 'express';
import * as postController from './post.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { optionalAuthMiddleware } from '../../middlewares/optionalAuthMiddleware';
import { validate } from '../../middlewares/validate';
import { createPostSchema, getFeedSchema } from './post.validation';

const router = Router();

router.get('/', optionalAuthMiddleware, validate(getFeedSchema, 'query'), postController.getFeed);
router.post('/', authMiddleware, validate(createPostSchema), postController.createPost);
router.post('/:id/like', authMiddleware, postController.likePost);
router.delete('/:id/like', authMiddleware, postController.unlikePost);
router.post('/:id/save', authMiddleware, postController.savePost);
router.delete('/:id', authMiddleware, postController.deletePost);

export default router;
