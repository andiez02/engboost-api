import { z } from 'zod';

const flashcardItemSchema = z.object({
  english: z.string().min(1, 'English is required').max(200),
  vietnamese: z.string().min(1, 'Vietnamese is required').max(200),
  object: z.string().max(200).nullable().optional(),
  image_url: z.string().url().nullable().optional(),
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
