/**
 * Routes d'authentification
 */
const express = require('express');
const router = express.Router();
const { register, login, refreshToken, logout, forgotPassword, resetPassword, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');
const { validateBody } = require('../middlewares/validation.middleware');
const { registerSchema, loginSchema, refreshTokenSchema } = require('../validators/auth.validator');

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.post('/refresh-token', validateBody(refreshTokenSchema), refreshToken);
router.post('/logout', protect, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, getMe);

module.exports = router;
