import { User, Challenge, UserChallenge } from '../../models';
import { xpForLevel } from './xp.service';

interface ChallengeDefinition {
  key: string;
  type: string;
  title: string;
  description: string;
  icon: string;
  target: number;
  reward_xp: number;
}

export const CHALLENGE_DEFINITIONS: ChallengeDefinition[] = [
  {
    key: 'REVIEW_20',
    type: 'REVIEW_COUNT',
    title: 'Ôn tập 20 thẻ',
    description: 'Hoàn thành ôn tập 20 thẻ.',
    icon: '📚',
    target: 20,
    reward_xp: 25,
  },
  {
    key: 'STREAK_3',
    type: 'STREAK',
    title: 'Chuỗi 3 ngày',
    description: 'Đạt chuỗi học tập 3 ngày liên tiếp.',
    icon: '🔥',
    target: 3,
    reward_xp: 30,
  },
  {
    key: 'NO_AGAIN_10',
    type: 'NO_AGAIN',
    title: 'Không quên 10 thẻ',
    description: 'Ôn tập 10 thẻ liên tiếp mà không bấm "Quên".',
    icon: '🧠',
    target: 10,
    reward_xp: 20,
  },
];

export class ChallengeService {
  /** Upsert challenge definitions into DB */
  async seedChallenges(): Promise<void> {
    for (const def of CHALLENGE_DEFINITIONS) {
      await Challenge.upsert({
        key: def.key,
        type: def.type,
        title: def.title,
        description: def.description,
        icon: def.icon,
        target: def.target,
        reward_xp: def.reward_xp,
      });
    }
  }

  /** Ensure a user has UserChallenge rows for all challenges */
  async ensureUserChallenges(userId: string): Promise<void> {
    const allChallenges = await Challenge.findAll();
    for (const challenge of allChallenges) {
      await UserChallenge.findOrCreate({
        where: { user_id: userId, challenge_id: challenge.id },
        defaults: { user_id: userId, challenge_id: challenge.id, progress: 0, completed: false },
      });
    }
  }

  /**
   * Update challenge progress after a review.
   * Returns newly completed challenges (with reward_xp for XP awarding).
   */
  async updateProgress(
    user: User,
    rating: number
  ): Promise<{ 
    completedChallenges: Array<{ challenge: Challenge; rewardXp: number }>;
    updatedChallenges: Array<{ id: string; progress: number; completed: boolean }>;
  }> {
    const completedChallenges: Array<{ challenge: Challenge; rewardXp: number }> = [];
    const updatedChallenges: Array<{ id: string; progress: number; completed: boolean }> = [];

    await this.ensureUserChallenges(user.id);

    const userChallenges = await UserChallenge.findAll({
      where: { user_id: user.id, completed: false },
      include: [{ model: Challenge, as: 'challenge' }],
    });

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    for (const uc of userChallenges) {
      const challenge = (uc as any).challenge as Challenge;
      if (!challenge) continue;

      // Reset daily challenges if last reset was before today
      const isDaily = challenge.type === 'REVIEW_COUNT' || challenge.type === 'NO_AGAIN';
      if (isDaily) {
        const lastReset = uc.last_reset_at ? new Date(uc.last_reset_at) : null;
        const resetNeeded = !lastReset || lastReset < todayUTC;
        if (resetNeeded) {
          uc.progress = 0;
          uc.completed = false;
          uc.completed_at = null;
          uc.last_reset_at = todayUTC;
        }
      }

      switch (challenge.type) {
        case 'REVIEW_COUNT':
          uc.progress += 1;
          break;

        case 'STREAK':
          uc.progress = user.streak;
          break;

        case 'NO_AGAIN':
          if (rating === 0) {
            uc.progress = 0;
          } else {
            uc.progress += 1;
          }
          break;
      }

      if (uc.progress >= challenge.target && !uc.completed) {
        uc.completed = true;
        uc.completed_at = new Date();
        user.xp += challenge.reward_xp;
        completedChallenges.push({ challenge, rewardXp: challenge.reward_xp });
      }

      await uc.save();

      updatedChallenges.push({
        id: challenge.id,
        progress: uc.progress,
        completed: uc.completed,
      });
    }

    return { completedChallenges, updatedChallenges };
  }

  /** Get all challenges for a user with progress */
  async getUserChallenges(userId: string): Promise<any[]> {
    await this.ensureUserChallenges(userId);

    const userChallenges = await UserChallenge.findAll({
      where: { user_id: userId },
      include: [{ model: Challenge, as: 'challenge' }],
      order: [['completed', 'ASC'], ['created_at', 'ASC']],
    });

    const todayUTC = new Date();
    todayUTC.setUTCHours(0, 0, 0, 0);

    const results = [];
    for (const uc of userChallenges) {
      const challenge = (uc as any).challenge as Challenge;
      if (!challenge) continue;

      // Reset daily challenges that haven't been reset today
      const isDaily = challenge.type === 'REVIEW_COUNT' || challenge.type === 'NO_AGAIN';
      if (isDaily) {
        const lastReset = uc.last_reset_at ? new Date(uc.last_reset_at) : null;
        if (!lastReset || lastReset < todayUTC) {
          uc.progress = 0;
          uc.completed = false;
          uc.completed_at = null;
          uc.last_reset_at = todayUTC;
          await uc.save();
        }
      }

      results.push({
        id: challenge.id,
        key: challenge.key,
        type: challenge.type,
        title: challenge.title,
        description: challenge.description,
        icon: challenge.icon,
        target: challenge.target,
        rewardXp: challenge.reward_xp,
        progress: uc.progress,
        completed: uc.completed,
        completedAt: uc.completed_at,
      });
    }

    return results;
  }
}

export const challengeService = new ChallengeService();
