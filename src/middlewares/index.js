/**
 * Export de tous les middlewares
 */

const { protect, authorize, optionalAuth } = require('./auth.middleware');
const { errorHandler, notFoundHandler, asyncHandler, AppError } = require('./error.middleware');
const { validateBody, validateParams, validateQuery } = require('./validation.middleware');
const { upload, uploadSingle, uploadMultiple, uploadFields, deleteFile, getFileUrl } = require('./upload.middleware');

module.exports = {
  // Auth
  protect,
  authorize,
  optionalAuth,
  
  // Error
  errorHandler,
  notFoundHandler,
  asyncHandler,
  AppError,
  
  // Validation
  validateBody,
  validateParams,
  validateQuery,
  
  // Upload
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileUrl
};
