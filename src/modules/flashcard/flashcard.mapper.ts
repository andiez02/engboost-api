import { Flashcard, LexicalEntry } from '../../models';

// ─── Response Types ─────────────────────────────────────────────────────────

export interface LexicalEntryResponse {
  id: string;
  headword: string;
  pos: string | null;
  senses: any[];
  imageUrl: string | null;
}

export interface FlashcardResponse {
  id: string;

  lexicalEntry: LexicalEntryResponse | null;

  folderId: string;
  userId: string;

  repetition: number;
  interval: number;
  easeFactor: number;
  nextReviewAt: Date;
  lastReviewedAt: Date | null;

  isLearning: boolean;
  learningStep: number;

  createdAt: Date;
}

// ─── Mapper ─────────────────────────────────────────────────────────────────

/**
 * Map a Sequelize Flashcard instance (with optional LexicalEntry include)
 * to the clean Phase 3 API response shape.
 *
 * Legacy vocabulary fields (english, vietnamese, definition, example, senses)
 * are NEVER exposed at the top level.
 */
export function toFlashcardResponse(card: Flashcard): FlashcardResponse {
  // Extract the joined lexicalEntry association
  const lexical = (card as any).lexicalEntry as LexicalEntry | undefined;

  let lexicalEntry: LexicalEntryResponse | null = null;

  if (lexical) {
    // Phase 3 — LexicalEntry is present
    lexicalEntry = {
      id: lexical.id,
      headword: lexical.headword,
      pos: lexical.pos,
      senses: lexical.senses ?? [],
      imageUrl: lexical.image_url ?? null,
    };
  } else if (card.lexical_entry_id) {
    // Edge case: FK exists but association wasn't loaded — should not happen
    console.warn(
      `[FlashcardMapper] lexical_entry_id=${card.lexical_entry_id} set but association not loaded for flashcard=${card.id}. Ensure include: LexicalEntry.`
    );
    lexicalEntry = null;
  } else {
    // Backward compatibility: no lexical_entry_id → build from legacy fields
    console.warn(
      `[FlashcardMapper] Missing lexical_entry_id for flashcard=${card.id}. Falling back to legacy fields.`
    );
    lexicalEntry = {
      id: card.id, // use flashcard id as pseudo-id
      headword: card.english || '—',
      pos: card.pos ?? null,
      senses: card.senses ?? [],
      imageUrl: card.image_url ?? null,
    };
  }

  return {
    id: card.id,

    lexicalEntry,

    folderId: card.folder_id,
    userId: card.user_id,

    repetition: card.repetition,
    interval: card.interval,
    easeFactor: card.ease_factor,
    nextReviewAt: card.next_review_at,
    lastReviewedAt: card.last_reviewed_at,

    isLearning: card.is_learning,
    learningStep: card.learning_step,

    createdAt: card.created_at,
  };
}

/**
 * Batch mapper — convenience wrapper for arrays.
 */
export function toFlashcardResponseList(cards: Flashcard[]): FlashcardResponse[] {
  return cards.map(toFlashcardResponse);
}
