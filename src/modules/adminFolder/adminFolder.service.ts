import { Op } from 'sequelize';
import { Folder, Flashcard, User } from '../../models';
import { ApiError } from '../../utils/ApiError';

export class AdminFolderService {

  private async getAdminIds(): Promise<string[]> {
    const admins = await User.findAll({ where: { role: 'ADMIN' }, attributes: ['id'] });
    return admins.map((u) => u.id);
  }

  // ── Explore folders (required_level >= 1) ────────────────────────────────

  async createPublicFolder(data: { title: string; required_level?: number; is_public?: boolean }, adminId: string) {
    const existing = await Folder.findOne({ where: { title: data.title, user_id: adminId } });
    if (existing) throw new ApiError(400, `Folder '${data.title}' already exists.`);
    return Folder.create({
      title: data.title,
      user_id: adminId,
      is_public: data.is_public ?? false,
      required_level: data.required_level ?? 1,
    });
  }

  async updatePublicFolder(folderId: string, data: { title?: string; required_level?: number; is_public?: boolean }) {
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
    const adminIds = await this.getAdminIds();
    if (!adminIds.length) return [];
    return Folder.findAll({
      where: { user_id: { [Op.in]: adminIds }, required_level: { [Op.gte]: 1 } },
      order: [['required_level', 'ASC'], ['created_at', 'DESC']],
    });
  }

  // ── Community folders (required_level = 0) ───────────────────────────────

  async createCommunityFolder(data: { title: string; is_public?: boolean }, adminId: string) {
    const existing = await Folder.findOne({ where: { title: data.title, user_id: adminId } });
    if (existing) throw new ApiError(400, `Folder '${data.title}' already exists.`);
    return Folder.create({
      title: data.title,
      user_id: adminId,
      is_public: data.is_public ?? false,
      required_level: 0,
    });
  }

  async listCommunityFolders() {
    const adminIds = await this.getAdminIds();
    if (!adminIds.length) return [];
    return Folder.findAll({
      where: { user_id: { [Op.in]: adminIds }, required_level: 0 },
      order: [['created_at', 'DESC']],
    });
  }

  // ── Shared flashcard methods ─────────────────────────────────────────────

