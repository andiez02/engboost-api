import { Course, UserCourse } from '../../models';
import { ApiError } from '../../utils/ApiError';

export class CourseService {
  async create(data: any, userId: string) {
    const course = await Course.create({
      ...data,
      user_id: userId,
    });
    return course;
  }

  async getAll() {
    return Course.findAll({
      order: [['created_at', 'DESC']],
    });
  }

  async getPublic() {
    return Course.findAll({
      where: { is_public: true },
      order: [['created_at', 'DESC']],
    });
  }

  async getById(courseId: string) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }
    return course;
  }

  async update(courseId: string, userId: string, updateData: any) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }
    if (course.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to update this course.');
    }

    await course.update(updateData);
    return course;
  }

  async delete(courseId: string, userId: string) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }
    if (course.user_id !== userId) {
      throw new ApiError(403, 'You do not have permission to delete this course.');
    }

    // Delete all user-course registrations first
    await UserCourse.destroy({ where: { course_id: courseId } });
    await course.destroy();
    return course;
  }

  async register(courseId: string, userId: string) {
    const course = await Course.findByPk(courseId);
    if (!course) {
      throw new ApiError(404, 'Course not found.');
    }

    const existing = await UserCourse.findOne({
      where: { user_id: userId, course_id: courseId },
    });
    if (existing) {
      throw new ApiError(400, 'You have already registered for this course.');
    }

    await UserCourse.create({ user_id: userId, course_id: courseId });
    return { message: 'Registered successfully.' };
  }

  async getRegisteredCourses(userId: string) {
    return UserCourse.findAll({
      where: { user_id: userId },
      include: [{ model: Course, as: 'course' }],
    });
  }
}

export const courseService = new CourseService();
