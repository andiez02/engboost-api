import { z } from 'zod';

const exampleSchema = z.object({
  sentence: z.string().trim().min(1, 'Example sentence is required'),
  translation: z.string().trim().optional(),
});

const senseSchema = z.object({
  definition: z.string().trim().min(1, 'Definition is required'),
  translation: z.string().trim().min(1, 'Translation is required'),
  examples: z.array(exampleSchema).default([]),
});

const flashcardItemSchema = z.object({
  headword: z.string().trim().min(1, 'Headword is required').max(200),
  pos: z.string().trim().max(200).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
  senses: z.array(senseSchema).min(1, 'At least one sense is required'),
});

export const saveToFolderSchema = z.object({
  create_new_folder: z.boolean().optional().default(false),
  folder_id: z.string().uuid('Invalid folder ID').optional(),
  folder_title: z.string().min(1, 'Folder title is required').max(100).optional(),
  flashcards: z.array(flashcardItemSchema).min(1, 'At least one flashcard is required'),
}).refine(
  (data) => {
    // If creating new folder, folder_title is required
    if (data.create_new_folder) {
      return !!data.folder_title;
    }
    // If not creating new folder, folder_id is required
    return !!data.folder_id;
  },
  {
    message: 'Either folder_id (for existing folder) or folder_title (for new folder) is required',
    path: ['folder_id'],
  }
);

export const reviewSchema = z.object({
  rating: z.number().int().min(0).max(3),
});
