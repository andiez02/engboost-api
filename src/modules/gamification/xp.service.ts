import User from '../../models/User';

// Rating → XP map
export const XP_MAP: Record<number, number> = {
  0: 1,  // Again
  1: 3,  // Hard
  2: 5,  // Good
  3: 8,  // Easy
};

/**
 * Calculate level from total XP.
 * level = floor(sqrt(xp / 10)) + 1
 */
export function calculateLevel(xp: number): number {
  return Math.floor(Math.sqrt(xp / 10)) + 1;
}

/**
 * XP required to reach a given level.
 * xp = (level - 1)^2 * 10
 */
export function xpForLevel(level: number): number {
  return (level - 1) ** 2 * 10;
}

export interface XpResult {
  xpGained: number;
  newXp: number;
  newLevel: number;
  leveledUp: boolean;
}

export class XpService {
  /**
   * Award XP to a user based on rating.
   * Detects level-up and persists changes.
   */
  async awardXp(user: User, rating: number): Promise<XpResult> {
    const xpGained = XP_MAP[rating] ?? 1;
    const oldLevel = user.level;

    user.xp += xpGained;
    user.level = calculateLevel(user.xp);

    const leveledUp = user.level > oldLevel;

    // Don't save here — caller (study.service) will save the user
    return {
      xpGained,
      newXp: user.xp,
      newLevel: user.level,
      leveledUp,
    };
  }
}

export const xpService = new XpService();
