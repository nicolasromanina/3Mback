/**
 * Contrôleur d'authentification
 */

const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   POST /api/auth/register
 * @desc    Inscription d'un nouvel utilisateur
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);

  res.status(201).json({
    success: true,
    message: 'Inscription réussie',
    data: result
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Connexion d'un utilisateur
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login(email, password);

  res.status(200).json({
    success: true,
    message: 'Connexion réussie',
    data: result
  });
});

/**
 * @route   POST /api/auth/refresh-token
 * @desc    Rafraîchir le token d'accès
 * @access  Public
 */
const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const tokens = await authService.refreshToken(refreshToken);

  res.status(200).json({
    success: true,
    data: tokens
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Déconnexion
 * @access  Private
 */
const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Demande de réinitialisation de mot de passe
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  await authService.forgotPassword(req.body.email);

  res.status(200).json({
    success: true,
    message: 'Si cet email existe, un lien de réinitialisation a été envoyé'
  });
});

/**
 * @route   POST /api/auth/reset-password
 * @desc    Réinitialiser le mot de passe
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, password } = req.body;
  await authService.resetPassword(token, password);

  res.status(200).json({
    success: true,
    message: 'Mot de passe réinitialisé avec succès'
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Obtenir l'utilisateur connecté
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: req.user
  });
});

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  getMe
};
