const express = require('express');
const router = express.Router();
const { uploadFiles, removeFile, downloadFile } = require('../controllers/file.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { uploadMultiple } = require('../middlewares/upload.middleware');

router.post('/upload', protect, uploadMultiple('files', 10), uploadFiles);
router.delete('/:filename', protect, authorize('admin'), removeFile);
router.get('/:filename', protect, downloadFile);

module.exports = router;
