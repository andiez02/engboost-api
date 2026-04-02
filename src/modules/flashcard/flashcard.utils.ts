import { z } from 'zod';

import { ApiError } from '../../utils/ApiError';

export const ExampleSchema = z.object({
  sentence: z.string().trim().min(1),
  translation: z.string().optional()
});

export const SenseSchema = z.object({
  definition: z.string().trim().min(1),
  translation: z.string().trim().min(1),
  examples: z.array(ExampleSchema).default([])
});

export const SensesSchema = z.array(SenseSchema).min(1);

export type Example = z.infer<typeof ExampleSchema>;
export type Sense = z.infer<typeof SenseSchema>;

export type CreateFlashcardDTO = {
  headword: string;
  translation: string;
  pos?: string | null;
  example?: string | null;
  imageUrl?: string | null;
  definition?: string | null;
  senses?: Sense[] | null;
};

export function deriveLegacyFieldsFromSenses(senses: Sense[]) {
  const first = senses?.[0];

  return {
    definition: first?.definition ?? null,
    vietnamese: first?.translation ?? null,
    example: first?.examples?.[0]?.sentence ?? null
  };
}

export function normalizeFlashcardInput(input: any): CreateFlashcardDTO {
  // Strict model: require headword + senses
  const headword = (input.headword || '').trim();
  const imageUrl = (input.image_url || input.imageUrl || null)?.trim();
  let pos = (input.pos || '').trim();

  if (!headword) {
    throw new ApiError(400, 'Invalid flashcard: headword is required');
  }

  if (input.senses === undefined || input.senses === null) {
    throw new ApiError(400, 'Invalid flashcard: senses is required in strict model');
  }

  const parsed = SensesSchema.safeParse(input.senses);
  if (!parsed.success) {
    throw new ApiError(400, `Invalid senses structure: ${parsed.error.message}`);
  }

  const cleanSenses = parsed.data;
  const derived = deriveLegacyFieldsFromSenses(cleanSenses);

  return {
    headword,
    translation: derived.vietnamese || '',
    pos: pos || null,
    example: derived.example,
    imageUrl: imageUrl || null,
    definition: derived.definition,
    senses: cleanSenses,
  };
}
