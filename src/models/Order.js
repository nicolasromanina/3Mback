/**
 * Modèle Order
 */

const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Le service est requis']
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [1, 'La quantité doit être au moins 1']
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  options: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  files: [{
    type: String
  }],
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le client est requis']
  },
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(items) {
        return items && items.length > 0;
      },
      message: 'Au moins un article est requis'
    }
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'processing', 'completed', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  dueDate: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 1000
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: String
  }],
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'transfer', 'mobile'],
    default: 'cash'
  }
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      ret.id = ret._id;
      return ret;
    }
  }
});

// Index
orderSchema.index({ client: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ dueDate: 1 });

// Générer le numéro de commande avant sauvegarde
orderSchema.pre('save', async function(next) {
  // Toujours générer un orderNumber pour les nouveaux documents
  if (this.isNew) {
    try {
      const lastOrder = await this.constructor.findOne(
        {}, 
        { orderNumber: 1 }, 
        { sort: { createdAt: -1 } }
      );
      
      let sequenceNumber = 1;
      const date = new Date();
      const year = date.getFullYear().toString().slice(-2);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      
      if (lastOrder && lastOrder.orderNumber) {
        const lastNumber = lastOrder.orderNumber.match(/\d+$/);
        if (lastNumber) {
          sequenceNumber = parseInt(lastNumber[0]) + 1;
        } else {
          const count = await this.constructor.countDocuments();
          sequenceNumber = count + 1;
        }
      }
      
      this.orderNumber = `CMD${year}${month}${String(sequenceNumber).padStart(5, '0')}`;
      console.log(`Generated order number: ${this.orderNumber}`);
    } catch (error) {
      console.error('Error generating order number:', error);
      this.orderNumber = `TEMP-${Date.now()}`;
    }
  }
  next();
});



// Méthode pour recalculer le total
orderSchema.methods.recalculateTotal = function() {
  this.totalPrice = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  return this.totalPrice;
};

// Méthode pour ajouter au historique de statut
orderSchema.methods.addStatusHistory = function(status, userId, notes = '') {
  this.statusHistory.push({
    status,
    changedBy: userId,
    notes
  });
};

// Méthode virtuelle pour le statut en français
orderSchema.virtual('statusLabel').get(function() {
  const labels = {
    draft: 'Devis',
    pending: 'En attente',
    processing: 'En cours',
    completed: 'Terminée',
    delivered: 'Livrée',
    cancelled: 'Annulée'
  };
  return labels[this.status] || this.status;
});

module.exports = mongoose.model('Order', orderSchema);
