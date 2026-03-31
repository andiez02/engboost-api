import { Folder, Flashcard } from '../../models';
import { ApiError } from '../../utils/ApiError';

export class AdminFolderService {
  async createPublicFolder(data: { title: string; required_level?: number }, adminId: string) {
    const existing = await Folder.findOne({ where: { title: data.title, user_id: adminId } });
    if (existing) throw new ApiError(400, `Folder '${data.title}' already exists.`);

    return Folder.create({
      title: data.title,
      user_id: adminId,
      is_public: true,
      required_level: data.required_level ?? 1,
    });
  }

  async updatePublicFolder(
    folderId: string,
    data: { title?: string; required_level?: number; is_public?: boolean }
  ) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) throw new ApiError(404, 'Folder not found.');
    await folder.update(data);
    return folder;
  }

  async deletePublicFolder(folderId: string) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) throw new ApiError(404, 'Folder not found.');
    await Flashcard.destroy({ where: { folder_id: folderId } });
    await folder.destroy();
    return { deleted: true };
  }

  async listPublicFolders() {
    return Folder.findAll({
      where: { is_public: true },
      order: [['required_level', 'ASC'], ['created_at', 'DESC']],
    });
  }

  async getFolderFlashcards(folderId: string) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) throw new ApiError(404, 'Folder not found.');
    return Flashcard.findAll({
      where: { folder_id: folderId },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'english', 'vietnamese', 'object', 'image_url'],
    });
  }
}

export const adminFolderService = new AdminFolderService();
