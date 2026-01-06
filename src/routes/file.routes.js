const express = require('express');
const router = express.Router();
const { uploadSingle, processUploadedFile, handleVercelUpload, isVercel } = require('../middlewares/upload.middleware');
const File = require('../models/File'); // Créez ce modèle si nécessaire
const { protect, authorize } = require('../middlewares/auth.middleware');

// Upload single file
router.post('/upload', protect, uploadSingle, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun fichier téléchargé' 
      });
    }

    const processedFile = processUploadedFile(req.file);
    
    let savedFile;
    
    if (isVercel) {
      // Sur Vercel: stocker en base64 dans MongoDB ou upload vers cloud
      const fileData = await handleVercelUpload(req.file.buffer, req.file.originalname);
      
      // Sauvegarder dans la base de données
      savedFile = await File.create({
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        data: fileData.data, // base64
        uploadedBy: req.user.id,
        environment: 'vercel'
      });
    } else {
      // En local: sauvegarder les infos du fichier
      savedFile = await File.create({
        filename: processedFile.filename,
        path: processedFile.path,
        mimetype: processedFile.mimetype,
        size: processedFile.size,
        uploadedBy: req.user.id,
        environment: 'local'
      });
    }

    res.status(201).json({
      success: true,
      message: isVercel 
        ? 'Fichier téléchargé en mémoire (Vercel)' 
        : 'Fichier téléchargé avec succès',
      data: {
        id: savedFile._id,
        filename: savedFile.filename,
        mimetype: savedFile.mimetype,
        size: savedFile.size,
        url: isVercel 
          ? `/api/files/${savedFile._id}/download` 
          : `/uploads/${savedFile.filename}`,
        uploadedAt: savedFile.createdAt
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement',
      error: error.message 
    });
  }
});

// Télécharger un fichier
router.get('/:id/download', protect, async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    
    if (!file) {
      return res.status(404).json({ 
        success: false, 
        message: 'Fichier non trouvé' 
      });
    }

    if (file.environment === 'vercel' && file.data) {
      // Sur Vercel: fichier en base64
      const buffer = Buffer.from(file.data, 'base64');
      
      res.set({
        'Content-Type': file.mimetype,
        'Content-Length': buffer.length,
        'Content-Disposition': `attachment; filename="${file.filename}"`
      });
      
      return res.send(buffer);
    } else {
      // En local: fichier sur disque
      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ 
          success: false, 
          message: 'Fichier non trouvé sur le disque' 
        });
      }
      
      res.set({
        'Content-Type': file.mimetype,
        'Content-Length': file.size,
        'Content-Disposition': `attachment; filename="${file.filename}"`
      });
      
      return fs.createReadStream(file.path).pipe(res);
    }
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur lors du téléchargement',
      error: error.message 
    });
  }
});

module.exports = router;