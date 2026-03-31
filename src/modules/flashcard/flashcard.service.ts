import { Op } from 'sequelize';
import { Flashcard, Folder } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { updateSpacedRepetition } from '../../utils/srsEngine';
import { folderService } from '../folder/folder.service';

interface FlashcardInput {
  english: string;
  vietnamese: string;
  object?: string | null;
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

    // Prepare bulk insert data
    const flashcardData = flashcards.map((fc) => ({
      english: fc.english,
      vietnamese: fc.vietnamese,
      object: fc.object || null,
      image_url: fc.image_url || null,
      folder_id: targetFolderId,
      user_id: userId,
      is_public: folder.is_public,
    }));

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

  async getByFolder(folderId: string, skip = 0, limit = 100) {
    return Flashcard.findAll({
      where: { folder_id: folderId },
      order: [['created_at', 'DESC']],
      offset: skip,
      limit,
    });
  }

  async getById(flashcardId: string) {
    const flashcard = await Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found.');
    }
    return flashcard;
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

  async reviewFlashcard(flashcardId: string, userId: string, rating: 0 | 1 | 2 | 3): Promise<Flashcard> {
    const flashcard = await Flashcard.findByPk(flashcardId);
    if (!flashcard) {
      throw new ApiError(404, 'Flashcard not found.');
    }
    if (flashcard.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to review this flashcard.');
    }

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
    return flashcard;
  }

  async getDueCards(userId: string, folderId?: string): Promise<Flashcard[]> {
    const where: Record<string, unknown> = {
      user_id: userId,
      next_review_at: { [Op.lte]: new Date() },
    };

    if (folderId) {
      where.folder_id = folderId;
    }

    return Flashcard.findAll({ where, order: [['next_review_at', 'ASC']] });
  }
}

export const flashcardService = new FlashcardService();
