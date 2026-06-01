import { Op } from 'sequelize';
import { Flashcard, Folder, LexicalEntry } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { updateSpacedRepetition } from '../../utils/srsEngine';
import { folderService } from '../folder/folder.service';
import { normalizeFlashcardInput } from './flashcard.utils';
import { lexicalRepository } from '../lexical/lexical.repository';
import { toFlashcardResponse, toFlashcardResponseList, FlashcardResponse } from './flashcard.mapper';

interface FlashcardInput {
  headword: string;
  pos?: string | null;
  senses: any[];
  image_url?: string | null;
}

export class FlashcardService {
  async saveToFolder(
    createNewFolder: boolean,
    folderId: string | undefined,
    folderTitle: string | undefined,
    userId: string,
    flashcards: FlashcardInput[]
  ) {
    let targetFolderId: string;
    let folder: Folder;

    if (createNewFolder) {
      // Create new folder
      if (!folderTitle) {
        throw new ApiError(400, 'Folder title is required when creating new folder.');
      }
      folder = await Folder.create({
        title: folderTitle,
        user_id: userId,
        is_public: false,
      });
      targetFolderId = folder.id;
    } else {
      // Use existing folder
      if (!folderId) {
        throw new ApiError(400, 'Folder ID is required when using existing folder.');
      }
      folder = await Folder.findByPk(folderId) as Folder;
      if (!folder) {
        throw new ApiError(404, 'Folder not found.');
      }
      if (folder.user_id !== userId) {
        throw new ApiError(403, 'You do not have permission to add flashcards to this folder.');
      }
      targetFolderId = folderId;
    }

    // Prepare bulk insert data sequentially parsing via Shared Lexical Layer
    const flashcardData = [];
    for (const fc of flashcards) {
      const normalized = normalizeFlashcardInput(fc);
      
      const lexicalEntryId = await lexicalRepository.upsertLexicalEntry({
        headword: normalized.headword,
        pos: normalized.pos ?? null,
        senses: normalized.senses ?? null,
        imageUrl: normalized.imageUrl ?? null
      });

      flashcardData.push({
        english: normalized.headword,
        vietnamese: normalized.translation,
        pos: normalized.pos,
        example: normalized.example,
        definition: normalized.definition,
        senses: normalized.senses, // dual written Phase 3.1
        lexical_entry_id: lexicalEntryId,
        image_url: normalized.imageUrl ?? null,
        folder_id: targetFolderId,
        user_id: userId,
        is_public: folder.is_public,
      });
    }

    const created = await Flashcard.bulkCreate(flashcardData);

    // Update folder flashcard count
    await folderService.updateFlashcardCount(targetFolderId);

    return { 
      inserted_count: created.length,
      folder: {
        id: folder.id,
        title: folder.title,
        flashcard_count: created.length,
      }
    };
  }

  async getByFolder(folderId: string, skip = 0, limit = 100): Promise<FlashcardResponse[]> {
    const cards = await Flashcard.findAll({
      where: { folder_id: folderId },
      include: [{ model: LexicalEntry, as: 'lexicalEntry' }],
      order: [['created_at', 'DESC']],
      offset: skip,
      limit,
    });
    return toFlashcardResponseList(cards);
  }

  async getById(flashcardId: string): Promise<FlashcardResponse> {
    const flashcard = await Flashcard.findByPk(flashcardId, {
      include: [{ model: LexicalEntry, as: 'lexicalEntry' }]
    });
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found.');
    }
    return toFlashcardResponse(flashcard);
  }

  async delete(flashcardId: string, userId: string) {
    const flashcard = await Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found.');
    }
    if (flashcard.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this flashcard.');
    }

    const folderId = flashcard.folder_id;
    await flashcard.destroy();

    // Update folder flashcard count
    await folderService.updateFlashcardCount(folderId);

    return flashcard;
  }

  async reviewFlashcard(flashcardId: string, userId: string, rating: 0 | 1 | 2 | 3): Promise<FlashcardResponse> {
    const flashcard = await Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found.');
    }
    if (flashcard.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to review this flashcard.');
    }

    // Update when user click rating button 
    const result = updateSpacedRepetition(
      { repetition: flashcard.repetition, interval: flashcard.interval, ease_factor: flashcard.ease_factor },
      rating
    );

    flashcard.repetition = result.repetition;
    flashcard.interval = result.interval;
    flashcard.ease_factor = result.ease_factor;
    flashcard.next_review_at = result.next_review_at;
    flashcard.last_reviewed_at = result.last_reviewed_at;

    await flashcard.save();

    // Re-fetch with LexicalEntry join for clean response
    const updated = await Flashcard.findByPk(flashcardId, {
      include: [{ model: LexicalEntry, as: 'lexicalEntry' }]
    });
    return toFlashcardResponse(updated!);
  }

  async getDueCards(userId: string, folderId?: string): Promise<FlashcardResponse[]> {
    const where: Record<string, unknown> = {
      user_id: userId,
      next_review_at: { [Op.lte]: new Date() },
    };

    if (folderId) {
      where.folder_id = folderId;
    }

    const cards = await Flashcard.findAll({ 
      where, 
      order: [['next_review_at', 'ASC']],
      include: [{ model: LexicalEntry, as: 'lexicalEntry' }] 
    });
    return toFlashcardResponseList(cards);
  }
}

export const flashcardService = new FlashcardService();
