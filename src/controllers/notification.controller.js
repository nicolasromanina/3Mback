/**
 * Contrôleur des notifications
 */

const notificationService = require('../services/notification.service');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   GET /api/notifications/user/:userId
 * @desc    Obtenir les notifications d'un utilisateur
 * @access  Private
 */
const getUserNotifications = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur accède à ses propres notifications
  const userId = req.params.userId;
  
  if (req.user.role !== 'admin' && req.user.id !== userId) {
    return res.status(403).json({
      success: false,
      message: 'Accès non autorisé'
    });
  }

  const result = await notificationService.getUserNotifications(userId, req.query);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   PATCH /api/notifications/:id/read
 * @desc    Marquer une notification comme lue
 * @access  Private
 */
const markAsRead = asyncHandler(async (req, res) => {
  const notification = await notificationService.markAsRead(
    req.params.id,
    req.user.id
  );

  res.status(200).json({
    success: true,
    data: notification
  });
});

/**
 * @route   PATCH /api/notifications/mark-all-read
 * @desc    Marquer toutes les notifications comme lues
 * @access  Private
 */
const markAllAsRead = asyncHandler(async (req, res) => {
  await notificationService.markAllAsRead(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Toutes les notifications ont été marquées comme lues'
  });
});

/**
 * @route   DELETE /api/notifications/:id
 * @desc    Supprimer une notification
 * @access  Private
 */
const deleteNotification = asyncHandler(async (req, res) => {
  await notificationService.deleteNotification(req.params.id, req.user.id);

  res.status(200).json({
    success: true,
    message: 'Notification supprimée'
  });
});

/**
 * @route   GET /api/notifications/unread-count
 * @desc    Obtenir le nombre de notifications non lues
 * @access  Private
 */
const getUnreadCount = asyncHandler(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.user.id);

  res.status(200).json({
    success: true,
    data: { count }
  });
});

module.exports = {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount
};
