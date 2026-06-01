import { Router } from 'express';
import { chatbotController } from './chatbot.controller';
import { authMiddleware } from '../../middlewares/authMiddleware';

const router = Router();

// Endpoint: POST /api/chatbot/chat
router.post('/chat', authMiddleware, chatbotController.chat);

export default router;
