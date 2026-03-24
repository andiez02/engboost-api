import { Response, NextFunction } from 'express';
import { courseService } from './course.service';
import { AuthenticatedRequest } from '../../types';

export const create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.create(req.body, req.user!.id);
    res.status(201).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const courses = await courseService.getAll();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getPublic = async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const courses = await courseService.getPublic();
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.getById(req.params.id as string);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const updateCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const course = await courseService.update(req.params.id as string, req.user!.id, req.body);
    res.status(200).json({ success: true, data: course });
  } catch (error) {
    next(error);
  }
};

export const deleteCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    await courseService.delete(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, message: 'Course deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

export const registerCourse = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const result = await courseService.register(req.params.id as string, req.user!.id);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};

export const getMyRegistered = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    const courses = await courseService.getRegisteredCourses(req.user!.id);
    res.status(200).json({ success: true, data: courses });
  } catch (error) {
    next(error);
  }
};
