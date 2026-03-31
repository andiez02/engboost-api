import { z } from 'zod';

export const createPostSchema = z.object({
  folderId: z.string().uuid(),
  content: z.string().max(500).optional(),
});

export const getFeedSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().datetime().optional(),
});
