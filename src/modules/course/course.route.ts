import { Router } from 'express';
import * as courseController from './course.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { createCourseSchema, updateCourseSchema } from './course.validation';
import { roleMiddleware } from '../../middlewares/roleMiddleware';
import { ROLES } from '../../utils/constants';

const router = Router();

// Public routes
router.get('/public', courseController.getPublic);

// Protected routes
router.use(authMiddleware);

router.get('/', courseController.getAll);
router.get('/registered', courseController.getMyRegistered);
router.get('/:id', courseController.getById);
router.post('/:id/register', courseController.registerCourse);

// Admin-only routes
router.post('/', roleMiddleware(ROLES.ADMIN), validate(createCourseSchema), courseController.create);
router.put('/:id', roleMiddleware(ROLES.ADMIN), validate(updateCourseSchema), courseController.updateCourse);
router.delete('/:id', roleMiddleware(ROLES.ADMIN), courseController.deleteCourse);

export default router;
