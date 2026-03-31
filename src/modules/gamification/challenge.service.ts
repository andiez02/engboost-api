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

    // Ensure user has all challenge rows
    await this.ensureUserChallenges(user.id);

    const userChallenges = await UserChallenge.findAll({
      where: { user_id: user.id, completed: false },
      include: [{ model: Challenge, as: 'challenge' }],
    });

    for (const uc of userChallenges) {
      const challenge = (uc as any).challenge as Challenge;
      if (!challenge) continue;

      let shouldIncrement = false;

      switch (challenge.type) {
        case 'REVIEW_COUNT':
          // Progress = total_reviewed (absolute)
          uc.progress = user.total_reviewed;
          shouldIncrement = true;
          break;

        case 'STREAK':
          // Progress = current streak (absolute)
          uc.progress = user.streak;
          shouldIncrement = true;
          break;

        case 'NO_AGAIN':
          // Increment if rating > 0 (not Again), reset if rating === 0
          if (rating === 0) {
            uc.progress = 0;
          } else {
            uc.progress += 1;
          }
          shouldIncrement = true;
          break;
      }

      if (shouldIncrement && uc.progress >= challenge.target && !uc.completed) {
        uc.completed = true;
        uc.completed_at = new Date();

        // Award bonus XP to user
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

    return userChallenges.map((uc) => {
      const challenge = (uc as any).challenge as Challenge;
      return {
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
      };
    });
  }
}

export const challengeService = new ChallengeService();
