/**
 * Middleware de gestion des erreurs
 */

/**
 * Handler pour les routes non trouvées
 */
const notFoundHandler = (req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route non trouvée: ${req.method} ${req.originalUrl}`
  });
};

/**
 * Handler global des erreurs
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  if (process.env.NODE_ENV === 'development') {
    console.error('Erreur:', err);
  }

  // Erreur de cast MongoDB (ID invalide)
  if (err.name === 'CastError') {
    error.message = 'Ressource non trouvée';
    error.statusCode = 404;
  }

  // Erreur de duplication MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Cette valeur existe déjà pour le champ "${field}"`;
    error.statusCode = 400;
  }

  // Erreur de validation MongoDB
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // Erreur JWT
  if (err.name === 'JsonWebTokenError') {
    error.message = 'Token invalide';
    error.statusCode = 401;
  }

  // Erreur JWT expiré
  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expiré';
    error.statusCode = 401;
  }

  // Erreur de validation Zod
  if (err.name === 'ZodError') {
    const messages = err.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    error.message = messages.join(', ');
    error.statusCode = 400;
  }

  // Erreur Multer (upload)
  if (err.code === 'LIMIT_FILE_SIZE') {
    error.message = 'Le fichier est trop volumineux';
    error.statusCode = 400;
  }

  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    error.message = 'Type de fichier non autorisé';
    error.statusCode = 400;
  }

  const statusCode = error.statusCode || err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Erreur serveur',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

/**
 * Wrapper async pour les controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Créer une erreur personnalisée
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  notFoundHandler,
  errorHandler,
  asyncHandler,
  AppError
};
