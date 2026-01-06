/**
 * Modèle File - Pour stocker les informations des fichiers
 */

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalname: {
    type: String,
    required: true
  },
  mimetype: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  // Pour Vercel: stockage base64
  data: {
    type: String,
    required: function() {
      return this.environment === 'vercel';
    }
  },
  // Pour local: chemin du fichier
  path: {
    type: String,
    required: function() {
      return this.environment === 'local';
    }
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  environment: {
    type: String,
    enum: ['local', 'vercel'],
    default: 'local'
  },
  metadata: {
    type: Map,
    of: String
  }
}, {
  timestamps: true
});

// Index
fileSchema.index({ uploadedBy: 1 });
fileSchema.index({ createdAt: -1 });
fileSchema.index({ mimetype: 1 });

module.exports = mongoose.model('File', fileSchema);