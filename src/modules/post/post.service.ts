import { Op } from 'sequelize';
import sequelize from '../../config/sequelize';
import { Post, PostLike, PostSave, Folder, Flashcard, User } from '../../models';
import { ApiError } from '../../utils/ApiError';

export class PostService {
  async createPost(data: { folderId: string; content?: string }, userId: string) {
    const folder = await Folder.findByPk(data.folderId);
    if (!folder) {
      throw new ApiError(404, 'Folder not found.');
    }
    if (folder.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to share this folder.');
    }

    const post = await Post.create({
      user_id: userId,
      folder_id: data.folderId,
      content: data.content ?? null,
    });

    await post.reload({
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
        { model: Folder, as: 'folder', attributes: ['id', 'title', 'flashcard_count', 'tags'] },
      ],
    });

    return post;
  }

  async getFeed(
    query: {
      limit?: number;
      cursor?: string;
      sort?: 'newest' | 'trending';
      offset?: number;
      tag?: string;
    },
    userId?: string
  ) {
    const limit = query.limit ?? 10;
    const sort = query.sort ?? 'newest';
    const tag = query.tag?.trim();

    const folderInclude: {
      model: typeof Folder;
      as: 'folder';
      attributes: string[];
      where?: Record<string, unknown>;
      required?: boolean;
    } = {
      model: Folder,
      as: 'folder',
      attributes: ['id', 'title', 'flashcard_count', 'tags'],
    };
    if (tag) {
      folderInclude.where = { tags: { [Op.contains]: [tag] } };
      folderInclude.required = true;
    }

    const attachEngagement = async (posts: Post[]) => {
      if (userId && posts.length > 0) {
        const postIds = posts.map((p) => p.id);
        const [likes, saves] = await Promise.all([
          PostLike.findAll({ where: { user_id: userId, post_id: postIds } }),
          PostSave.findAll({ where: { user_id: userId, post_id: postIds } }),
        ]);
        const likedSet = new Set(likes.map((l) => l.post_id));
        const savedSet = new Set(saves.map((s) => s.post_id));
        posts.forEach((post) => {
          (post as any).dataValues.isLiked = likedSet.has(post.id);
          (post as any).dataValues.isSaved = savedSet.has(post.id);
        });
      }
    };

    if (sort === 'trending') {
      const offset = query.offset ?? 0;
      const posts = await Post.findAll({
        include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }, folderInclude],
        order: [
          [sequelize.literal('(like_count + save_count)'), 'DESC'],
          ['created_at', 'DESC'],
        ],
        limit,
        offset,
        subQuery: false,
      });
      await attachEngagement(posts);
      const nextOffset = posts.length === limit ? offset + limit : null;
      return { posts, nextCursor: null as string | null, nextOffset };
    }

    const where: Record<string, unknown> = {};
    if (query.cursor) {
      where['created_at'] = { [Op.lt]: new Date(query.cursor) };
    }

    const posts = await Post.findAll({
      where,
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'avatar'] }, folderInclude],
      order: [['created_at', 'DESC']],
      limit,
      subQuery: false,
    });

    await attachEngagement(posts);

    const nextCursor =
      posts.length === limit ? posts[posts.length - 1].created_at.toISOString() : null;

    return { posts, nextCursor, nextOffset: null as number | null };
  }

  async getPostById(postId: string, userId?: string) {
    const post = await Post.findByPk(postId, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'username', 'avatar'] },
        { model: Folder, as: 'folder', attributes: ['id', 'title', 'flashcard_count', 'tags'] },
      ],
    });
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    const previewFlashcards = await Flashcard.findAll({
      where: { folder_id: post.folder_id },
      attributes: ['id', 'english', 'vietnamese', 'pos', 'image_url'],
      limit: 8,
      order: [['created_at', 'ASC']],
    });

    if (userId) {
      const [like, save] = await Promise.all([
        PostLike.findOne({ where: { user_id: userId, post_id: postId } }),
        PostSave.findOne({ where: { user_id: userId, post_id: postId } }),
      ]);
      (post as any).dataValues.isLiked = !!like;
      (post as any).dataValues.isSaved = !!save;
    }

    return { post, previewFlashcards };
  }

  async likePost(postId: string, userId: string) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    const [, created] = await PostLike.findOrCreate({
      where: { user_id: userId, post_id: postId },
    });

    if (created) {
      await Post.increment('like_count', { where: { id: postId } });
    }

    await post.reload();
    return { liked: true, likeCount: post.like_count };
  }

  async unlikePost(postId: string, userId: string) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    const destroyed = await PostLike.destroy({
      where: { user_id: userId, post_id: postId },
    });

    if (destroyed > 0) {
      await Post.update(
        { like_count: sequelize.literal('GREATEST(like_count - 1, 0)') as any },
        { where: { id: postId } }
      );
    }

    await post.reload();
    return { liked: false, likeCount: post.like_count };
  }

  async savePost(postId: string, userId: string) {
    const post = await Post.findByPk(postId, {
      include: [{ model: Folder, as: 'folder' }],
    });
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }

    const existingSave = await PostSave.findOne({
      where: { user_id: userId, post_id: postId },
    });
    if (existingSave) {
      return { saved: true, saveCount: post.save_count, clonedFolderId: '' };
    }

    const originalFolder = (post as any).folder as Folder;

    try {
      const result = await sequelize.transaction(async (t) => {
        const userFolders = await Folder.findAll({
          where: { user_id: userId },
          attributes: ['title'],
          transaction: t,
        });

        const baseName = originalFolder.title;
        const existingTitles = new Set(userFolders.map((f) => f.title));
        let candidateTitle = `${baseName} (copy)`;
        let n = 2;
        while (existingTitles.has(candidateTitle)) {
          candidateTitle = `${baseName} (copy ${n++})`;
        }

        const clonedFolder = await Folder.create(
          { title: candidateTitle, user_id: userId, is_public: false },
          { transaction: t }
        );

        const flashcards = await Flashcard.findAll({
          where: { folder_id: originalFolder.id },
          transaction: t,
        });

        await Flashcard.bulkCreate(
          flashcards.map((fc) => ({
            english: fc.english,
            vietnamese: fc.vietnamese,
            pos: fc.pos,
            example: fc.example,
            definition: fc.definition,
            senses: fc.senses,
            lexical_entry_id: fc.lexical_entry_id,
            image_url: fc.image_url,
            folder_id: clonedFolder.id,
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

        await PostSave.create({ user_id: userId, post_id: postId }, { transaction: t });
        await Post.increment('save_count', { where: { id: postId }, transaction: t });

        return { saved: true, saveCount: post.save_count + 1, clonedFolderId: clonedFolder.id };
      });

      return result;
    } catch (error) {
      throw new ApiError(500, 'Failed to save post.');
    }
  }
  async deletePost(postId: string, userId: string) {
    const post = await Post.findByPk(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found.');
    }
    if (post.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this post.');
    }
    await post.destroy();
    return { deleted: true };
  }
}

export const postService = new PostService();
