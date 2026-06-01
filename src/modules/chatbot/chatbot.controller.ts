import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../types';
import { chatbotService } from './chatbot.service';

class ChatbotController {
  async chat(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { message } = req.body;

      if (!message || typeof message !== 'string') {
        res.status(400).json({ success: false, message: 'Message is required' });
        return;
      }

      const reply = await chatbotService.generateReply(message);

      res.json({
        success: true,
        reply: reply,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const chatbotController = new ChatbotController();
