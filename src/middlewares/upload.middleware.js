/**
 * Middleware pour l'upload de fichiers - Compatible Vercel
 */

const multer = require('multer');
const path = require('path');

// Détecter l'environnement
const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
const isLocal = !isVercel;

let storage;

if (isVercel) {
  console.log('📁 Mode Vercel: Utilisation du stockage mémoire');
  
  // Stockage en mémoire pour Vercel (système de fichiers en lecture seule)
  storage = multer.memoryStorage();
} else {
  // Stockage sur disque pour le développement local
  const fs = require('fs');
  const { v4: uuidv4 } = require('uuid');
  
  console.log('📁 Mode Local: Utilisation du stockage disque');
  
  const uploadPath = process.env.UPLOAD_PATH || './uploads';
  
  // Créer le dossier uploads s'il n'existe pas (local seulement)
  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  storage = multer.diskStorage({
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
}

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
    'application/postscript',
    'image/vnd.adobe.photoshop',
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

// Utilitaire pour traiter les fichiers selon l'environnement
const processUploadedFile = (file) => {
  if (isVercel && file.buffer) {
    // Sur Vercel: fichier en mémoire
    return {
      filename: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      buffer: file.buffer,
      encoding: file.encoding,
      isInMemory: true
    };
  } else {
    // En local: fichier sur disque
    return {
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
      destination: file.destination,
      originalname: file.originalname,
      isInMemory: false
    };
  }
};

// Utilitaire pour supprimer un fichier (local seulement)
const deleteFile = (filePath) => {
  if (isVercel) {
    console.log('⚠️ Suppression de fichiers désactivée sur Vercel');
    return Promise.resolve();
  }
  
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const fullPath = path.isAbsolute(filePath) ? filePath : path.join(process.env.UPLOAD_PATH || './uploads', filePath);
    
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
  if (isVercel) {
    // Sur Vercel, utilisez un service cloud ou retournez une URL temporaire
    return `${process.env.CLOUD_STORAGE_URL || ''}/${subfolder ? subfolder + '/' : ''}${filename}`;
  } else {
    // En local: URL locale
    const baseUrl = process.env.BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
    return `${baseUrl}/uploads/${subfolder ? subfolder + '/' : ''}${filename}`;
  }
};

// Gestionnaire pour Vercel: stocke en mémoire et peut uploader vers cloud
const handleVercelUpload = async (fileBuffer, originalName) => {
  if (!isVercel) return null;
  
  // Option 1: Stocker en base64 dans MongoDB
  // Option 2: Uploader vers Cloudinary, AWS S3, etc.
  // Option 3: Retourner les infos du buffer
  
  const base64String = fileBuffer.toString('base64');
  
  return {
    filename: originalName,
    data: base64String, // Stocké en base64
    size: fileBuffer.length,
    uploadedAt: new Date()
  };
};

module.exports = {
  upload,
  uploadSingle,
  uploadMultiple,
  uploadFields,
  deleteFile,
  getFileUrl,
  processUploadedFile,
  handleVercelUpload,
  isVercel,
  isLocal
};