import { z } from 'zod';

export const reviewSchema = z.object({
  cardId: z.string().uuid('Invalid card ID'),
  rating: z.number().int().min(0).max(3),
});
