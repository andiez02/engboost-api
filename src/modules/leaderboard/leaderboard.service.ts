import User from '../../models/User';
import { Op } from 'sequelize';

// Interfaces
export interface LeaderboardEntry {
  userId: string;
  name: string;
  avatar: string | null;
  weeklyXp: number;
  rank: number;
}

export interface CurrentUserEntry extends LeaderboardEntry {
  xpToNextRank: number | null;
  xpToTop10: number | null;
}

export interface LeaderboardResponse {
  top50: LeaderboardEntry[];
  neighbors: LeaderboardEntry[] | null; // 2 above + me + 2 below, only when rank > 50
  currentUser: CurrentUserEntry;
  weekStartedAt: string;
}

// Cache
interface CacheEntry {
  data: LeaderboardResponse;
  expiresAt: number;
}

let cache: CacheEntry | null = null;
const CACHE_TTL = process.env.NODE_ENV === 'production' ? 60000 : 5000; // 5s dev, 60s prod

// Week tracking
let weekStartedAt: Date | null = null;

/**
 * Returns the most recent Monday 00:00 UTC as a Date
 */
export function getMostRecentMondayUTC(): Date {
  const now = new Date();
  const day = now.getUTCDay(); // 0=Sun, 1=Mon, ...
  const diff = (day === 0 ? 6 : day - 1); // days since Monday
  const monday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - diff));
  return monday;
}

/**
 * Get weekly leaderboard with caching.
 * top50 is cached; neighbors are always computed fresh (per-user data).
 */
export async function getWeeklyLeaderboard(userId: string): Promise<LeaderboardResponse> {
  // Initialize weekStartedAt if not set
  if (!weekStartedAt) {
    weekStartedAt = getMostRecentMondayUTC();
  }

  // ── Cached portion (top50 + weekStartedAt) ──────────────────────────────
  if (!cache || cache.expiresAt <= Date.now()) {
    const top50Users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'weekly_xp'],
      order: [['weekly_xp', 'DESC'], ['id', 'ASC']],
      limit: 50,
    });

    const top50: LeaderboardEntry[] = top50Users.map((user, index) => ({
      userId: user.id,
      name: user.username,
      avatar: user.avatar,
      weeklyXp: user.weekly_xp,
      rank: index + 1,
    }));

    cache = {
      data: { top50, neighbors: null, currentUser: null as any, weekStartedAt: weekStartedAt.toISOString() },
      expiresAt: Date.now() + CACHE_TTL,
    };
  }

  const { top50 } = cache.data;

  // ── Per-user portion (always fresh) ─────────────────────────────────────
  const currentUserData = await User.findByPk(userId, {
    attributes: ['id', 'username', 'avatar', 'weekly_xp'],
  });

  if (!currentUserData) throw new Error('User not found');

  const usersWithHigherXp = await User.count({
    where: {
      [Op.or]: [
        { weekly_xp: { [Op.gt]: currentUserData.weekly_xp } },
        { weekly_xp: currentUserData.weekly_xp, id: { [Op.lt]: currentUserData.id } },
      ],
    },
  });

  const currentUserRank = usersWithHigherXp + 1;

  // xpToNextRank
  let xpToNextRank: number | null = null;
  if (currentUserRank > 1) {
    const nextRankUser = await User.findOne({
      attributes: ['weekly_xp'],
      where: {
        [Op.or]: [
          { weekly_xp: { [Op.gt]: currentUserData.weekly_xp } },
          { weekly_xp: currentUserData.weekly_xp, id: { [Op.lt]: currentUserData.id } },
        ],
      },
      order: [['weekly_xp', 'ASC'], ['id', 'DESC']],
      limit: 1,
    });
    if (nextRankUser) xpToNextRank = nextRankUser.weekly_xp - currentUserData.weekly_xp + 1;
  }

  // xpToTop10
  let xpToTop10: number | null = null;
  if (currentUserRank > 10) {
    const rank10User = await User.findOne({
      attributes: ['weekly_xp'],
      order: [['weekly_xp', 'DESC'], ['id', 'ASC']],
      offset: 9,
      limit: 1,
    });
    if (rank10User) xpToTop10 = rank10User.weekly_xp - currentUserData.weekly_xp + 1;
  }

  // neighbors: 2 above + me + 2 below (only when user is outside top50)
  let neighbors: LeaderboardEntry[] | null = null;
  if (currentUserRank > 50) {
    const offset = Math.max(0, currentUserRank - 3); // 2 above = offset rank-3
    const neighborUsers = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'weekly_xp'],
      order: [['weekly_xp', 'DESC'], ['id', 'ASC']],
      limit: 5,
      offset,
    });
    neighbors = neighborUsers.map((user, i) => ({
      userId: user.id,
      name: user.username,
      avatar: user.avatar,
      weeklyXp: user.weekly_xp,
      rank: offset + i + 1,
    }));
  }

  const currentUser: CurrentUserEntry = {
    userId: currentUserData.id,
    name: currentUserData.username,
    avatar: currentUserData.avatar,
    weeklyXp: currentUserData.weekly_xp,
    rank: currentUserRank,
    xpToNextRank,
    xpToTop10,
  };

  return {
    top50,
    neighbors,
    currentUser,
    weekStartedAt: weekStartedAt.toISOString(),
  };
}

export interface LevelLeaderboardEntry {
  userId: string;
  name: string;
  avatar: string | null;
  level: number;
  xp: number;
  rank: number;
}

export interface LevelLeaderboardResponse {
  top50: LevelLeaderboardEntry[];
  neighbors: LevelLeaderboardEntry[] | null;
  currentUser: LevelLeaderboardEntry;
}

