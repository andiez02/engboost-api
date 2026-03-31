import sequelize from '../../config/sequelize';
import { Folder, Flashcard } from '../../models';
import { ApiError } from '../../utils/ApiError';

export class ExploreService {
  async getExploreFolders(userLevel: number) {
    const folders = await Folder.findAll({
      where: { is_public: true },
      order: [['required_level', 'ASC'], ['created_at', 'DESC']],
      attributes: ['id', 'title', 'flashcard_count', 'required_level'],
    });

    return folders.map((f) => ({
      id: f.id,
      title: f.title,
      flashcard_count: f.flashcard_count,
      required_level: f.required_level,
      is_locked: userLevel < f.required_level,
    }));
  }

  async cloneFolder(folderId: string, userId: string, userLevel: number) {
    const original = await Folder.findOne({ where: { id: folderId, is_public: true } });
    if (!original) throw new ApiError(404, 'Folder not found.');
    if (userLevel < original.required_level) {
      throw new ApiError(403, `Reach level ${original.required_level} to unlock this folder.`);
    }

    return sequelize.transaction(async (t) => {
      // Deduplicate title
      const userFolders = await Folder.findAll({
        where: { user_id: userId },
        attributes: ['title'],
        transaction: t,
      });
      const existingTitles = new Set(userFolders.map((f) => f.title));
      let candidateTitle = `${original.title} (copy)`;
      let n = 2;
      while (existingTitles.has(candidateTitle)) {
        candidateTitle = `${original.title} (copy ${n++})`;
      }

      const cloned = await Folder.create(
        { title: candidateTitle, user_id: userId, is_public: false, required_level: 1 },
        { transaction: t }
      );

      const flashcards = await Flashcard.findAll({ where: { folder_id: folderId }, transaction: t });

      if (flashcards.length > 0) {
        await Flashcard.bulkCreate(
          flashcards.map((fc) => ({
            english: fc.english,
            vietnamese: fc.vietnamese,
            object: fc.object,
            image_url: fc.image_url,
            folder_id: cloned.id,
            user_id: userId,
            is_public: false,
            repetition: 0,
            interval: 0,
            ease_factor: 2.5,
            next_review_at: new Date(),
            last_reviewed_at: null,
            is_learning: true,
            learning_step: 0,
          })),
          { transaction: t }
        );

        await Folder.update(
          { flashcard_count: flashcards.length },
          { where: { id: cloned.id }, transaction: t }
        );
      }

      return cloned;
    });
  }
}

export const exploreService = new ExploreService();
