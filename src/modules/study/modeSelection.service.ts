import { Flashcard, LexicalEntry } from '../../models';

// ─── Types ──────────────────────────────────────────────────────────────────

export type StudyMode = 'recall' | 'multiple_choice' | 'typing' | 'image';

export type CardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING';

export interface ModeSelectionInput {
  flashcard: Flashcard;
  lexicalEntry: LexicalEntry | null;
}

export interface ModeSelectionOutput {
  studyMode: StudyMode;
  options?: string[]; // Only present for multiple_choice mode
}

// ─── Shared Utilities ───────────────────────────────────────────────────────

/**
 * Weighted random selection
 * @param weights Record of modes and their probabilities
 */
function weighted(weights: Partial<Record<StudyMode, number>>): StudyMode {
  let sum = 0;
  for (const w of Object.values(weights)) {
    if (w) sum += w;
  }
  
  let random = Math.random() * sum;
  for (const [mode, weight] of Object.entries(weights)) {
    if (!weight) continue;
    if (random < weight) return mode as StudyMode;
    random -= weight;
  }
  
  return Object.keys(weights)[0] as StudyMode || 'recall';
}

// ─── Mode Selection Service ─────────────────────────────────────────────────

export class ModeSelectionService {
  /**
   * Derive card state from SRS fields without modifying them.
   * 
   * State mapping:
   * - NEW: is_learning=true, repetition=0 (never reviewed)
   * - LEARNING: is_learning=true, repetition=0 (in learning steps)
   * - REVIEW: is_learning=false, repetition>0 (graduated to SM-2)
   * - RELEARNING: is_learning=true, repetition>0 (failed review, back to learning)
   */
  deriveCardState(isLearning: boolean, repetition: number, learningStep: number): CardState {
    if (!isLearning && repetition > 0) return 'REVIEW';
    if (isLearning && repetition > 0) return 'RELEARNING';
    if (isLearning && repetition === 0) {
      return learningStep === 0 ? 'NEW' : 'LEARNING';
    }
    return 'NEW';
  }

  /**
   * Select appropriate study mode based on card state and content.
   * 
   * Mode selection rules:
   * - NEW: Weighted selection (70% MCQ, 20% Recall, 10% Image if available)
   * - LEARNING: Random 50/50 recall or typing
   * - REVIEW: 30% image if imageUrl exists, else random from recall/multiple_choice/typing
   * - RELEARNING: Always recall (100%)
   * 
   * @param input - Flashcard and optional LexicalEntry
   * @returns Selected study mode (no options generated here)
   */
  selectMode(input: ModeSelectionInput): StudyMode {
    const { flashcard, lexicalEntry } = input;
    const state = this.deriveCardState(flashcard.is_learning, flashcard.repetition, flashcard.learning_step);
    
    const hasImage = !!lexicalEntry?.image_url;

    switch (state) {
      case 'NEW':
        return weighted({
          multiple_choice: 0.7,
          recall: 0.2,
          image: hasImage ? 0.1 : 0
        });

      case 'LEARNING':
        // Random 50/50 between recall and typing
        return Math.random() < 0.5 ? 'recall' : 'typing';

      case 'REVIEW': {
        // 30% chance of image mode if imageUrl exists
        if (lexicalEntry?.image_url && Math.random() < 0.3) {
          return 'image';
        }
        // Otherwise random from recall, multiple_choice, typing
        const modes: StudyMode[] = ['recall', 'multiple_choice', 'typing'];
        return modes[Math.floor(Math.random() * 3)];
      }

      case 'RELEARNING':
        return 'recall';

      default:
        // Fallback to recall for unexpected states
        return 'recall';
    }
  }
}

export const modeSelectionService = new ModeSelectionService();
