import { Op } from 'sequelize';
import { Flashcard, LexicalEntry } from '../../models';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface MCQGeneratorInput {
  flashcard: Flashcard;
  lexicalEntry: LexicalEntry;
  userId: string;
  folderId?: string;
}

export interface MCQGeneratorOutput {
  options: string[]; // Array of 4 unique translations
  correctIndex: number; // Position of correct answer (0-3)
}

// ─── MCQ Generator Service ──────────────────────────────────────────────────

export class MCQGeneratorService {
  /**
   * Generate 4 multiple choice options for a flashcard.
   * 
   * Algorithm:
   * 1. Extract correct answer from lexicalEntry.senses[0].translation
   * 2. Query distractors with matching POS (limit 20)
   * 3. Fallback to any POS if < 3 distractors found
   * 4. Ensure 4 unique options
   * 5. Randomize correct answer position
   * 6. Return null if unable to generate 3 distractors
   * 
   * @param input - Flashcard, LexicalEntry, userId, optional folderId
   * @returns MCQGeneratorOutput with 4 options and correctIndex, or null if insufficient distractors
   */
  async generateOptions(input: MCQGeneratorInput): Promise<MCQGeneratorOutput | null> {
    const { flashcard, lexicalEntry, userId, folderId } = input;

    // 1. Extract correct answer from lexicalEntry.senses[0].translation
    const correctAnswer = lexicalEntry.senses?.[0]?.translation;
    if (!correctAnswer) {
      console.warn(`[MCQGenerator] No translation found for flashcard=${flashcard.id}`);
      return null;
    }

    // 2. Query distractors with matching POS
    const baseWhere: Record<string, unknown> = {
      user_id: userId,
      id: { [Op.ne]: flashcard.id }, // Exclude current card
    };
    if (folderId) baseWhere.folder_id = folderId;

    let candidates = await Flashcard.findAll({
      where: {
        ...baseWhere,
        '$lexicalEntry.pos$': lexicalEntry.pos,
      },
      include: [{ model: LexicalEntry, as: 'lexicalEntry', required: true }],
      limit: 20,
    });

    // 3. Fallback to any POS if insufficient matches
    if (candidates.length < 3) {
      candidates = await Flashcard.findAll({
        where: baseWhere,
        include: [{ model: LexicalEntry, as: 'lexicalEntry', required: true }],
        limit: 20,
      });
    }

    // 4. Extract unique translations
    const distractors = candidates
      .map((c) => (c as any).lexicalEntry?.senses?.[0]?.translation)
      .filter((t): t is string => !!t && t !== correctAnswer) // Type guard + filter
      .filter((t, i, arr) => arr.indexOf(t) === i) // Unique
      .slice(0, 3);

    if (distractors.length < 3) {
      console.warn(`[MCQGenerator] Insufficient distractors for flashcard=${flashcard.id}. Found ${distractors.length}, need 3.`);
      return null; // Fallback to recall mode
    }

    // 5. Shuffle options
    const options = [correctAnswer, ...distractors];
    const correctIndex = Math.floor(Math.random() * 4);

    // Move correct answer to random position
    [options[0], options[correctIndex]] = [options[correctIndex], options[0]];

    return { options, correctIndex };
  }
}

export const mcqGeneratorService = new MCQGeneratorService();
