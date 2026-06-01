import cron from 'node-cron';
import { Op } from 'sequelize';
import User from '../models/User';
import Notification from '../models/Notification';
import { differenceInDays, startOfDay } from 'date-fns';

export function startStreakWarningJob(): void {
  // Run every day at 20:00 UTC+7 (which is 13:00 UTC if server on UTC, but we force timezone so it runs at 20:00 server local time with timezone mapped to Asia/Ho_Chi_Minh)
  cron.schedule('0 20 * * *', async () => {
    try {
      console.log('[StreakWarningJob] Running check for missed streaks at', new Date().toISOString());
      
      const today = startOfDay(new Date());

      // Find all users who have streak > 0
      const activeUsers = await User.findAll({
        where: {
          streak: {
            [Op.gt]: 0
          }
        }
      });

      const usersToNotify = activeUsers.filter(user => {
        // If they never studied, or last studied before today, they haven't studied today
        if (!user.last_study_date) return true;
        const lastStudy = startOfDay(user.last_study_date);
        return lastStudy < today;
      });

      if (usersToNotify.length === 0) {
        console.log('[StreakWarningJob] No users are at risk of losing their streak.');
        return;
      }

      // Create notifications in bulk
      const notificationsData = usersToNotify.map(user => ({
        user_id: user.id,
        type: 'STREAK_WARNING',
        title: 'Cảnh báo mất chuỗi! 🔥',
        message: 'Bạn chưa học từ vựng hôm nay. Hãy hoàn thành bài học ngay để duy trì chuỗi học tập nhé!',
        is_read: false
      }));

      await Notification.bulkCreate(notificationsData);

      console.log(`[StreakWarningJob] Inserted streak warnings for ${usersToNotify.length} users.`);
    } catch (error) {
      console.error('[StreakWarningJob] Failed to run job:', error);
    }
  }, { timezone: 'Asia/Ho_Chi_Minh' });
}
