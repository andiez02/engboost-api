import { Notification } from '../../models';

class NotificationService {
  /**
   * Get all notifications for a user, ordered by latest first
   */
  async getNotifications(userId: string) {
    return Notification.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
    });
  }

  /**
   * Mark a specific notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    const notification = await Notification.findOne({
      where: { id: notificationId, user_id: userId },
    });

    if (!notification) {
      return null;
    }

    notification.is_read = true;
    await notification.save();
    return notification;
  }

  /**
   * Mark all unread notifications as read for a user
   */
  async markAllAsRead(userId: string) {
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );
  }

  /**
   * Create a notification (utility method for other services/jobs)
   */
  async createNotification(data: { user_id: string; type: string; title: string; message: string }) {
    return Notification.create(data);
  }
}

export const notificationService = new NotificationService();
