const express = require('express');
const router = express.Router();
const { getUserNotifications, markAsRead, markAllAsRead, deleteNotification, getUnreadCount } = require('../controllers/notification.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/user/:userId', protect, getUserNotifications);
router.get('/unread-count', protect, getUnreadCount);
router.patch('/mark-all-read', protect, markAllAsRead);
router.patch('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

module.exports = router;
