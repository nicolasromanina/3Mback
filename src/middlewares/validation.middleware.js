/**
 * Middleware de validation
 */

const { z } = require('zod');

/**
 * Middleware pour valider le body avec un schéma Zod
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const messages = error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));

        return res.status(400).json({
          success: false,
          message: 'Erreur de validation',
          errors: messages
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware pour valider les paramètres d'URL
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Paramètres invalides',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

/**
 * Middleware pour valider les query parameters
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          message: 'Query parameters invalides',
          errors: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        });
      }
      next(error);
    }
  };
};

module.exports = {
  validateBody,
  validateParams,
  validateQuery
};
