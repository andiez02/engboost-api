import User from './User';
import Folder from './Folder';
import Flashcard from './Flashcard';
import Course from './Course';
import UserCourse from './UserCourse';
import Achievement from './Achievement';
import UserAchievement from './UserAchievement';
import ReviewLog from './ReviewLog';
import Challenge from './Challenge';
import UserChallenge from './UserChallenge';
import Post from './Post';
import PostLike from './PostLike';
import PostSave from './PostSave';

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
Course.belongsTo(User, { foreignKey: 'user_id', as: 'instructor' });

// Achievements
User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'user_id', as: 'achievements' });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievement_id', as: 'users' });
User.hasMany(UserAchievement, { foreignKey: 'user_id', as: 'userAchieved' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id' });
Achievement.hasMany(UserAchievement, { foreignKey: 'achievement_id' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id', as: 'achievement' });

// ReviewLogs
User.hasMany(ReviewLog, { foreignKey: 'user_id', as: 'reviewLogs' });
ReviewLog.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Flashcard.hasMany(ReviewLog, { foreignKey: 'card_id', as: 'reviews' });
ReviewLog.belongsTo(Flashcard, { foreignKey: 'card_id', as: 'card' });

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

// Challenges
User.hasMany(UserChallenge, { foreignKey: 'user_id', as: 'userChallenges' });
UserChallenge.belongsTo(User, { foreignKey: 'user_id' });
Challenge.hasMany(UserChallenge, { foreignKey: 'challenge_id' });
UserChallenge.belongsTo(Challenge, { foreignKey: 'challenge_id', as: 'challenge' });

// Post associations
User.hasMany(Post, { foreignKey: 'user_id', as: 'posts' });
Post.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
Folder.hasMany(Post, { foreignKey: 'folder_id', as: 'posts' });
Post.belongsTo(Folder, { foreignKey: 'folder_id', as: 'folder' });

// PostLike associations
Post.hasMany(PostLike, { foreignKey: 'post_id', as: 'likes' });
PostLike.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(PostLike, { foreignKey: 'user_id', as: 'postLikes' });
PostLike.belongsTo(User, { foreignKey: 'user_id' });

// PostSave associations
Post.hasMany(PostSave, { foreignKey: 'post_id', as: 'saves' });
PostSave.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(PostSave, { foreignKey: 'user_id', as: 'postSaves' });
PostSave.belongsTo(User, { foreignKey: 'user_id' });

export { User, Folder, Flashcard, Course, UserCourse, Achievement, UserAchievement, ReviewLog, Challenge, UserChallenge, Post, PostLike, PostSave };
