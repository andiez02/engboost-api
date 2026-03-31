import { Router } from 'express';
import { authMiddleware } from '../../middlewares/authMiddleware';
import { validate } from '../../middlewares/validate';
import { generateDeckSchema } from './deck.validation';
import { generateDeck } from './deck.controller';

const router = Router();

router.use(authMiddleware);

router.post('/generate', validate(generateDeckSchema), generateDeck);

export default router;
