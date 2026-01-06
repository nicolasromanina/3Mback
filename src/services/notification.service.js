/**
 * Service des notifications
 */

const Notification = require('../models/Notification');
const { AppError } = require('../middlewares/error.middleware');
const { emitNotification } = require('../config/socket');

class NotificationService {
  /**
   * Obtenir les notifications d'un utilisateur
   */
  async getUserNotifications(userId, query = {}) {
    const { read, page = 1, limit = 20 } = query;

    const filter = { userId };

    if (read !== undefined) {
      filter.read = read === 'true' || read === true;
    }

    const skip = (page - 1) * limit;

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, read: false })
    ]);

    return {
      data: notifications,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Créer une notification
   */
  async createNotification(notificationData) {
    const notification = await Notification.create(notificationData);

    // Émettre via socket
    try {
      emitNotification(notificationData.userId.toString(), notification.toJSON());
    } catch (error) {
      console.error('Erreur émission socket:', error);
    }

    return notification;
  }

  /**
   * Marquer une notification comme lue
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new AppError('Notification non trouvée', 404);
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  }

  /**
   * Marquer toutes les notifications comme lues
   */
  async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, read: false },
      { read: true, readAt: new Date() }
    );

    return true;
  }

  /**
   * Supprimer une notification
   */
  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      userId
    });

    if (!notification) {
      throw new AppError('Notification non trouvée', 404);
    }

    return true;
  }

  /**
   * Supprimer les anciennes notifications
   */
  async deleteOldNotifications(daysOld = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await Notification.deleteMany({
      createdAt: { $lt: cutoffDate },
      read: true
    });

    return result.deletedCount;
  }

  /**
   * Obtenir le nombre de notifications non lues
   */
  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ userId, read: false });
    return count;
  }
}

module.exports = new NotificationService();
