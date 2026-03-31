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
    const limit = req.query.limit ? Number(req.query.limit) : undefined;
    const cursor = req.query.cursor ? (req.query.cursor as string) : undefined;
    const { posts, nextCursor } = await postService.getFeed({ limit, cursor }, req.user?.id);
    res.status(200).json({ success: true, data: posts, nextCursor });
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
