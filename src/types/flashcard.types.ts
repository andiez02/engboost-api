/**
 * Normalized input structure for flashcard creation.
 * This is the single source of truth for flashcard data.
 */
export interface CreateFlashcardDTO {
  /** The word or phrase being learned (e.g., "apple", "break down") */
  headword: string;
  
  /** Translation in target language */
  translation: string;
  
  /** Part of speech (e.g., "noun", "verb", "adjective") */
  pos?: string;
  
  /** Example sentence demonstrating usage */
  example?: string;
  
  /** URL to associated image */
  imageUrl?: string;
}
