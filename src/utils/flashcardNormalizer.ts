import { CreateFlashcardDTO } from '../types/flashcard.types';

/**
 * Heuristic to detect if a string is a sentence vs. a short label.
 * 
 * A value is considered a sentence if:
 * - It contains a space AND ends with punctuation (.!?)
 * - OR it's longer than 20 characters
 */
export function isSentence(value: string): boolean {
  const trimmed = value.trim();
  return (
    (trimmed.includes(' ') && /[.!?]$/.test(trimmed)) ||
    trimmed.length > 20
  );
}

/**
 * Normalizes various input formats into a consistent CreateFlashcardDTO.
 * Handles legacy field names and ambiguous data structures.
 * 
 * Field mapping priority:
 * 1. Explicit fields (pos, example) take highest priority
 * 2. Object field is disambiguated using sentence detection
 * 3. Legacy field names (english, vietnamese) are mapped to semantic names
 * 
 * @param input - Raw input object with various possible field names
 * @returns Normalized CreateFlashcardDTO with consistent structure
 */
export function normalizeFlashcardInput(input: Record<string, any>): CreateFlashcardDTO {
  // Extract headword (required)
  const headwordRaw = input.english !== undefined && input.english !== null ? input.english : input.headword;
  const headword = (headwordRaw !== undefined && headwordRaw !== null ? headwordRaw : '').toString().trim();
  
  // Extract translation (required)
  const translationRaw = input.vietnamese !== undefined && input.vietnamese !== null ? input.vietnamese : input.translation;
  const translation = (translationRaw !== undefined && translationRaw !== null ? translationRaw : '').toString().trim();
  
  // Extract imageUrl (optional)
  const imageUrlRaw = input.image_url !== undefined && input.image_url !== null ? input.image_url : input.imageUrl;
  const imageUrl = imageUrlRaw ? imageUrlRaw.toString().trim() : undefined;
  
  // Determine pos and example from various sources
  let pos: string | undefined;
  let example: string | undefined;
  
  // Priority 1: Explicit pos field
  if (input.pos !== undefined && input.pos !== null) {
    const posValue = input.pos.toString().trim();
    if (posValue && !isSentence(posValue)) {
      pos = posValue;
    }
  }
  
  // Priority 2: Explicit example field
  if (input.example !== undefined && input.example !== null) {
    const exampleValue = input.example.toString().trim();
    if (exampleValue) {
      example = exampleValue;
    }
  }
  
  // Priority 3: Disambiguate object field
  if (input.object !== undefined && input.object !== null) {
    const objectValue = input.object.toString().trim();
    if (objectValue) {
      if (isSentence(objectValue)) {
        // If no explicit example was provided, use object as example
        example = example || objectValue;
      } else {
        // If no explicit pos was provided, use object as pos
        pos = pos || objectValue;
      }
    }
  }
  
  return {
    headword,
    translation,
    pos,
    example,
    imageUrl,
  };
}
