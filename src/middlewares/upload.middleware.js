/**
 * Middleware pour l'upload de fichiers
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Créer le dossier uploads s'il n'existe pas
const uploadPath = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subFolder = 'misc';
    
    // Déterminer le sous-dossier selon le type de fichier
    if (file.mimetype.startsWith('image/')) {
      subFolder = 'images';
    } else if (file.mimetype === 'application/pdf') {
      subFolder = 'documents';
    } else if (file.mimetype.includes('word') || file.mimetype.includes('document')) {
      subFolder = 'documents';
    }

    const destPath = path.join(uploadPath, subFolder);
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }

    cb(null, destPath);
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    const extension = path.extname(file.originalname);
    const safeName = `${uniqueId}${extension}`;
    cb(null, safeName);
  }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
  const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'pdf,doc,docx,jpg,jpeg,png,gif,ai,psd,eps,svg')
    .split(',')
    .map(type => type.trim().toLowerCase());

  const extension = path.extname(file.originalname).toLowerCase().slice(1);
  const mimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/svg+xml',
    'application/postscript', // EPS, AI
    'image/vnd.adobe.photoshop', // PSD
    'application/illustrator'
  ];

  if (allowedTypes.includes(extension) || mimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Type de fichier non autorisé: ${extension}`), false);
  }
};

// Configuration Multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB par défaut
    files: 10 // Maximum 10 fichiers à la fois
  }
});

// Middleware pour un seul fichier
const uploadSingle = (fieldName = 'file') => upload.single(fieldName);

// Middleware pour plusieurs fichiers
const uploadMultiple = (fieldName = 'files', maxCount = 10) => upload.array(fieldName, maxCount);

// Middleware pour plusieurs champs
const uploadFields = (fields) => upload.fields(fields);

// Utilitaire pour supprimer un fichier
const deleteFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(uploadPath, filePath);
    
    fs.unlink(fullPath, (err) => {
      if (err && err.code !== 'ENOENT') {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Utilitaire pour obtenir l'URL d'un fichier
const getFileUrl = (filename, subfolder = '') => {
  const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
  return `${baseUrl}/uploads/${subfolder ? subfolder + '/' : ''}${filename}`;
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileUrl
};
