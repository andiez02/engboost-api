import { Op } from 'sequelize';
import { startOfDay, isSameDay, differenceInDays } from 'date-fns';
import { Flashcard, User, ReviewLog, LexicalEntry } from '../../models';
import { ApiError } from '../../utils/ApiError';
import { processLearningStep } from '../../utils/srsEngine';
import { achievementService } from '../gamification/achievement.service';
import { xpService, xpForLevel, calculateLevel } from '../gamification/xp.service';
import { challengeService } from '../gamification/challenge.service';
import { toFlashcardResponseList, FlashcardResponse } from '../flashcard/flashcard.mapper';
import { modeSelectionService } from './modeSelection.service';
import { mcqGeneratorService } from './mcqGenerator.service';

export class StudyService {
  /** GET /study — due cards for a user, optionally filtered by folder */
  async getDueCards(userId: string, folderId?: string): Promise<FlashcardResponse[]> {
    const where: Record<string, unknown> = {
      user_id: userId,
      next_review_at: { [Op.lte]: new Date() },
    };
    if (folderId) where.folder_id = folderId;

    const cards = await Flashcard.findAll({
      where,
      order: [['next_review_at', 'ASC']],
      include: [{ model: LexicalEntry, as: 'lexicalEntry' }],
      limit: 20,
    });
    return toFlashcardResponseList(cards);
  }

  /** POST /review — apply learning step / SM-2 rating and persist */
  async reviewCard(cardId: string, userId: string, rating: 0 | 1 | 2 | 3, responseTimeMs: number | null = null): Promise<{
    nextReviewAt: Date;
    interval: number;
    easeFactor: number;
    state: 'new' | 'learning' | 'review' | 'relearning';
    unlockedAchievements: any[];
    xpGained: number;
    leveledUp: boolean;
    newLevel: number;
    newXp: number;
    completedChallenges: any[];
    updatedChallenges: Array<{ id: string; progress: number; completed: boolean }>;
  }> {
    // Eager load lexicalEntry to avoid re-fetch
    const card = await Flashcard.findByPk(cardId, {
      include: [{ model: LexicalEntry, as: 'lexicalEntry' }]
    });
    if (!card) throw new ApiError(404, 'Flashcard not found.');
    if (card.user_id !== userId) throw new ApiError(403, 'Forbidden.');

    const user = await User.findByPk(userId);
    if (!user) throw new ApiError(404, 'User not found.');

    const today = startOfDay(new Date());
    const last = user.last_study_date ? startOfDay(user.last_study_date) : null;

    if (!last) {
      user.streak = 1;
    } else if (isSameDay(today, last)) {
      // do nothing
    } else if (differenceInDays(today, last) === 1) {
      user.streak += 1;
    } else {
      user.streak = 1;
    }

    user.last_study_date = new Date();
    user.total_reviewed += 1;

    // Log the review
    await ReviewLog.create({
      user_id: user.id,
      card_id: card.id,
      rating,
      response_time_ms: responseTimeMs,
    });

    // Check for achievements
    const unlockedAchievements = await achievementService.checkAchievements(user);

    // Award XP
    const xpResult = await xpService.awardXp(user, rating);

    // Update challenge progress (may also award bonus XP)
    const { completedChallenges, updatedChallenges } = await challengeService.updateProgress(user, rating);

    // Recalculate level after potential challenge bonus XP
    user.level = calculateLevel(user.xp);
    if (user.level > xpResult.newLevel) {
      xpResult.leveledUp = true;
      xpResult.newLevel = user.level;
    }
    xpResult.newXp = user.xp;

    // Save user once with all changes
    await user.save();

    const result = processLearningStep(
      {
        is_learning: card.is_learning,
        learning_step: card.learning_step,
        repetition: card.repetition,
        interval: card.interval,
        ease_factor: card.ease_factor,
      },
      rating
    );

    card.is_learning = result.is_learning;
    card.learning_step = result.learning_step;
    card.repetition = result.repetition;
    card.interval = result.interval;
    card.ease_factor = result.ease_factor;
    card.next_review_at = result.next_review_at;
    card.last_reviewed_at = result.last_reviewed_at;

    await card.save();

    // Derive state from post-save SRS fields
    const deriveState = (isLearning: boolean, repetition: number): 'new' | 'learning' | 'review' | 'relearning' => {
      if (!isLearning && repetition > 0) return 'review';
      if (isLearning && repetition > 0) return 'relearning';
      if (isLearning && repetition === 0) return 'learning';
      return 'new';
    };

    return {
      nextReviewAt: card.next_review_at,
      interval: card.interval,
      easeFactor: card.ease_factor,
      state: deriveState(card.is_learning, card.repetition),
      unlockedAchievements,
      xpGained: xpResult.xpGained,
      leveledUp: xpResult.leveledUp,
      newLevel: xpResult.newLevel,
      newXp: xpResult.newXp,
      completedChallenges: completedChallenges.map((cc) => ({
        id: cc.challenge.id,
        title: cc.challenge.title,
        icon: cc.challenge.icon,
        rewardXp: cc.rewardXp,
      })),
      updatedChallenges,
    };
  }

