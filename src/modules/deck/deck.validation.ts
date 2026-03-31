import { z } from 'zod';

export const generateDeckSchema = z.object({
  topic: z.string().min(1).max(100),
  level: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner'),
  count: z.number().int().min(5).max(50).default(10),
});
