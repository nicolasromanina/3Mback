/**
 * Contrôleur utilisateur
 */

const userService = require('../services/user.service');
const authService = require('../services/auth.service');
const { asyncHandler } = require('../middlewares/error.middleware');

/**
 * @route   GET /api/users/me
 * @desc    Obtenir le profil de l'utilisateur connecté
 * @access  Private
 */
const getProfile = asyncHandler(async (req, res) => {
  const user = await userService.getProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @route   PATCH /api/users/me
 * @desc    Mettre à jour le profil
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const user = await userService.updateProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Profil mis à jour avec succès',
    data: user
  });
});

/**
 * @route   PATCH /api/users/me/password
 * @desc    Changer le mot de passe
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  await authService.changePassword(req.user.id, currentPassword, newPassword);

  res.status(200).json({
    success: true,
    message: 'Mot de passe changé avec succès'
  });
});

/**
 * @route   DELETE /api/users/me
 * @desc    Supprimer le compte
 * @access  Private
 */
const deleteAccount = asyncHandler(async (req, res) => {
  await userService.deleteAccount(req.user.id);

  res.status(200).json({
    success: true,
    message: 'Compte supprimé avec succès'
  });
});

/**
 * @route   GET /api/users
 * @desc    Obtenir tous les utilisateurs (admin)
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const result = await userService.getAllUsers(req.query);

  res.status(200).json({
    success: true,
    ...result
  });
});

/**
 * @route   GET /api/users/:id
 * @desc    Obtenir un utilisateur par ID (admin)
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res) => {
  const user = await userService.getUserById(req.params.id);

  res.status(200).json({
    success: true,
    data: user
  });
});

/**
 * @route   PATCH /api/users/:id
 * @desc    Mettre à jour un utilisateur (admin)
 * @access  Private/Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await userService.updateUser(req.params.id, req.body);

  res.status(200).json({
    success: true,
    message: 'Utilisateur mis à jour avec succès',
    data: user
  });
});

/**
 * @route   GET /api/users/:id/stats
 * @desc    Obtenir les statistiques d'un utilisateur
 * @access  Private/Admin
 */
const getUserStats = asyncHandler(async (req, res) => {
  const stats = await userService.getUserStats(req.params.id);

  res.status(200).json({
    success: true,
    data: stats
  });
});

module.exports = {
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  getAllUsers,
  getUserById,
  updateUser,
  getUserStats
};
