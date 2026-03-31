import { User, Achievement, UserAchievement } from '../../models';

// Pre-define hardcoded achievement conditions
interface AchievementRule {
  key: string;
  title: string;
  description: string;
  icon: string | null;
  checkFn: (user: User) => boolean;
}

export const ACHIEVEMENT_RULES: AchievementRule[] = [
  {
    key: 'FIRST_SESSION',
    title: 'Bước Đầu Tiên',
    description: 'Hoàn thành lượt ôn tập đầu tiên.',
    icon: '🎉',
    checkFn: (user: User) => user.total_reviewed >= 1,
  },
  {
    key: 'STREAK_3',
    title: 'Ổn Định Đầu Tiên',
    description: 'Đạt chuỗi học tập 3 ngày liên tiếp.',
    icon: '🔥',
    checkFn: (user: User) => user.streak >= 3,
  },
  {
    key: 'STREAK_7',
    title: 'Chiến Binh Chăm Chỉ',
    description: 'Đạt chuỗi học tập 7 ngày liên tiếp.',
    icon: '🔥',
    checkFn: (user: User) => user.streak >= 7,
  },
  {
    key: 'CARDS_100',
    title: 'Kẻ Huỷ Diệt Thẻ',
    description: 'Hoàn thành ôn tập 100 thẻ.',
    icon: '📚',
    checkFn: (user: User) => user.total_reviewed >= 100,
  },
];

export class AchievementService {
  /**
   * Upsert all predefined achievements into the database.
   * Runs gracefully to ensure DB matches code config.
   */
  async seedAchievements(): Promise<void> {
    for (const rule of ACHIEVEMENT_RULES) {
      await Achievement.upsert({
        key: rule.key,
        title: rule.title,
        description: rule.description,
        icon: rule.icon,
      });
    }
  }

  /**
   * Check and unlock achievements for a user based on rules.
   * Returns newly unlocked achievements.
   */
  async checkAchievements(user: User): Promise<Achievement[]> {
    const newlyUnlocked: Achievement[] = [];

    // Get currently unlocked by this user
    const existingUnlocks = await UserAchievement.findAll({
      where: { user_id: user.id },
      include: [{ model: Achievement, as: 'achievement' }],
    });

    // Extract unlocked keys
    const unlockedKeys = new Set(
      existingUnlocks.map((ua) => (ua as any).achievement.key)
    );

    for (const rule of ACHIEVEMENT_RULES) {
      if (!unlockedKeys.has(rule.key)) {
        // If condition fulfilled, unlock it
        if (rule.checkFn(user)) {
          // Fetch achievement DB instance
          const achievement = await Achievement.findOne({ where: { key: rule.key } });
          if (achievement) {
            await UserAchievement.create({
              user_id: user.id,
              achievement_id: achievement.id,
            });
            newlyUnlocked.push(achievement);
          }
        }
      }
    }

    return newlyUnlocked;
  }
}

export const achievementService = new AchievementService();
