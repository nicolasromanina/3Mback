const express = require('express');
const router = express.Router();
const { getProfile, updateProfile, changePassword, deleteAccount, getAllUsers, getUserById, updateUser } = require('../controllers/user.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/me', protect, getProfile);
router.patch('/me', protect, updateProfile);
router.patch('/me/password', protect, changePassword);
router.delete('/me', protect, deleteAccount);
router.get('/', protect, authorize('admin'), getAllUsers);
router.get('/:id', protect, authorize('admin'), getUserById);
router.patch('/:id', protect, authorize('admin'), updateUser);

module.exports = router;
