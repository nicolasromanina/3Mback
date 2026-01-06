/**
 * Contrôleur des fichiers
 */

const path = require('path');
const fs = require('fs');
const { asyncHandler, AppError } = require('../middlewares/error.middleware');
const { getFileUrl, deleteFile } = require('../middlewares/upload.middleware');

/**
 * @route   POST /api/files/upload
 * @desc    Upload de fichiers
 * @access  Private
 */
const uploadFiles = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    throw new AppError('Aucun fichier uploadé', 400);
  }

  const files = req.files.map(file => ({
    filename: file.filename,
    originalName: file.originalname,
    mimetype: file.mimetype,
    size: file.size,
    url: getFileUrl(file.filename, file.destination.split('/').pop())
  }));

  res.status(200).json({
    success: true,
    message: 'Fichiers uploadés avec succès',
    data: files
  });
});

/**
 * @route   DELETE /api/files/:filename
 * @desc    Supprimer un fichier
 * @access  Private/Admin
 */
const removeFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  
  // Chercher dans tous les sous-dossiers
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  const subfolders = ['images', 'documents', 'misc'];
  
  let found = false;
  
  for (const subfolder of subfolders) {
    const filePath = path.join(uploadPath, subfolder, filename);
    if (fs.existsSync(filePath)) {
      await deleteFile(filePath);
      found = true;
      break;
    }
  }
  
  if (!found) {
    throw new AppError('Fichier non trouvé', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Fichier supprimé avec succès'
  });
});

/**
 * @route   GET /api/files/:filename
 * @desc    Télécharger un fichier
 * @access  Private
 */
const downloadFile = asyncHandler(async (req, res) => {
  const { filename } = req.params;
  const { subfolder = '' } = req.query;
  
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  
  // Chercher dans le sous-dossier spécifié ou dans tous
  let filePath;
  
  if (subfolder) {
    filePath = path.join(uploadPath, subfolder, filename);
  } else {
    const subfolders = ['images', 'documents', 'misc'];
    for (const folder of subfolders) {
      const testPath = path.join(uploadPath, folder, filename);
      if (fs.existsSync(testPath)) {
        filePath = testPath;
        break;
      }
    }
  }
  
  if (!filePath || !fs.existsSync(filePath)) {
    throw new AppError('Fichier non trouvé', 404);
  }

  res.download(filePath);
});

module.exports = {
  uploadFiles,
  removeFile,
  downloadFile
};
