import { Router } from 'express';
import * as userController from './user.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { registerSchema, loginSchema, verifySchema, updateUserSchema } from './user.validation';

const router = Router();

// Public routes
router.post('/register', validate(registerSchema), userController.register);
router.post('/login', validate(loginSchema), userController.login);
router.put('/verify', validate(verifySchema), userController.verify);
router.get('/refresh-token', userController.refreshToken);
router.delete('/logout', userController.logout);

// Protected routes
router.get('/me', authMiddleware, userController.getMe);
router.put('/', authMiddleware, validate(updateUserSchema), userController.update);

export default router;
