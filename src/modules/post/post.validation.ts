import { z } from 'zod';

export const createPostSchema = z.object({
  folderId: z.string().uuid(),
  content: z.string().max(500).optional(),
});

export const getFeedSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().datetime().optional(),
  sort: z.enum(['newest', 'trending']).optional(),
  offset: z.coerce.number().int().min(0).max(10000).optional(),
  tag: z.preprocess(
    (v) => {
      if (v === undefined || v === null || v === '') return undefined;
      const s = String(v).trim();
      return s === '' ? undefined : s;
    },
    z.string().min(1).max(50).optional()
  ),
});

export const getPostByIdParamsSchema = z.object({
  id: z.string().uuid(),
});
