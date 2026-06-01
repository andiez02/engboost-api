import { Router } from 'express';
import multer from 'multer';
import * as userController from './user.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { isAdmin } from '../../middlewares/isAdmin';
import { validate } from '../../middlewares/validate';
import { registerSchema, loginSchema, verifySchema, updateUserSchema } from './user.validation';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.put('/verify', validate(verifySchema), userController.verify);
router.get('/refresh-token', userController.refreshToken);
router.delete('/logout', userController.logout);

// Protected routes
router.get('/me', authMiddleware, userController.getMe);
router.get('/achievements', authMiddleware, userController.getAchievements);
router.put('/', authMiddleware, upload.single('avatar'), validate(updateUserSchema), userController.update);

// Admin routes
router.get('/admin/users', authMiddleware, isAdmin, userController.listUsers);
router.get('/admin/users/analytics', authMiddleware, isAdmin, userController.getUserAnalytics);
router.get('/admin/users/export', authMiddleware, isAdmin, userController.exportUsers);
router.put('/admin/users/:id/role', authMiddleware, isAdmin, userController.updateRole);
router.delete('/admin/users/:id', authMiddleware, isAdmin, userController.deleteUser);

export default router;
