import { z } from 'zod';

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  description: z.string().max(5000).optional().default(''),
  video_url: z.string().min(1, 'Video URL is required'),
  video_duration: z.number().optional().default(0),
  video_format: z.string().optional().default(''),
  video_public_id: z.string().optional().default(''),
  thumbnail_url: z.string().optional().default(''),
  thumbnail_public_id: z.string().optional().default(''),
  is_public: z.boolean().optional().default(false),
});

export const updateCourseSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(5000).optional(),
  video_url: z.string().optional(),
  video_duration: z.number().optional(),
  video_format: z.string().optional(),
  video_public_id: z.string().optional(),
  thumbnail_url: z.string().optional(),
  thumbnail_public_id: z.string().optional(),
  is_public: z.boolean().optional(),
}).strict();
