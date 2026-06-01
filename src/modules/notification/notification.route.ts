import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();

// All notification routes require authentication
router.use(authMiddleware);

router.get('/', notificationController.getNotifications);
router.patch('/read-all', notificationController.markAllAsRead);
router.patch('/:id/read', notificationController.markAsRead);

export default router;
