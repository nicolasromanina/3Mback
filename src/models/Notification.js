/**
 * Modèle Notification
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'L\'utilisateur est requis']
  },
  title: {
    type: String,
    required: [true, 'Le titre est requis'],
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: [true, 'Le message est requis'],
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  link: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      return ret;
    }
  }
});

// Index
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ createdAt: -1 });

// Méthode pour marquer comme lue
notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

// Statique pour créer une notification
notificationSchema.statics.createNotification = async function(data) {
  const notification = new this(data);
  await notification.save();
  
  // Émettre via socket si disponible
  try {
    const { emitNotification } = require('../config/socket');
    emitNotification(data.userId.toString(), notification.toJSON());
  } catch (error) {
    // Socket non initialisé, ignorer
  }
  
  return notification;
};

module.exports = mongoose.model('Notification', notificationSchema);
