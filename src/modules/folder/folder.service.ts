import { Folder, Flashcard } from '../../models';
import { ApiError } from '../../utils/ApiError';

export class FolderService {
  async create(data: { title: string; is_public?: boolean }, userId: string) {
    // Check duplicate title for this user
    const existing = await Folder.findOne({
      where: { title: data.title, user_id: userId },
    });
    if (existing) {
      throw new ApiError(400, `Folder with title '${data.title}' already exists.`);
    }

    const folder = await Folder.create({
      title: data.title,
      user_id: userId,
      is_public: data.is_public ?? false,
    });

    return folder;
  }

  async getByUser(userId: string) {
    return Folder.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  async getById(folderId: string) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      throw new ApiError(404, 'Folder not found.');
    }
    return folder;
  }

  async update(folderId: string, userId: string, updateData: { title?: string; is_public?: boolean }) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      throw new ApiError(404, 'Folder not found.');
    }

    if (folder.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to update this folder.');
    }

    // Check duplicate title if title is being updated
    if (updateData.title && updateData.title !== folder.title) {
      const existing = await Folder.findOne({
        where: { title: updateData.title, user_id: userId },
      });
      if (existing) {
        throw new ApiError(400, `Folder with title '${updateData.title}' already exists.`);
      }
    }

    await folder.update(updateData);
    return folder;
  }

  async delete(folderId: string, userId: string) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) {
      throw new ApiError(404, 'Folder not found.');
    }

    if (folder.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this folder.');
    }

    // Delete all flashcards in the folder first
    await Flashcard.destroy({ where: { folder_id: folderId } });

    // Delete folder
    await folder.destroy();
    return folder;
  }

  async getPublicFolders(skip = 0, limit = 100) {
    return Folder.findAll({
      where: { is_public: true },
      order: [['created_at', 'DESC']],
      offset: skip,
      limit,
    });
  }

  async updateFlashcardCount(folderId: string) {
    const count = await Flashcard.count({ where: { folder_id: folderId } });
    await Folder.update({ flashcard_count: count }, { where: { id: folderId } });
    return count;
  }
}

export const folderService = new FolderService();
