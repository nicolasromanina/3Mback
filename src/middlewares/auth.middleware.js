/**
 * Middleware d'authentification
 */

const { verifyAccessToken } = require('../config/jwt');
const User = require('../models/User');

/**
 * Middleware pour protéger les routes
 */
const protect = async (req, res, next) => {
  try {
    let token;

    // Vérifier le header Authorization
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Token manquant'
      });
    }

    // Vérifier le token
    const decoded = verifyAccessToken(token);

    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé - Utilisateur non trouvé'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Ce compte a été désactivé'
      });
    }

    // Ajouter l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Non autorisé - Token invalide ou expiré'
    });
  }
};

/**
 * Middleware pour restreindre l'accès par rôle
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non autorisé'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès refusé - Rôle insuffisant'
      });
    }

    next();
  };
};

/**
 * Middleware optionnel d'authentification (ne bloque pas)
 */
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.id).select('-password');
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Ignorer les erreurs - l'utilisateur reste non authentifié
    next();
  }
};

module.exports = {
  protect,
  authorize,
  optionalAuth
};
