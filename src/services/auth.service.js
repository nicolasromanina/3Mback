/**
 * Service d'authentification
 */

const User = require('../models/User');
const { generateTokens, verifyRefreshToken } = require('../config/jwt');
const { AppError } = require('../middlewares/error.middleware');

class AuthService {
  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(userData) {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      throw new AppError('Cet email est déjà utilisé', 400);
    }

    // Créer l'utilisateur
    const user = await User.create(userData);

    // Générer les tokens
    const tokens = generateTokens(user);

    // Sauvegarder le refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: user.toPublic(),
      tokens
    };
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(email, password) {
    // Trouver l'utilisateur avec le mot de passe
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    if (!user.isActive) {
      throw new AppError('Ce compte a été désactivé', 401);
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Générer les tokens
    const tokens = generateTokens(user);

    // Mettre à jour le refresh token et la dernière connexion
    user.refreshToken = tokens.refreshToken;
    user.lastLogin = new Date();
    await user.save();

    return {
      user: user.toPublic(),
      tokens
    };
  }

  /**
   * Rafraîchir le token d'accès
   */
  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new AppError('Refresh token requis', 400);
    }

    // Vérifier le refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Trouver l'utilisateur
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 401);
    }

    if (!user.isActive) {
      throw new AppError('Ce compte a été désactivé', 401);
    }

    // Vérifier que le refresh token correspond
    if (user.refreshToken !== refreshToken) {
      throw new AppError('Refresh token invalide', 401);
    }

    // Générer de nouveaux tokens
    const tokens = generateTokens(user);

    // Mettre à jour le refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return tokens;
  }

  /**
   * Déconnexion
   */
  async logout(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
    return true;
  }

  /**
   * Demande de réinitialisation de mot de passe
   */
  async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      // Ne pas révéler si l'email existe ou non
      return true;
    }

    // Générer un token de réinitialisation
    const resetToken = require('crypto').randomBytes(32).toString('hex');
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    // TODO: Envoyer l'email avec le lien de réinitialisation
    // emailService.sendPasswordResetEmail(user.email, resetToken);

    return true;
  }

  /**
   * Réinitialisation du mot de passe
   */
  async resetPassword(token, newPassword) {
    const hashedToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      throw new AppError('Token invalide ou expiré', 400);
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return true;
  }

  /**
   * Changement de mot de passe
   */
  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    user.password = newPassword;
    await user.save();

    return true;
  }
}

module.exports = new AuthService();
