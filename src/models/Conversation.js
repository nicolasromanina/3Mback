/**
 * Modèle Conversation (Chat)
 */

const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['client', 'admin', 'employee'],
    required: true
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastSeenAt: {
    type: Date
  }
}, { _id: false });

const conversationSchema = new mongoose.Schema({
  participants: {
    type: [participantSchema],
    validate: {
      validator: function(participants) {
        return participants && participants.length >= 1;
      },
      message: 'Au moins un participant est requis'
    }
  },
  type: {
    type: String,
    enum: ['direct', 'group', 'support'],
    default: 'direct'
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastMessage: {
    type: String
  },
  lastMessageAt: {
    type: Date
  },
  unreadCount: {
    type: Map,
    of: Number,
    default: {}
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
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ orderId: 1 });
conversationSchema.index({ lastMessageAt: -1 });

module.exports = mongoose.model('Conversation', conversationSchema);
