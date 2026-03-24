import { z } from 'zod';

export const createFolderSchema = z.object({
  title: z.string().min(1, 'Title is required').max(30, 'Title must be at most 30 characters'),
  is_public: z.boolean().optional().default(false),
});

export const updateFolderSchema = z.object({
  title: z.string().min(1).max(30).optional(),
  is_public: z.boolean().optional(),
}).strict();