// Level leaderboard cache
interface LevelCacheEntry {
  data: LevelLeaderboardResponse;
  expiresAt: number;
}

let levelCache: LevelCacheEntry | null = null;
const LEVEL_CACHE_TTL = process.env.NODE_ENV === 'production' ? 60000 : 5000;

/**
 * Get level leaderboard with caching.
 * top50 is cached; neighbors are always computed fresh (per-user data).
 */
export async function getLevelLeaderboard(userId: string): Promise<LevelLeaderboardResponse> {
  if (!levelCache || levelCache.expiresAt <= Date.now()) {
    const top50Users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'level', 'xp'],
      order: [['level', 'DESC'], ['xp', 'DESC'], ['id', 'ASC']],
      limit: 50,
    });

    const top50: LevelLeaderboardEntry[] = top50Users.map((user, index) => ({
      userId: user.id,
      name: user.username,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      rank: index + 1,
    }));

    levelCache = {
      data: { top50, neighbors: null, currentUser: null as any },
      expiresAt: Date.now() + LEVEL_CACHE_TTL,
    };
  }

  const { top50 } = levelCache.data;

  const currentUserData = await User.findByPk(userId, {
    attributes: ['id', 'username', 'avatar', 'level', 'xp'],
  });

  if (!currentUserData) throw new Error('User not found');

  const usersAbove = await User.count({
    where: {
      [Op.or]: [
        { level: { [Op.gt]: currentUserData.level } },
        { level: currentUserData.level, xp: { [Op.gt]: currentUserData.xp } },
        { level: currentUserData.level, xp: currentUserData.xp, id: { [Op.lt]: currentUserData.id } },
      ],
    },
  });

  const currentUserRank = usersAbove + 1;

  // neighbors when outside top50
  let neighbors: LevelLeaderboardEntry[] | null = null;
  if (currentUserRank > 50) {
    const offset = Math.max(0, currentUserRank - 3);
    const neighborUsers = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'level', 'xp'],
      order: [['level', 'DESC'], ['xp', 'DESC'], ['id', 'ASC']],
      limit: 5,
      offset,
    });
    neighbors = neighborUsers.map((user, i) => ({
      userId: user.id,
      name: user.username,
      avatar: user.avatar,
      level: user.level,
      xp: user.xp,
      rank: offset + i + 1,
    }));
  }

  const currentUser: LevelLeaderboardEntry = {
    userId: currentUserData.id,
    name: currentUserData.username,
    avatar: currentUserData.avatar,
    level: currentUserData.level,
    xp: currentUserData.xp,
    rank: currentUserRank,
  };

  return { top50, neighbors, currentUser };
}


export async function resetWeeklyXp(): Promise<void> {
  await User.update(
    { weekly_xp: 0 },
    { where: {} }
  );
  weekStartedAt = getMostRecentMondayUTC();
}

// ─── Streak Leaderboard ───────────────────────────────────────────────────────

export interface StreakLeaderboardEntry {
  userId: string;
  name: string;
  avatar: string | null;
  streak: number;
  rank: number;
}

export interface StreakLeaderboardResponse {
  top50: StreakLeaderboardEntry[];
  neighbors: StreakLeaderboardEntry[] | null;
  currentUser: StreakLeaderboardEntry;
}

let streakCache: { data: StreakLeaderboardResponse; expiresAt: number } | null = null;
const STREAK_CACHE_TTL = process.env.NODE_ENV === 'production' ? 60000 : 5000;

export async function getStreakLeaderboard(userId: string): Promise<StreakLeaderboardResponse> {
  if (!streakCache || streakCache.expiresAt <= Date.now()) {
    const top50Users = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'streak'],
      order: [['streak', 'DESC'], ['id', 'ASC']],
      limit: 50,
    });

    const top50: StreakLeaderboardEntry[] = top50Users.map((user, index) => ({
      userId: user.id,
      name: user.username,
      avatar: user.avatar,
      streak: user.streak,
      rank: index + 1,
    }));

    streakCache = {
      data: { top50, neighbors: null, currentUser: null as any },
      expiresAt: Date.now() + STREAK_CACHE_TTL,
    };
  }

  const { top50 } = streakCache.data;

  const currentUserData = await User.findByPk(userId, {
    attributes: ['id', 'username', 'avatar', 'streak'],
  });
  if (!currentUserData) throw new Error('User not found');

  const usersAbove = await User.count({
    where: {
      [Op.or]: [
        { streak: { [Op.gt]: currentUserData.streak } },
        { streak: currentUserData.streak, id: { [Op.lt]: currentUserData.id } },
      ],
    },
  });

  const currentUserRank = usersAbove + 1;

  let neighbors: StreakLeaderboardEntry[] | null = null;
  if (currentUserRank > 50) {
    const offset = Math.max(0, currentUserRank - 3);
    const neighborUsers = await User.findAll({
      attributes: ['id', 'username', 'avatar', 'streak'],
      order: [['streak', 'DESC'], ['id', 'ASC']],
      limit: 5,
      offset,
    });
    neighbors = neighborUsers.map((user, i) => ({
      userId: user.id,
      name: user.username,
      avatar: user.avatar,
      streak: user.streak,
      rank: offset + i + 1,
    }));
  }

  return {
    top50,
    neighbors,
    currentUser: {
      userId: currentUserData.id,
      name: currentUserData.username,
      avatar: currentUserData.avatar,
      streak: currentUserData.streak,
      rank: currentUserRank,
    },
  };
}

/**
 * Invalidate the cache
 */
export function invalidateCache(): void {
  cache = null;
}
