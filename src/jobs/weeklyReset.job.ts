import cron from 'node-cron';
import { resetWeeklyXp, invalidateCache } from '../modules/leaderboard/leaderboard.service';

export function startWeeklyResetJob(): void {
  // Every Monday at 00:00 UTC
  cron.schedule('0 0 * * 1', async () => {
    try {
      await resetWeeklyXp();
      invalidateCache();
      console.log('[WeeklyResetJob] Weekly XP reset completed at', new Date().toISOString());
    } catch (error) {
      console.error('[WeeklyResetJob] Failed to reset weekly XP:', error);
    }
  }, { timezone: 'UTC' });
}
