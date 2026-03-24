import User from './User';
import Folder from './Folder';
import Flashcard from './Flashcard';
import Course from './Course';
import UserCourse from './UserCourse';

// ==================== Associations ====================

// User → Folders (1:N)
User.hasMany(Folder, { foreignKey: 'user_id', as: 'folders' });
Folder.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// User → Flashcards (1:N)
User.hasMany(Flashcard, { foreignKey: 'user_id', as: 'flashcards' });
Flashcard.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Folder → Flashcards (1:N)
Folder.hasMany(Flashcard, { foreignKey: 'folder_id', as: 'flashcards' });
Flashcard.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });

// User → Courses (1:N, as creator)
User.hasMany(Course, { foreignKey: 'user_id', as: 'courses' });
Course.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });

// User ↔ Course (M:N, through UserCourse)
User.belongsToMany(Course, {
  through: UserCourse,
  foreignKey: 'user_id',
  otherKey: 'course_id',
  as: 'enrolledCourses',
});
Course.belongsToMany(User, {
  through: UserCourse,
  foreignKey: 'course_id',
  otherKey: 'user_id',
  as: 'enrolledUsers',
});

export { User, Folder, Flashcard, Course, UserCourse };
