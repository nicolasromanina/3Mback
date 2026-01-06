/**
 * Configuration JWT
 */

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_jwt_key_minimum_32_characters_long';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_minimum_32_characters_long';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

/**
 * Génère un token d'accès
 */
const generateAccessToken = (user) => {
  const payload = {
    id: user._id || user.id,
    email: user.email,
    role: user.role,
    name: user.name
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Génère un token de rafraîchissement
 */
const generateRefreshToken = (user) => {
  const payload = {
    id: user._id || user.id,
    type: 'refresh'
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: JWT_REFRESH_EXPIRES_IN
  });
};

/**
 * Génère les deux tokens
 */
const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Calculer expiresIn en secondes
  const expiresInSeconds = parseExpiration(JWT_EXPIRES_IN);

  return {
    accessToken,
    refreshToken,
    expiresIn: expiresInSeconds
  };
};

/**
 * Vérifie un token d'accès
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Token invalide ou expiré');
  }
};

/**
 * Vérifie un token de rafraîchissement
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (error) {
    throw new Error('Refresh token invalide ou expiré');
  }
};

/**
 * Parse une durée d'expiration en secondes
 */
const parseExpiration = (expiration) => {
  const match = expiration.match(/^(\d+)([smhd])$/);
  if (!match) return 900; // 15 minutes par défaut

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case 's': return value;
    case 'm': return value * 60;
    case 'h': return value * 60 * 60;
    case 'd': return value * 60 * 60 * 24;
    default: return 900;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  generateTokens,
  verifyAccessToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
};