  async getFolderFlashcards(folderId: string) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) throw new ApiError(404, 'Folder not found.');
    return Flashcard.findAll({
      where: { folder_id: folderId },
      order: [['created_at', 'ASC']],
      attributes: ['id', 'english', 'vietnamese', 'pos', 'definition', 'example', 'image_url'],
    });
  }

  async addFlashcard(folderId: string, adminId: string, data: {
    english: string;
    vietnamese?: string;
    pos?: string;
    definition?: string;
    example?: string;
  }) {
    const folder = await Folder.findByPk(folderId);
    if (!folder) throw new ApiError(404, 'Folder not found.');

    const translation = data.vietnamese?.trim() || data.english.trim();
    const flashcard = await Flashcard.create({
      english: data.english.trim(),
      vietnamese: data.vietnamese?.trim() || null,
      pos: data.pos?.trim() || null,
      definition: data.definition?.trim() || null,
      example: data.example?.trim() || null,
      senses: [{
        translation,
        definition: data.definition?.trim() || null,
        examples: data.example?.trim() ? [{ sentence: data.example.trim() }] : [],
      }],
      folder_id: folderId,
      user_id: adminId,
      is_public: true,
    });

    await Folder.update(
      { flashcard_count: (folder.flashcard_count ?? 0) + 1 },
      { where: { id: folderId } }
    );

    return flashcard;
  }

  async deleteFlashcard(folderId: string, flashcardId: string) {
    const fc = await Flashcard.findOne({ where: { id: flashcardId, folder_id: folderId } });
    if (!fc) throw new ApiError(404, 'Flashcard not found.');
    await fc.destroy();
    const count = await Flashcard.count({ where: { folder_id: folderId } });
    await Folder.update({ flashcard_count: count }, { where: { id: folderId } });
    return { deleted: true };
  }

  async listAllFlashcards(
    page: number,
    limit: number,
    search: string,
    hasImage: boolean,
    filters: {
      source?: string;
      folderType?: string;
      owner?: string;
      folderName?: string;
    }
  ) {
    const { Op } = await import('sequelize');
    const where: Record<string, unknown> = {};
    const userWhere: Record<string, unknown> = {};
    const folderWhere: Record<string, unknown> = {};
    if (hasImage) where['image_url'] = { [Op.ne]: null };
    if (search) where['english'] = { [Op.iLike]: `%${search}%` };
    if (filters.owner) {
      userWhere[Op.or] = [
        { username: { [Op.iLike]: `%${filters.owner}%` } },
        { email: { [Op.iLike]: `%${filters.owner}%` } },
      ];
    }
    if (filters.folderName) {
      folderWhere['title'] = { [Op.iLike]: `%${filters.folderName}%` };
    }

    if (filters.folderType === 'PRIVATE') {
      folderWhere['is_public'] = false;
    } else if (filters.folderType === 'COMMUNITY') {
      folderWhere['required_level'] = 0;
    } else if (filters.folderType === 'EXPLORE') {
      folderWhere['required_level'] = { [Op.gte]: 1 };
    }

    if (filters.source === 'SYSTEM') {
      userWhere['role'] = 'ADMIN';
    } else if (filters.source === 'USER') {
      userWhere['role'] = 'CLIENT';
    }

    const include = [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email', 'role'],
        where: userWhere,
        required: Object.keys(userWhere).length > 0,
      },
      {
        model: Folder,
        as: 'folder',
        attributes: ['id', 'title', 'is_public', 'required_level'],
        where: folderWhere,
        required: Object.keys(folderWhere).length > 0,
      },
    ];

    const { count, rows } = await Flashcard.findAndCountAll({
      where,
      include,
      order: [['created_at', 'DESC']],
      limit,
      offset: (page - 1) * limit,
      attributes: ['id', 'english', 'vietnamese', 'pos', 'image_url', 'folder_id', 'user_id', 'created_at'],
      distinct: true,
    });

    const baseFlashcardWhere: any = { ...where };
    delete baseFlashcardWhere.image_url;
    const baseUserWhere: any = { ...userWhere };
    delete baseUserWhere.role;
    const baseFolderWhere: any = { ...folderWhere };
    delete baseFolderWhere.required_level;
    delete baseFolderWhere.is_public;

    const countWith = async ({
      flashcardWhere = {},
      userRole,
      folderType,
      withImage,
    }: {
      flashcardWhere?: Record<string, unknown>;
      userRole?: 'ADMIN' | 'CLIENT';
      folderType?: 'EXPLORE' | 'COMMUNITY' | 'PRIVATE';
      withImage?: boolean;
    }) => {
      const mergedFlashcardWhere: any = { ...baseFlashcardWhere, ...flashcardWhere };
      if (typeof withImage === 'boolean') {
        mergedFlashcardWhere.image_url = withImage ? { [Op.ne]: null } : null;
      }
      const mergedUserWhere: any = { ...baseUserWhere };
      if (userRole) mergedUserWhere.role = userRole;

      const mergedFolderWhere: any = { ...baseFolderWhere };
      if (folderType === 'COMMUNITY') mergedFolderWhere.required_level = 0;
      if (folderType === 'EXPLORE') mergedFolderWhere.required_level = { [Op.gte]: 1 };
      if (folderType === 'PRIVATE') mergedFolderWhere.is_public = false;

      return Flashcard.count({
        where: mergedFlashcardWhere,
        include: [
          {
            model: User,
            as: 'user',
            attributes: [],
            where: mergedUserWhere,
            required: Object.keys(mergedUserWhere).length > 0,
          },
          {
            model: Folder,
            as: 'folder',
            attributes: [],
            where: mergedFolderWhere,
            required: Object.keys(mergedFolderWhere).length > 0,
          },
        ],
        distinct: true,
        col: 'id',
      });
    };

    const [
      systemCount,
      userCount,
      exploreCount,
      communityCount,
      privateCount,
      withImageCount,
      withoutImageCount,
    ] = await Promise.all([
      countWith({ userRole: 'ADMIN' }),
      countWith({ userRole: 'CLIENT' }),
      countWith({ folderType: 'EXPLORE' }),
      countWith({ folderType: 'COMMUNITY' }),
      countWith({ folderType: 'PRIVATE' }),
      countWith({ withImage: true }),
      countWith({ withImage: false }),
    ]);

    return {
      flashcards: rows.map((row) => {
        const flashcard = row.toJSON() as any;
        const ownerRole = flashcard.user?.role || 'CLIENT';
        const requiredLevel = flashcard.folder?.required_level ?? 1;
        const folderPublic = flashcard.folder?.is_public ?? false;

        let folderType = 'PRIVATE';
        if (requiredLevel === 0) folderType = 'COMMUNITY';
        else if (ownerRole === 'ADMIN' && requiredLevel >= 1) folderType = 'EXPLORE';
        else if (folderPublic) folderType = 'PUBLIC';

        return {
          ...flashcard,
          source: ownerRole === 'ADMIN' ? 'SYSTEM' : 'USER',
          folderType,
          owner: flashcard.user
            ? {
                id: flashcard.user.id,
                username: flashcard.user.username,
                email: flashcard.user.email,
                role: flashcard.user.role,
              }
            : null,
          folderContext: flashcard.folder
            ? {
                id: flashcard.folder.id,
                title: flashcard.folder.title,
                isPublic: flashcard.folder.is_public,
                requiredLevel: flashcard.folder.required_level,
              }
            : null,
        };
      }),
      summary: {
        total: count,
        system: systemCount,
        user: userCount,
        explore: exploreCount,
        community: communityCount,
        private: privateCount,
        withImage: withImageCount,
        withoutImage: withoutImageCount,
      },
      pagination: { total: count, page, limit, totalPages: Math.ceil(count / limit) },
    };
  }

  async deleteAnyFlashcard(flashcardId: string) {
    const fc = await Flashcard.findByPk(flashcardId);
    if (!fc) throw new ApiError(404, 'Flashcard not found.');
    const folderId = fc.folder_id;
    await fc.destroy();
    const count = await Flashcard.count({ where: { folder_id: folderId } });
    await Folder.update({ flashcard_count: count }, { where: { id: folderId } });
    return { deleted: true };
  }
}

export const adminFolderService = new AdminFolderService();
