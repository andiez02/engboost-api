import { z } from 'zod';

const tagsSchema = z.array(z.string().min(1).max(50)).optional();

export const createFolderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(30, 'Title must be at most 30 characters'),
  is_public: z.boolean().optional().default(false),
  tags: tagsSchema,
});

export const updateFolderSchema = z.object({
  title: z.string().min(1).max(30).optional(),
  is_public: z.boolean().optional(),
  tags: tagsSchema,
}).strict();
