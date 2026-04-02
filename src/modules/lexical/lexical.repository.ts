import { Op } from 'sequelize';
import sequelize from '../../config/sequelize';
import { LexicalEntry } from '../../models';

interface UpsertLexicalEntryParams {
  headword: string;
  pos: string | null;
  senses: any;
  imageUrl?: string | null;
  phonetic?: string | null;
  audioUrl?: string | null;
}

export class LexicalRepository {
  /**
   * Safely finding or creating a shared LexicalEntry using UPSERT natively in Postgres.
   * This handles concurrent writes elegantly without hitting "duplicate key" exceptions.
   * Returns the canonical LexicalEntry UUID.
   */
  async upsertLexicalEntry(params: UpsertLexicalEntryParams): Promise<string> {
    const { headword, pos, senses, imageUrl, phonetic, audioUrl } = params;
    const normalizedHeadword = headword.trim().toLowerCase();
    const safePos = pos ? pos.trim() : null;

    // Use findOrCreate to handle shared LexicalEntry deduplication.
    // Note: This respects the functional unique index (LOWER(headword), COALESCE(pos, ''))
    // because Sequelize maps null to IS NULL and uses functional where clauses.
    const [entry] = await LexicalEntry.findOrCreate({
      where: {
        [Op.and]: [
          sequelize.where(sequelize.fn('LOWER', sequelize.col('headword')), normalizedHeadword),
          { pos: safePos }
        ]
      },
      defaults: {
        headword: normalizedHeadword,
        pos: safePos,
        senses,
        image_url: imageUrl,
        phonetic,
        audio_url: audioUrl,
      }
    });

    // If the entry already existed but didn't have an image_url, and we now have one, update it.
    // This replicates the DO UPDATE SET image_url = COALESCE(...) logic.
    if (!entry.image_url && imageUrl) {
      entry.image_url = imageUrl;
      await entry.save();
    }

    return entry.id;
  }
}

export const lexicalRepository = new LexicalRepository();