  /** GET /study/stats — due count + reviewed today + next upcoming review + streak + dailyGoal + xp/level + challenges */
  async getStats(userId: string): Promise<{
    due: number; overdueCount: number; dueTodayCount: number; reviewedToday: number;
    nextReviewAt: Date | null; streak: number; dailyGoal: number;
    xp: number; level: number; xpForNextLevel: number; xpForCurrentLevel: number;
    challenges: any[];
  }> {
    const now = new Date();

    // Start of today in UTC
    const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    const [due, overdueCount, reviewedToday, nextCard, user] = await Promise.all([
      Flashcard.count({
        where: { user_id: userId, next_review_at: { [Op.lte]: now } },
      }),
      Flashcard.count({
        where: { user_id: userId, next_review_at: { [Op.lt]: startOfDay } },
      }),
      Flashcard.count({
        where: { user_id: userId, last_reviewed_at: { [Op.gte]: startOfDay } },
      }),
      Flashcard.findOne({
        where: { user_id: userId, next_review_at: { [Op.gt]: now } },
        order: [['next_review_at', 'ASC']],
        attributes: ['next_review_at'],
      }),
      User.findByPk(userId, { attributes: ['streak', 'daily_goal', 'xp', 'level'] })
    ]);

    const dueTodayCount = Math.max(0, due - overdueCount);
    const streak = user?.streak ?? 0;
    const dailyGoal = user?.daily_goal ?? 20;
    const xp = user?.xp ?? 0;
    const level = user?.level ?? 1;
    const xpNext = xpForLevel(level + 1);
    const xpCurrent = xpForLevel(level);

    // Get challenges with real progress from DB
    const challenges = await challengeService.getUserChallenges(userId);

    return {
      due,
      overdueCount,
      dueTodayCount,
      reviewedToday,
      nextReviewAt: nextCard?.next_review_at ?? null,
      streak,
      dailyGoal,
      xp,
      level,
      xpForNextLevel: xpNext,
      xpForCurrentLevel: xpCurrent,
      challenges,
    };
  }

  /**
   * GET /study — priority-ordered session cards with stats
   * Returns cards classified into four buckets: learning, overdue, due, and new
   */
  async getSessionCards(
    userId: string,
    folderId?: string
  ): Promise<{
    learning: FlashcardResponse[];
    overdue: FlashcardResponse[];
    due: FlashcardResponse[];
    newCards: FlashcardResponse[];
    stats: { due: number; overdueCount: number; dueTodayCount: number; reviewedToday: number; streak: number; dailyGoal: number; xp: number; level: number; xpForNextLevel: number; xpForCurrentLevel: number; challenges: any[] };
    nextReviewAt: Date | null;
  }> {
    const now = new Date();
    const overdueThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000); // now - 24h

    const baseWhere: Record<string, unknown> = { user_id: userId };
    if (folderId) baseWhere.folder_id = folderId;

    // Run all 6 queries in parallel
    const [learning, overdue, due, newCards, stats, nextCard] = await Promise.all([
      // Learning: is_learning = true AND next_review_at <= now
      Flashcard.findAll({
        where: {
          ...baseWhere,
          is_learning: true,
          next_review_at: { [Op.lte]: now },
        },
        order: [['next_review_at', 'ASC']],
        include: [{ model: LexicalEntry, as: 'lexicalEntry' }],
        limit: 20,
      }),

      // Overdue: is_learning = false AND repetition > 0 AND next_review_at < overdueThreshold
      Flashcard.findAll({
        where: {
          ...baseWhere,
          is_learning: false,
          repetition: { [Op.gt]: 0 },
          next_review_at: { [Op.lt]: overdueThreshold },
        },
        order: [['next_review_at', 'ASC']],
        include: [{ model: LexicalEntry, as: 'lexicalEntry' }],
        limit: 20,
      }),

      // Due: is_learning = false AND repetition > 0 AND overdueThreshold <= next_review_at <= now
      Flashcard.findAll({
        where: {
          ...baseWhere,
          is_learning: false,
          repetition: { [Op.gt]: 0 },
          next_review_at: {
            [Op.gte]: overdueThreshold,
            [Op.lte]: now,
          },
        },
        order: [['next_review_at', 'ASC']],
        include: [{ model: LexicalEntry, as: 'lexicalEntry' }],
        limit: 20,
      }),

      // New cards: is_learning = true AND repetition = 0 (not yet due)
      Flashcard.findAll({
        where: {
          ...baseWhere,
          is_learning: true,
          repetition: 0,
          next_review_at: { [Op.gt]: now },
        },
        order: [['created_at', 'ASC']],
        include: [{ model: LexicalEntry, as: 'lexicalEntry' }],
        limit: 10,
      }),

      // Stats
      this.getStats(userId),

      // Next review: earliest upcoming card where next_review_at > now
      Flashcard.findOne({
        where: {
          ...baseWhere,
          next_review_at: { [Op.gt]: now },
        },
        order: [['next_review_at', 'ASC']],
        attributes: ['next_review_at'],
      }),
    ]);

    // Phase 2: Enrich each card with studyMode and options
    const enrichCard = async (card: Flashcard): Promise<FlashcardResponse> => {
      const base = toFlashcardResponseList([card])[0];
      const lexicalEntry = (card as any).lexicalEntry as LexicalEntry | null;

      // Select study mode
      const studyMode = modeSelectionService.selectMode({
        flashcard: card,
        lexicalEntry,
      });

      // Generate MCQ options if mode is multiple_choice
      let options: string[] | undefined;
      if (studyMode === 'multiple_choice' && lexicalEntry) {
        const mcqResult = await mcqGeneratorService.generateOptions({
          flashcard: card,
          lexicalEntry,
          userId,
          folderId,
        });

        if (mcqResult) {
          options = mcqResult.options;
        } else {
          // Fallback to recall if MCQ generation fails
          return { ...base, studyMode: 'recall' };
        }
      }

      return {
        ...base,
        studyMode,
        options,
      };
    };

    return { 
      learning: await Promise.all(learning.map(enrichCard)), 
      overdue: await Promise.all(overdue.map(enrichCard)), 
      due: await Promise.all(due.map(enrichCard)), 
      newCards: await Promise.all(newCards.map(enrichCard)), 
      stats, 
      nextReviewAt: nextCard?.next_review_at ?? null 
    };
  }
}

export const studyService = new StudyService();
