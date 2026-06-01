import { Response, NextFunction } from 'express';
import { postService } from './post.service';
import { AuthenticatedRequest } from '../../types';

export const createPost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { folderId, content } = req.body;
    const post = await postService.createPost({ folderId, content }, req.user!.id);
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    next(error);
  }
};

export const getFeed = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const q = req.query as Record<string, string | undefined>;
    const limit = q.limit ? Number(q.limit) : undefined;
    const cursor = q.cursor;
    const sort = q.sort as 'newest' | 'trending' | undefined;
    const offset = q.offset !== undefined ? Number(q.offset) : undefined;
    const tag = q.tag;
    const { posts, nextCursor, nextOffset } = await postService.getFeed(
      { limit, cursor, sort, offset, tag },
      req.user?.id
    );
    res.status(200).json({ success: true, data: posts, nextCursor, nextOffset });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string };
    const result = await postService.getPostById(id, req.user?.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const likePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await postService.likePost(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const unlikePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await postService.unlikePost(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const savePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await postService.savePost(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await postService.deletePost(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
